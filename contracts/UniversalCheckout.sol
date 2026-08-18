// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title UniversalCheckout
 * @dev Multi-token payment routing and merchant stablecoin settlement engine.
 */
contract UniversalCheckout {
    address public owner;
    uint256 public feeBps = 25; // 0.25% protocol fee

    struct MerchantAccount {
        address preferredStablecoin;
        uint256 totalVolumeUsd;
        bool isActive;
    }

    mapping(address => MerchantAccount) public merchants;

    event PaymentProcessed(
        bytes32 indexed invoiceId,
        address indexed merchant,
        address indexed payer,
        address inputToken,
        uint256 inputAmount,
        uint256 merchantPayoutUsd
    );

    constructor() {
        owner = msg.sender;
    }

    function registerMerchant(address preferredStablecoin) external {
        merchants[msg.sender] = MerchantAccount({
            preferredStablecoin: preferredStablecoin,
            totalVolumeUsd: 0,
            isActive: true
        });
    }

    function payInvoice(
        bytes32 invoiceId,
        address merchant,
        address inputToken,
        uint256 inputAmount,
        uint256 expectedPayoutUsd
    ) external payable {
        require(merchants[merchant].isActive, "Checkout: merchant not registered");

        if (inputToken == address(0)) {
            require(msg.value == inputAmount, "Checkout: incorrect ETH value");
            payable(merchant).transfer(msg.value);
        } else {
            IERC20(inputToken).transferFrom(msg.sender, merchant, inputAmount);
        }

        merchants[merchant].totalVolumeUsd += expectedPayoutUsd;

        emit PaymentProcessed(
            invoiceId,
            merchant,
            msg.sender,
            inputToken,
            inputAmount,
            expectedPayoutUsd
        );
    }
}
