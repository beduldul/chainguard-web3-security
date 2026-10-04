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

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "Payroll: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    constructor() {
        owner = msg.sender;
    }

    function disburseBatch(
        bytes32 batchId,
        address token,
        address[] calldata recipients,
        uint256[] calldata amounts
    ) external payable nonReentrant {
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
            for (uint256 i = 0; i < recipients.length; i++) {
                _safeTransferFrom(token, msg.sender, recipients[i], amounts[i]);
            }
        }

        emit BatchDisbursed(batchId, token, total, recipients.length);
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "Payroll: ERC20 transferFrom failed");
    }

    /// @dev True for no data (token returns nothing) or a 32-byte word equal to 1.
    /// Any other return — `false`, a non-boolean word, or a malformed length — is failure.
    function _tokenReturnedTrue(bytes memory data) internal pure returns (bool) {
        if (data.length == 0) {
            return true;
        }
        if (data.length != 32) {
            return false;
        }
        uint256 word;
        // solhint-disable-next-line no-inline-assembly
        assembly {
            word := mload(add(data, 0x20))
        }
        return word == 1;
    }
}
