// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../UniversalCheckout.sol";
import "./TestHelpers.sol";

contract UniversalCheckoutTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    UniversalCheckout public checkout;
    address public merchant = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public usdcToken = address(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);

    function setUp() public {
        checkout = new UniversalCheckout();
    }

    receive() external payable {}

    function testRegisterMerchant() public {
        checkout.registerMerchant(usdcToken);
        (address preferred, uint256 volume, bool active) = checkout.merchants(address(this));

        require(preferred == usdcToken, "Token mismatch");
        require(volume == 0, "Volume mismatch");
        require(active == true, "Active mismatch");
    }

    function testPayInvoiceEthTransfersAndAccruesVolume() public payable {
        vm.prank(merchant);
        checkout.registerMerchant(usdcToken);
        bytes32 invoiceId = bytes32("inv-001");

        checkout.payInvoice{value: 500}(invoiceId, merchant, address(0), 500, 500);

        (, uint256 volume, ) = checkout.merchants(merchant);
        require(volume == 500, "Volume mismatch");
        require(merchant.balance == 500, "Merchant not paid");
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

        require(token.balanceOf(merchant) == 1000, "Merchant not paid");
        require(token.balanceOf(address(this)) == 0, "Payer not debited");
        (, uint256 volume, ) = checkout.merchants(merchant);
        require(volume == 1000, "Volume mismatch");
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
}
