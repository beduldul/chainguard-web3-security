// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OnchainCreditScore
 * @dev Verifiable credential registry storing credit ratings and loan collateral discounts.
 */
contract OnchainCreditScore {
    address public owner;

    struct CreditCredential {
        uint256 score; // 0 - 100
        string ratingTier; // "EXCELLENT", "GOOD", "FAIR"
        uint256 walletAgeDays;
        uint256 successfulRepayments;
        uint256 issuedAt;
    }

    mapping(address => CreditCredential) public credentials;

    event CreditScoreUpdated(address indexed wallet, uint256 score, string ratingTier);

    modifier onlyOwner() {
        require(msg.sender == owner, "CreditScore: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function issueCredential(
        address wallet,
        uint256 score,
        string calldata ratingTier,
        uint256 walletAgeDays,
        uint256 successfulRepayments
    ) external onlyOwner {
        require(score <= 100, "CreditScore: score max 100");

        credentials[wallet] = CreditCredential({
            score: score,
            ratingTier: ratingTier,
            walletAgeDays: walletAgeDays,
            successfulRepayments: successfulRepayments,
            issuedAt: block.timestamp
        });

        emit CreditScoreUpdated(wallet, score, ratingTier);
    }
}
