// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../RecurringBilling.sol";
import "./TestHelpers.sol";

contract RecurringBillingTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    RecurringBilling public billing;
    MockERC20 public token;
    address public merchant = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public stranger = address(uint160(0xBEEF));
    bytes32 public subId = bytes32("sub-001");

    event SubscriptionCreated(bytes32 indexed subId, address indexed subscriber, address indexed merchant, uint256 amountUsdc);
    event SubscriptionBilled(bytes32 indexed subId, uint256 timestamp);
    event SubscriptionCancelled(bytes32 indexed subId);

    function setUp() public {
        billing = new RecurringBilling();
        token = new MockERC20();
        token.mint(address(this), 100_000_000);
        token.approve(address(billing), type(uint256).max);
    }

    function testCreateSubscription() public {
        vm.expectEmit(true, true, true, true);
        emit SubscriptionCreated(subId, address(this), merchant, 29990000);
        billing.createSubscription(subId, merchant, address(token), 29990000, 30 days);

        (address sub, address mer, address tok, uint256 amt, uint256 interval, , bool active) =
            billing.subscriptions(subId);

        require(sub == address(this), "Subscriber mismatch");
        require(mer == merchant, "Merchant mismatch");
        require(tok == address(token), "Token mismatch");
        require(amt == 29990000, "Amount mismatch");
        require(interval == 30 days, "Interval mismatch");
        require(active == true, "Active mismatch");
    }

    function testCreateSubscriptionRevertsForZeroMerchant() public {
        vm.expectRevert("RecurringBilling: invalid merchant");
        billing.createSubscription(subId, address(0), address(token), 1, 30 days);
    }

    function testCreateSubscriptionRevertsForZeroToken() public {
        vm.expectRevert("RecurringBilling: invalid token");
        billing.createSubscription(subId, merchant, address(0), 1, 30 days);
    }

    function testCreateSubscriptionRevertsForZeroAmount() public {
        vm.expectRevert("RecurringBilling: amount must be positive");
        billing.createSubscription(subId, merchant, address(token), 0, 30 days);
    }

    function testCreateSubscriptionRevertsForZeroInterval() public {
        vm.expectRevert("RecurringBilling: interval must be positive");
        billing.createSubscription(subId, merchant, address(token), 1, 0);
    }

    function testProcessBillingPullsFundsAfterInterval() public {
        billing.createSubscription(subId, merchant, address(token), 29990000, 30 days);

        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);

        vm.expectEmit(true, false, false, true);
        emit SubscriptionBilled(subId, block.timestamp);
        billing.processBilling(subId);

        require(token.balanceOf(merchant) == 29990000, "Merchant not paid");
        require(token.balanceOf(address(this)) == 100_000_000 - 29990000, "Subscriber not debited");

        (, , , , , uint256 lastBilledAt, ) = billing.subscriptions(subId);
        require(lastBilledAt == block.timestamp, "Timestamp not advanced");
    }

    function testProcessBillingRevertsBeforeIntervalElapsed() public {
        billing.createSubscription(subId, merchant, address(token), 29990000, 30 days);

        vm.expectRevert("RecurringBilling: interval has not elapsed");
        billing.processBilling(subId);

        require(token.balanceOf(merchant) == 0, "No funds may move before the interval");
    }

    function testProcessBillingRevertsForUnknownSubscription() public {
        vm.expectRevert("RecurringBilling: subscription is not active");
        billing.processBilling(bytes32("unknown"));
    }

    function testProcessBillingRevertsAfterCancel() public {
        billing.createSubscription(subId, merchant, address(token), 29990000, 30 days);
        billing.cancelSubscription(subId);
        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);

        vm.expectRevert("RecurringBilling: subscription is not active");
        billing.processBilling(subId);

        require(token.balanceOf(merchant) == 0, "Cancelled subscription must not move funds");
    }

    function testProcessBillingCanBillRepeatedlyEachInterval() public {
        billing.createSubscription(subId, merchant, address(token), 100, 30 days);

        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);
        billing.processBilling(subId);

        vm.expectRevert("RecurringBilling: interval has not elapsed");
        billing.processBilling(subId);

        uint256 secondBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(secondBillAt);
        billing.processBilling(subId);

        require(token.balanceOf(merchant) == 200, "Merchant must be paid twice");
    }

    function testProcessBillingRevertsWhenErc20ReturnsFalse() public {
        FalseReturnERC20 bad = new FalseReturnERC20();
        billing.createSubscription(subId, merchant, address(bad), 100, 30 days);
        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);

        vm.expectRevert("RecurringBilling: ERC20 transferFrom failed");
        billing.processBilling(subId);
    }

    function testProcessBillingRevertsWhenErc20TransferFromReverts() public {
        RevertingERC20 bad = new RevertingERC20();
        billing.createSubscription(subId, merchant, address(bad), 100, 30 days);
        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);

        vm.expectRevert("RecurringBilling: ERC20 transferFrom failed");
        billing.processBilling(subId);
    }

    function testProcessBillingIsReentrancySafe() public {
        ReentrantERC20 reentrantToken = new ReentrantERC20();
        reentrantToken.mint(address(this), 1_000_000);
        reentrantToken.approve(address(billing), 1_000_000);
        reentrantToken.mint(address(reentrantToken), 1_000_000);
        reentrantToken.selfApprove(address(billing), 1_000_000);

        billing.createSubscription(subId, merchant, address(reentrantToken), 100, 30 days);
        uint256 nextBillAt = vm.getBlockTimestamp() + 30 days;
        vm.warp(nextBillAt);

        bytes memory payload = abi.encodeWithSignature("processBilling(bytes32)", subId);
        reentrantToken.configure(address(billing), payload);

        billing.processBilling(subId);

        require(reentrantToken.reentrySucceeded() == false, "Reentrant processBilling must not succeed");
        require(reentrantToken.balanceOf(merchant) == 100, "Merchant must be paid exactly once");
    }

    function testCancelSubscriptionEmitsAndDeactivates() public {
        billing.createSubscription(subId, merchant, address(token), 100, 30 days);

        vm.expectEmit(true, false, false, true);
        emit SubscriptionCancelled(subId);
        billing.cancelSubscription(subId);

        (, , , , , , bool active) = billing.subscriptions(subId);
        require(active == false, "Subscription still active");
    }

    function testCancelSubscriptionRevertsForNonSubscriber() public {
        billing.createSubscription(subId, merchant, address(token), 100, 30 days);

        vm.prank(stranger);
        vm.expectRevert("RecurringBilling: caller is not subscriber");
        billing.cancelSubscription(subId);

        (, , , , , , bool active) = billing.subscriptions(subId);
        require(active == true, "Unauthorized cancel must not persist");
    }
}
