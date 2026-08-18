// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title CryptoPayroll
 * @dev Batch disbursal smart contract executing corporate salary payouts in a single transaction.
 */
contract CryptoPayroll {
    address public owner;

    event BatchDisbursed(
        bytes32 indexed batchId,
        address token,
        uint256 totalAmount,
        uint256 recipientsCount
    );

    constructor() {
        owner = msg.sender;
    }

    function disburseBatch(
        bytes32 batchId,
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable {
        require(recipients.length == amounts.length, "Payroll: length mismatch");
        require(recipients.length > 0, "Payroll: no recipients");

        uint256 total = 0;
        for (uint256 i = 0; i < amounts.length; i++) {
            total += amounts[i];
        }

        if (token == address(0)) {
            require(msg.value == total, "Payroll: incorrect ETH value");
            for (uint256 i = 0; i < recipients.length; i++) {
                payable(recipients[i]).transfer(amounts[i]);
            }
        } else {
            IERC20 erc20 = IERC20(token);
            for (uint256 i = 0; i < recipients.length; i++) {
                erc20.transferFrom(msg.sender, recipients[i], amounts[i]);
            }
        }

        emit BatchDisbursed(batchId, token, total, recipients.length);
    }
}
