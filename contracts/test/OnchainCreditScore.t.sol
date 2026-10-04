// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OnchainCreditScore.sol";
import "./TestHelpers.sol";

contract OnchainCreditScoreTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    OnchainCreditScore public creditScore;
    address public userWallet = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public stranger = address(uint160(0xBEEF));

    event CreditScoreUpdated(address indexed wallet, uint256 score, string ratingTier);

    function setUp() public {
        creditScore = new OnchainCreditScore();
    }

    function testIssueCredential() public {
        vm.expectEmit(true, false, false, true);
        emit CreditScoreUpdated(userWallet, 92, "EXCELLENT");
        creditScore.issueCredential(
            userWallet,
            92,
            "EXCELLENT",
            1500,
            36
        );

        (uint256 score, string memory tier, uint256 ageDays, uint256 repayments, ) = creditScore.credentials(userWallet);

        require(score == 92, "Score check failed");
        require(keccak256(bytes(tier)) == keccak256(bytes("EXCELLENT")), "Tier check failed");
        require(ageDays == 1500, "Age check failed");
        require(repayments == 36, "Repayments check failed");
    }

    function testConstructorSetsOwner() public view {
        require(creditScore.owner() == address(this), "Owner mismatch");
    }

    function testIssueCredentialRevertsForNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert("CreditScore: caller is not owner");
        creditScore.issueCredential(userWallet, 92, "EXCELLENT", 1500, 36);

        (uint256 score, , , , ) = creditScore.credentials(userWallet);
        require(score == 0, "Unauthorized write must not persist");
    }

    function testIssueCredentialRevertsAboveMaxScore() public {
        vm.expectRevert("CreditScore: score max 100");
        creditScore.issueCredential(userWallet, 101, "EXCELLENT", 1500, 36);
    }

    function testIssueCredentialAcceptsBoundaryScores() public {
        creditScore.issueCredential(userWallet, 0, "POOR", 0, 0);
        (uint256 zeroScore, string memory zeroTier, , , uint256 zeroIssuedAt) = creditScore.credentials(userWallet);
        require(zeroScore == 0, "Zero score mismatch");
        require(keccak256(bytes(zeroTier)) == keccak256(bytes("POOR")), "Zero tier mismatch");
        require(zeroIssuedAt == block.timestamp, "Issued-at mismatch");

        creditScore.issueCredential(stranger, 100, "EXCELLENT", 1, 1);
        (uint256 maxScore, , , , ) = creditScore.credentials(stranger);
        require(maxScore == 100, "Max score mismatch");
    }

    function testIssueCredentialAcceptsZeroAddressAndEmptyTier() public {
        // Documented behaviour: the registry does not validate the wallet or tier string.
        creditScore.issueCredential(address(0), 50, "", 10, 2);

        (uint256 score, string memory tier, , , ) = creditScore.credentials(address(0));
        require(score == 50, "Score mismatch");
        require(bytes(tier).length == 0, "Tier mismatch");
    }

    function testIssueCredentialOverwritesPreviousCredential() public {
        creditScore.issueCredential(userWallet, 40, "FAIR", 100, 3);
        creditScore.issueCredential(userWallet, 95, "EXCELLENT", 400, 20);

        (uint256 score, string memory tier, uint256 ageDays, uint256 repayments, ) = creditScore.credentials(userWallet);
        require(score == 95, "Score not overwritten");
        require(keccak256(bytes(tier)) == keccak256(bytes("EXCELLENT")), "Tier not overwritten");
        require(ageDays == 400, "Age not overwritten");
        require(repayments == 20, "Repayments not overwritten");
    }

    function testCredentialsForUnknownWalletAreEmpty() public view {
        (uint256 score, string memory tier, uint256 ageDays, uint256 repayments, uint256 issuedAt) =
            creditScore.credentials(address(uint160(0x1234)));
        require(score == 0, "Score mismatch");
        require(bytes(tier).length == 0, "Tier mismatch");
        require(ageDays == 0, "Age mismatch");
        require(repayments == 0, "Repayments mismatch");
        require(issuedAt == 0, "Issued-at mismatch");
    }
}
