// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../UniversalCheckout.sol";

contract UniversalCheckoutTest {
    UniversalCheckout public checkout;
    address public merchant = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public usdcToken = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    function setUp() public {
        checkout = new UniversalCheckout();
    }

    function testRegisterMerchant() public {
        checkout.registerMerchant(usdcToken);
        (address preferred, uint256 volume, bool active) = checkout.merchants(address(this));

        require(preferred == usdcToken, "Token mismatch");
        require(volume == 0, "Volume mismatch");
        require(active == true, "Active mismatch");
    }
}
