// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OnchainCreditScore.sol";

contract OnchainCreditScoreTest {
    OnchainCreditScore public creditScore;
    address public userWallet = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);

    function setUp() public {
        creditScore = new OnchainCreditScore();
    }

    function testIssueCredential() public {
        creditScore.issueCredential(
            userWallet,
            92,
            "EXCELLENT",
            1500,
            36
        );

        (uint256 score, string memory tier, uint256 ageDays, uint256 repayments, ) = creditScore.credentials(userWallet);

        require(score == 92, "Score check failed");
        require(ageDays == 1500, "Age check failed");
        require(repayments == 36, "Repayments check failed");
    }
}
