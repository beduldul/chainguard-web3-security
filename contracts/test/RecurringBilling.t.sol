// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../RecurringBilling.sol";

contract RecurringBillingTest {
    RecurringBilling public billing;
    address public merchant = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);

    function setUp() public {
        billing = new RecurringBilling();
    }

    function testCreateSubscription() public {
        bytes32 subId = bytes32("sub-001");
        billing.createSubscription(subId, merchant, 29990000, 30 days);

        (address sub, address mer, uint256 amt, uint256 interval, , bool active) = billing.subscriptions(subId);

        require(sub == address(this), "Subscriber mismatch");
        require(mer == merchant, "Merchant mismatch");
        require(amt == 29990000, "Amount mismatch");
        require(active == true, "Active mismatch");
    }
}
