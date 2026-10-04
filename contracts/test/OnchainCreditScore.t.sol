// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../OnchainCreditScore.sol";
import "./TestHelpers.sol";

contract OnchainCreditScoreTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    OnchainCreditScore public creditScore;
    MockERC20 public token;
    address public userWallet = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public stranger = address(uint160(0xBEEF));

    event CreditScoreUpdated(address indexed wallet, uint256 score, string ratingTier);
    event CollateralStaked(address indexed wallet, address indexed token, uint256 amount);
    event CollateralWithdrawn(address indexed wallet, address indexed token, uint256 amount);

    function setUp() public {
        creditScore = new OnchainCreditScore();
        token = new MockERC20();
        token.mint(userWallet, 1_000_000);
        vm.prank(userWallet);
        token.approve(address(creditScore), type(uint256).max);
    }

    function _stake(uint256 amount) internal {
        vm.prank(userWallet);
        creditScore.stakeCollateral(address(token), amount);
    }

    function testIssueCredential() public {
        _stake(500);

        vm.expectEmit(true, false, false, true);
        emit CreditScoreUpdated(userWallet, 92, "EXCELLENT");
        creditScore.issueCredential(userWallet, 92, "EXCELLENT", 1500, 36, 500);

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
        _stake(500);

        vm.prank(stranger);
        vm.expectRevert("CreditScore: caller is not owner");
        creditScore.issueCredential(userWallet, 92, "EXCELLENT", 1500, 36, 500);

        (uint256 score, , , , ) = creditScore.credentials(userWallet);
        require(score == 0, "Unauthorized write must not persist");
    }

    function testIssueCredentialRevertsAboveMaxScore() public {
        _stake(500);

        vm.expectRevert("CreditScore: score max 100");
        creditScore.issueCredential(userWallet, 101, "EXCELLENT", 1500, 36, 500);
    }

    function testIssueCredentialRevertsWithoutCollateral() public {
        vm.expectRevert("CreditScore: insufficient collateral");
        creditScore.issueCredential(userWallet, 50, "FAIR", 10, 1, 1);
    }

    function testIssueCredentialRevertsWhenCollateralBelowRequired() public {
        _stake(499);

        vm.expectRevert("CreditScore: insufficient collateral");
        creditScore.issueCredential(userWallet, 50, "FAIR", 10, 1, 500);
    }

    function testIssueCredentialAcceptsBoundaryScores() public {
        _stake(1);
        creditScore.issueCredential(userWallet, 0, "POOR", 0, 0, 1);
        (uint256 zeroScore, string memory zeroTier, , , uint256 zeroIssuedAt) = creditScore.credentials(userWallet);
        require(zeroScore == 0, "Zero score mismatch");
        require(keccak256(bytes(zeroTier)) == keccak256(bytes("POOR")), "Zero tier mismatch");
        require(zeroIssuedAt == block.timestamp, "Issued-at mismatch");

        _stake(1);
        creditScore.issueCredential(userWallet, 100, "EXCELLENT", 1, 1, 2);
        (uint256 maxScore, , , , ) = creditScore.credentials(userWallet);
        require(maxScore == 100, "Max score mismatch");
    }

    function testStakeCollateralPullsFundsAndEmits() public {
        vm.expectEmit(true, true, false, true);
        emit CollateralStaked(userWallet, address(token), 500);
        _stake(500);

        require(creditScore.stakedAmount(userWallet) == 500, "Stake not recorded");
        require(creditScore.stakeToken(userWallet) == address(token), "Stake token mismatch");
        require(token.balanceOf(address(creditScore)) == 500, "Collateral not custodied");
        require(token.balanceOf(userWallet) == 1_000_000 - 500, "Staker not debited");
    }

    function testStakeCollateralAccumulates() public {
        _stake(100);
        _stake(50);

        require(creditScore.stakedAmount(userWallet) == 150, "Stake must accumulate");
    }

    function testStakeCollateralRevertsForZeroToken() public {
        vm.prank(userWallet);
        vm.expectRevert("CreditScore: invalid token");
        creditScore.stakeCollateral(address(0), 100);
    }

    function testStakeCollateralRevertsForZeroAmount() public {
        vm.prank(userWallet);
        vm.expectRevert("CreditScore: amount must be positive");
        creditScore.stakeCollateral(address(token), 0);
    }

    function testStakeCollateralRevertsOnTokenSwitch() public {
        _stake(100);

        MockERC20 other = new MockERC20();
        other.mint(userWallet, 100);
        vm.prank(userWallet);
        other.approve(address(creditScore), 100);

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: collateral token mismatch");
        creditScore.stakeCollateral(address(other), 100);
    }

    function testStakeCollateralRevertsWhenTransferFromFails() public {
        FalseReturnERC20 bad = new FalseReturnERC20();

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: ERC20 transferFrom failed");
        creditScore.stakeCollateral(address(bad), 100);
    }

    function testWithdrawCollateralReturnsFundsAndEmits() public {
        _stake(500);

        uint256 before = token.balanceOf(userWallet);
        vm.expectEmit(true, true, false, true);
        emit CollateralWithdrawn(userWallet, address(token), 500);
        vm.prank(userWallet);
        creditScore.withdrawCollateral();

        require(creditScore.stakedAmount(userWallet) == 0, "Stake not cleared");
        require(token.balanceOf(userWallet) == before + 500, "Collateral not returned");
        require(token.balanceOf(address(creditScore)) == 0, "Contract must hold nothing");
    }

    function testWithdrawCollateralRevertsWithNoStake() public {
        vm.prank(userWallet);
        vm.expectRevert("CreditScore: no stake to withdraw");
        creditScore.withdrawCollateral();
    }

    function testWithdrawCollateralRevertsWhileScoreOutstanding() public {
        _stake(500);
        creditScore.issueCredential(userWallet, 50, "FAIR", 10, 1, 500);

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: score must be cleared");
        creditScore.withdrawCollateral();

        require(creditScore.stakedAmount(userWallet) == 500, "Stake must remain locked");
    }

    function testWithdrawCollateralAllowedAfterScoreCleared() public {
        _stake(500);
        creditScore.issueCredential(userWallet, 50, "FAIR", 10, 1, 500);

        // Writer clears the score, then the owner can withdraw.
        creditScore.issueCredential(userWallet, 0, "POOR", 10, 1, 500);
        vm.prank(userWallet);
        creditScore.withdrawCollateral();

        require(creditScore.stakedAmount(userWallet) == 0, "Stake not cleared");
    }

    function testWithdrawCollateralRevertsForNonOwner() public {
        _stake(500);
        creditScore.issueCredential(userWallet, 0, "POOR", 10, 1, 500);

        vm.prank(stranger);
        vm.expectRevert("CreditScore: no stake to withdraw");
        creditScore.withdrawCollateral();

        require(creditScore.stakedAmount(userWallet) == 500, "Stake must remain");
    }

    function testWithdrawCollateralIsReentrancySafe() public {
        ReentrantERC20 reentrant = new ReentrantERC20();
        reentrant.mint(userWallet, 100);
        vm.prank(userWallet);
        reentrant.approve(address(creditScore), 100);

        vm.prank(userWallet);
        creditScore.stakeCollateral(address(reentrant), 100);

        bytes memory payload = abi.encodeWithSignature("withdrawCollateral()");
        reentrant.configure(address(creditScore), payload);

        vm.prank(userWallet);
        creditScore.withdrawCollateral();

        require(!reentrant.reentrySucceeded(), "Reentrant withdraw must not succeed");
        require(creditScore.stakedAmount(userWallet) == 0, "Stake must be cleared exactly once");
        require(reentrant.balanceOf(userWallet) == 100, "Staker must be refunded exactly once");
    }

    function testWithdrawCollateralRevertsWhenTransferFails() public {
        TransferFailsERC20 bad = new TransferFailsERC20();
        bad.mint(userWallet, 100);
        vm.prank(userWallet);
        bad.approve(address(creditScore), 100);

        vm.prank(userWallet);
        creditScore.stakeCollateral(address(bad), 100);

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: ERC20 transfer failed");
        creditScore.withdrawCollateral();
    }

    function testIssueCredentialOverwritesPreviousCredential() public {
        _stake(500);
        creditScore.issueCredential(userWallet, 40, "FAIR", 100, 3, 500);
        creditScore.issueCredential(userWallet, 95, "EXCELLENT", 400, 20, 500);

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

    function testStakeCollateralRevertsOnNonBooleanReturn() public {
        NonBooleanERC20 bad = new NonBooleanERC20();

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: ERC20 transferFrom failed");
        creditScore.stakeCollateral(address(bad), 100);
    }

    function testWithdrawCollateralRevertsOnNonBooleanReturn() public {
        NonBooleanOnTransferERC20 bad = new NonBooleanOnTransferERC20();
        bad.mint(userWallet, 100);
        vm.prank(userWallet);
        bad.approve(address(creditScore), 100);

        vm.prank(userWallet);
        creditScore.stakeCollateral(address(bad), 100);

        vm.prank(userWallet);
        vm.expectRevert("CreditScore: ERC20 transfer failed");
        creditScore.withdrawCollateral();
    }
}
