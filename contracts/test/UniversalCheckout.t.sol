// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../UniversalCheckout.sol";
import "./TestHelpers.sol";

contract UniversalCheckoutTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    UniversalCheckout public checkout;
    address public merchant = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public usdcToken = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
    address public feeRecipient = address(uint160(0xFEE));

    event PaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed merchant,
        address indexed payer,
        address inputToken,
        uint256 inputAmount,
        uint256 merchantPayoutUsd
    );
    event FeeBpsUpdated(uint256 feeBps);
    event FeeRecipientUpdated(address indexed feeRecipient);

    function setUp() public {
        checkout = new UniversalCheckout(feeRecipient);
    }

    receive() external payable {}

    function testRegisterMerchant() public {
        checkout.registerMerchant(usdcToken);
        (address preferred, uint256 volume, bool active) = checkout.merchants(address(this));

        require(preferred == usdcToken, "Token mismatch");
        require(volume == 0, "Volume mismatch");
        require(active == true, "Active mismatch");
    }

    function testConstructorRevertsOnZeroFeeRecipient() public {
        vm.expectRevert("Checkout: invalid fee recipient");
        new UniversalCheckout(address(0));
    }

    function testPayInvoiceEthTransfersAndAccruesVolume() public payable {
        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);
        bytes32 invoiceId = bytes32("inv-001");

        vm.expectEmit(true, true, true, true);
        emit PaymentProcessed(invoiceId, merchant, address(this), address(0), 500, 500);
        checkout.payInvoice{value: 500}(invoiceId, merchant, address(0), 500, 500);

        (, uint256 volume, ) = checkout.merchants(merchant);
        require(volume == 500, "Volume mismatch");
        // feeBps = 25 => fee = 500 * 25 / 10000 = 1 (rounded down); merchant keeps 499.
        require(merchant.balance == 499, "Merchant not paid net of fee");
        require(feeRecipient.balance == 1, "Fee recipient not paid");
        require(address(checkout).balance == 0, "Checkout should hold no ETH");
    }

    function testPayInvoiceRevertsForUnregisteredMerchant() public {
        bytes32 invoiceId = bytes32("inv-002");

        vm.expectRevert("Checkout: merchant not registered");
        checkout.payInvoice{value: 500}(invoiceId, merchant, address(0), 500, 500);
    }

    function testPayInvoiceRevertsForZeroMerchant() public {
        bytes32 invoiceId = bytes32("inv-003");

        vm.expectRevert("Checkout: invalid merchant");
        checkout.payInvoice{value: 500}(invoiceId, address(0), address(0), 500, 500);
    }

    function testPayInvoiceRevertsOnIncorrectEthValue() public {
        checkout.registerMerchant(usdcToken);

        vm.expectRevert("Checkout: incorrect ETH value");
        checkout.payInvoice{value: 499}(bytes32("inv-004"), address(this), address(0), 500, 500);
    }

    function testPayInvoiceErc20PullsFunds() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 1000);
        token.approve(address(checkout), 1000);

        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);

        checkout.payInvoice(bytes32("inv-005"), merchant, address(token), 1000, 1000);

        // 1000 * 25 / 10000 = 2 fee; merchant gets 998.
        require(token.balanceOf(merchant) == 998, "Merchant not paid net of fee");
        require(token.balanceOf(feeRecipient) == 2, "Fee recipient not paid");
        require(token.balanceOf(address(this)) == 0, "Payer not debited");
        (, uint256 volume, ) = checkout.merchants(merchant);
        require(volume == 1000, "Volume mismatch");
    }

    function testPayInvoiceFeeRoundsInFavourOfMerchant() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 199);
        token.approve(address(checkout), 199);

        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);

        // 199 * 25 / 10000 = 0 (0.4975 rounds down) => merchant keeps the full 199.
        checkout.payInvoice(bytes32("inv-round"), merchant, address(token), 199, 199);

        require(token.balanceOf(merchant) == 199, "Remainder must stay with merchant");
        require(token.balanceOf(feeRecipient) == 0, "Fee must round down to zero");
    }

    function testPayInvoiceZeroFeeForwardsFullAmount() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 1000);
        token.approve(address(checkout), 1000);

        checkout.setFeeBps(0);

        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);

        checkout.payInvoice(bytes32("inv-zero"), merchant, address(token), 1000, 1000);

        require(token.balanceOf(merchant) == 1000, "Merchant must receive full amount at zero fee");
        require(token.balanceOf(feeRecipient) == 0, "No fee expected at zero fee");
    }

    function testSetFeeBpsUpdatesAndEmits() public {
        vm.expectEmit(false, false, false, true);
        emit FeeBpsUpdated(100);
        checkout.setFeeBps(100);

        require(checkout.feeBps() == 100, "Fee not updated");
    }

    function testSetFeeBpsRevertsAboveCap() public {
        vm.expectRevert("Checkout: fee too high");
        checkout.setFeeBps(1001);
    }

    function testSetFeeBpsRevertsForNonOwner() public {
        vm.prank(merchant);
        vm.expectRevert("Checkout: caller is not owner");
        checkout.setFeeBps(100);

        require(checkout.feeBps() == 25, "Unauthorized fee change must not persist");
    }

    function testSetFeeRecipientUpdatesAndEmits() public {
        address newRecipient = address(uint160(0xCAFE));

        vm.expectEmit(true, false, false, false);
        emit FeeRecipientUpdated(newRecipient);
        checkout.setFeeRecipient(newRecipient);

        require(checkout.feeRecipient() == newRecipient, "Recipient not updated");
    }

    function testSetFeeRecipientRevertsForZeroAddress() public {
        vm.expectRevert("Checkout: invalid fee recipient");
        checkout.setFeeRecipient(address(0));
    }

    function testSetFeeRecipientRevertsForNonOwner() public {
        vm.prank(merchant);
        vm.expectRevert("Checkout: caller is not owner");
        checkout.setFeeRecipient(address(uint160(0xCAFE)));

        require(checkout.feeRecipient() == feeRecipient, "Unauthorized recipient change must not persist");
    }

    function testPayInvoiceRevertsWhenErc20ReturnsFalse() public {
        FalseReturnERC20 token = new FalseReturnERC20();
        checkout.registerMerchant(usdcToken);

        vm.expectRevert("Checkout: ERC20 transferFrom failed");
        checkout.payInvoice(bytes32("inv-006"), address(this), address(token), 1000, 1000);
    }

    function testPayInvoiceRevertsWhenErc20TransferFromReverts() public {
        RevertingERC20 token = new RevertingERC20();
        checkout.registerMerchant(usdcToken);

        vm.expectRevert("Checkout: ERC20 transferFrom failed");
        checkout.payInvoice(bytes32("inv-007"), address(this), address(token), 1000, 1000);
    }

    function testPayInvoiceIsReentrancySafe() public {
        ReentrantERC20 token = new ReentrantERC20();
        token.mint(address(this), 1_000_000);
        token.approve(address(checkout), 1_000_000);
        // Fund the token so it can pay for a re-entrant invoice itself.
        token.mint(address(token), 1_000_000);
        token.selfApprove(address(checkout), 1_000_000);

        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);

        bytes32 invoiceId = bytes32("inv-reentrant");
        bytes memory payload = abi.encodeWithSignature(
            "payInvoice(bytes32,address,address,uint256,uint256)",
            bytes32("inv-inner"),
            merchant,
            address(token),
            1000,
            1000
        );
        token.configure(address(checkout), payload);

        checkout.payInvoice(invoiceId, merchant, address(token), 1000, 1000);

        require(token.reentrySucceeded() == false, "Reentrant payInvoice must not succeed");
        (, uint256 volume, ) = checkout.merchants(merchant);
        require(volume == 1000, "Volume must be credited exactly once");
    }

    function testPayInvoiceRevertsOnNonBooleanReturn() public {
        NonBooleanERC20 token = new NonBooleanERC20();

        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);

        vm.expectRevert("Checkout: ERC20 transferFrom failed");
        checkout.payInvoice(bytes32("inv-008"), merchant, address(token), 1000, 1000);
    }
}
