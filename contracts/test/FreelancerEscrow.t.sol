// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../FreelancerEscrow.sol";
import "./TestHelpers.sol";

contract FreelancerEscrowTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    FreelancerEscrow public escrow;
    address public freelancer = address(uint160(0xFACE));
    address public stranger = address(uint160(0xBEEF));
    bytes32 public jobId = bytes32("job-001");

    event EscrowCreated(bytes32 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event EscrowAccepted(bytes32 indexed jobId, address indexed freelancer);
    event EscrowCancelled(bytes32 indexed jobId, uint256 refundedAmount);
    event MilestoneDelivered(bytes32 indexed jobId, uint256 milestoneIndex);
    event MilestoneDisputed(bytes32 indexed jobId, uint256 milestoneIndex);
    event MilestoneReleased(bytes32 indexed jobId, uint256 milestoneIndex, uint256 amount);

    function setUp() public {
        escrow = new FreelancerEscrow();
    }

    /// @dev The client is this test contract, so it must accept ETH refunds.
    receive() external payable {}

    function _twoMilestones() internal pure returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100;
        amounts[1] = 200;
        return amounts;
    }

    function _createAndAcceptEth() internal {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);
    }

    function testCreateEscrowEthStoresAgreement() public payable {
        uint256[] memory amounts = _twoMilestones();

        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(jobId, address(this), freelancer, 300);
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        (address client, address fl, address token, uint256 total, bool completed, bool accepted, bool cancelled) =
            escrow.agreements(jobId);
        require(client == address(this), "Client mismatch");
        require(fl == freelancer, "Freelancer mismatch");
        require(token == address(0), "Token mismatch");
        require(total == 300, "Total mismatch");
        require(completed == false, "Completed mismatch");
        require(accepted == false, "Accepted mismatch");
        require(cancelled == false, "Cancelled mismatch");

        (uint256 m0, bool r0) = escrow.agreementMilestones(jobId, 0);
        (uint256 m1, bool r1) = escrow.agreementMilestones(jobId, 1);
        require(m0 == 100 && !r0, "Milestone 0 mismatch");
        require(m1 == 200 && !r1, "Milestone 1 mismatch");
        require(address(escrow).balance == 300, "Escrow balance mismatch");
    }

    function testCreateEscrowRevertsOnIncorrectEthValue() public {
        uint256[] memory amounts = _twoMilestones();
        vm.expectRevert("Escrow: incorrect ETH value");
        escrow.createEscrow{value: 299}(jobId, freelancer, address(0), amounts);
    }

    function testCreateEscrowRevertsOnZeroFreelancer() public {
        uint256[] memory amounts = _twoMilestones();
        vm.expectRevert("Escrow: invalid freelancer");
        escrow.createEscrow{value: 300}(jobId, address(0), address(0), amounts);
    }

    function testCreateEscrowRevertsOnDuplicateJobId() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.expectRevert("Escrow: job already exists");
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);
    }

    function testAcceptEscrowMarksAcceptedAndEmits() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.expectEmit(true, true, false, false);
        emit EscrowAccepted(jobId, freelancer);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);

        (,,,, , bool accepted, ) = escrow.agreements(jobId);
        require(accepted == true, "Acceptance not recorded");
    }

    function testAcceptEscrowRevertsForNonFreelancer() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.prank(stranger);
        vm.expectRevert("Escrow: only freelancer can accept");
        escrow.acceptEscrow(jobId);
    }

    function testAcceptEscrowRevertsOnDoubleAccept() public {
        _createAndAcceptEth();

        vm.prank(freelancer);
        vm.expectRevert("Escrow: already accepted");
        escrow.acceptEscrow(jobId);
    }

    function testReleaseMilestoneRevertsBeforeAcceptance() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.expectRevert("Escrow: freelancer has not accepted");
        escrow.releaseMilestone(jobId, 0);

        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == false, "No release before acceptance");
    }

    function testCancelEscrowRefundsClientBeforeAcceptance() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        uint256 before = address(this).balance;
        vm.expectEmit(true, false, false, true);
        emit EscrowCancelled(jobId, 300);
        escrow.cancelEscrow(jobId);

        (,,,, , , bool cancelled) = escrow.agreements(jobId);
        require(cancelled == true, "Not cancelled");
        require(address(escrow).balance == 0, "Escrow not drained");
        require(address(this).balance == before + 300, "Client not refunded");
    }

    function testCancelEscrowRevertsAfterAcceptance() public {
        _createAndAcceptEth();

        vm.expectRevert("Escrow: freelancer already accepted");
        escrow.cancelEscrow(jobId);

        require(address(escrow).balance == 300, "Funds must remain committed");
    }

    function testCancelEscrowRevertsForNonClient() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.prank(stranger);
        vm.expectRevert("Escrow: only client can cancel");
        escrow.cancelEscrow(jobId);
    }

    function testCancelEscrowRevertsOnDoubleCancel() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);
        escrow.cancelEscrow(jobId);

        vm.expectRevert("Escrow: agreement is cancelled");
        escrow.cancelEscrow(jobId);
    }

    function testReleaseMilestoneEthPaysFreelancer() public {
        _createAndAcceptEth();

        vm.expectEmit(true, false, false, true);
        emit MilestoneReleased(jobId, 0, 100);
        escrow.releaseMilestone(jobId, 0);

        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == true, "Milestone not released");
        require(freelancer.balance == 100, "Freelancer not paid");
        require(address(escrow).balance == 200, "Escrow balance mismatch");
    }

    function testReleaseMilestoneRevertsForNonClient() public {
        _createAndAcceptEth();

        vm.prank(stranger);
        vm.expectRevert("Escrow: only client can release");
        escrow.releaseMilestone(jobId, 0);

        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == false, "Unauthorized release must not persist");
    }

    function testReleaseMilestoneRevertsOnDoubleRelease() public {
        _createAndAcceptEth();

        escrow.releaseMilestone(jobId, 0);

        vm.expectRevert("Escrow: already released");
        escrow.releaseMilestone(jobId, 0);
    }

    function testCreateEscrowErc20PullsFunds() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 300);
        token.approve(address(escrow), 300);

        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow(jobId, freelancer, address(token), amounts);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);

        require(token.balanceOf(address(escrow)) == 300, "Escrow token balance mismatch");

        escrow.releaseMilestone(jobId, 0);

        require(token.balanceOf(freelancer) == 100, "Freelancer token balance mismatch");
        require(token.balanceOf(address(escrow)) == 200, "Escrow token balance mismatch after release");
    }

    function testCreateEscrowRevertsWhenErc20ReturnsFalse() public {
        FalseReturnERC20 token = new FalseReturnERC20();
        uint256[] memory amounts = _twoMilestones();

        vm.expectRevert("Escrow: ERC20 transferFrom failed");
        escrow.createEscrow(jobId, freelancer, address(token), amounts);
    }

    function testCreateEscrowRevertsWhenErc20TransferFromReverts() public {
        RevertingERC20 token = new RevertingERC20();
        uint256[] memory amounts = _twoMilestones();

        vm.expectRevert("Escrow: ERC20 transferFrom failed");
        escrow.createEscrow(jobId, freelancer, address(token), amounts);
    }

    function testReleaseMilestoneRevertsWhenErc20ReturnsFalse() public {
        TransferFailsERC20 token = new TransferFailsERC20();
        token.mint(address(this), 300);
        token.approve(address(escrow), 300);

        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow(jobId, freelancer, address(token), amounts);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);
        require(token.balanceOf(address(escrow)) == 300, "Escrow token balance mismatch");

        vm.expectRevert("Escrow: ERC20 transfer failed");
        escrow.releaseMilestone(jobId, 0);
    }

    function testAgreementNotCompletedWhileMilestoneOutstanding() public {
        _createAndAcceptEth();

        escrow.releaseMilestone(jobId, 0);

        (,,,, bool completed, , ) = escrow.agreements(jobId);
        require(completed == false, "Agreement must not be complete with an outstanding milestone");
    }

    function testAgreementCompletedAfterLastMilestone() public {
        _createAndAcceptEth();

        escrow.releaseMilestone(jobId, 0);
        escrow.releaseMilestone(jobId, 1);

        (,,,, bool completed, , ) = escrow.agreements(jobId);
        require(completed == true, "Agreement must be complete after the last milestone");
        require(address(escrow).balance == 0, "Escrow must be fully drained");
    }

    function testPartialReleaseDoesNotSetCompleted() public {
        uint256[] memory amounts = new uint256[](3);
        amounts[0] = 100;
        amounts[1] = 100;
        amounts[2] = 100;
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);

        escrow.releaseMilestone(jobId, 0);
        escrow.releaseMilestone(jobId, 2);

        (,,,, bool completed, , ) = escrow.agreements(jobId);
        require(completed == false, "Partial release must not complete the agreement");
    }

    function testRevertedReleaseDoesNotSetCompletedOrReleased() public {
        TransferFailsERC20 token = new TransferFailsERC20();
        token.mint(address(this), 100);
        token.approve(address(escrow), 100);

        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;
        escrow.createEscrow(jobId, freelancer, address(token), amounts);
        vm.prank(freelancer);
        escrow.acceptEscrow(jobId);

        vm.expectRevert("Escrow: ERC20 transfer failed");
        escrow.releaseMilestone(jobId, 0);

        (,,,, bool completed, , ) = escrow.agreements(jobId);
        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == false, "Failed release must not mark the milestone released");
        require(completed == false, "Failed release must not complete the agreement");
    }

    function testCreateEscrowRevertsWhenEthSentForTokenEscrow() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 300);
        token.approve(address(escrow), 300);

        uint256[] memory amounts = _twoMilestones();

        vm.expectRevert("Escrow: ETH not accepted for token escrow");
        escrow.createEscrow{value: 1}(jobId, freelancer, address(token), amounts);
    }

    function testMarkDeliveredSetsTimestampAndEmits() public {
        _createAndAcceptEth();

        vm.expectEmit(true, false, false, true);
        emit MilestoneDelivered(jobId, 0);
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        require(escrow.milestoneDeliveredAt(jobId, 0) == block.timestamp, "Delivery timestamp mismatch");
    }

    function testMarkDeliveredRevertsForNonFreelancer() public {
        _createAndAcceptEth();

        vm.prank(stranger);
        vm.expectRevert("Escrow: only freelancer can deliver");
        escrow.markDelivered(jobId, 0);
    }

    function testMarkDeliveredRevertsBeforeAcceptance() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.prank(freelancer);
        vm.expectRevert("Escrow: freelancer has not accepted");
        escrow.markDelivered(jobId, 0);
    }

    function testMarkDeliveredRevertsOnDoubleDelivery() public {
        _createAndAcceptEth();

        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.prank(freelancer);
        vm.expectRevert("Escrow: already delivered");
        escrow.markDelivered(jobId, 0);
    }

    function testDisputeMilestoneBlocksClaim() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.expectEmit(true, false, false, true);
        emit MilestoneDisputed(jobId, 0);
        escrow.disputeMilestone(jobId, 0);

        vm.warp(block.timestamp + escrow.DISPUTE_WINDOW() + 1);
        vm.prank(freelancer);
        vm.expectRevert("Escrow: milestone disputed");
        escrow.claimMilestone(jobId, 0);
    }

    function testDisputeMilestoneRevertsForNonClient() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.prank(stranger);
        vm.expectRevert("Escrow: only client can dispute");
        escrow.disputeMilestone(jobId, 0);
    }

    function testDisputeMilestoneRevertsWhenNotDelivered() public {
        _createAndAcceptEth();

        vm.expectRevert("Escrow: milestone not delivered");
        escrow.disputeMilestone(jobId, 0);
    }

    function testDisputeMilestoneRevertsAfterWindow() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.warp(block.timestamp + escrow.DISPUTE_WINDOW());
        vm.expectRevert("Escrow: dispute window elapsed");
        escrow.disputeMilestone(jobId, 0);
    }

    function testDisputeMilestoneRevertsOnDoubleDispute() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        escrow.disputeMilestone(jobId, 0);

        vm.expectRevert("Escrow: already disputed");
        escrow.disputeMilestone(jobId, 0);
    }

    function testClaimMilestonePaysAfterDisputeWindow() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.warp(block.timestamp + escrow.DISPUTE_WINDOW());

        vm.expectEmit(true, false, false, true);
        emit MilestoneReleased(jobId, 0, 100);
        vm.prank(freelancer);
        escrow.claimMilestone(jobId, 0);

        require(freelancer.balance == 100, "Freelancer not paid after window");
        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == true, "Milestone not released");
    }

    function testClaimMilestoneRevertsBeforeWindow() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);

        vm.prank(freelancer);
        vm.expectRevert("Escrow: dispute window not elapsed");
        escrow.claimMilestone(jobId, 0);
    }

    function testClaimMilestoneRevertsForNonFreelancer() public {
        _createAndAcceptEth();
        vm.prank(freelancer);
        escrow.markDelivered(jobId, 0);
        vm.warp(block.timestamp + escrow.DISPUTE_WINDOW());

        vm.prank(stranger);
        vm.expectRevert("Escrow: only freelancer can claim");
        escrow.claimMilestone(jobId, 0);
    }

    function testClaimMilestoneRevertsWhenNotDelivered() public {
        _createAndAcceptEth();

        vm.prank(freelancer);
        vm.expectRevert("Escrow: milestone not delivered");
        escrow.claimMilestone(jobId, 0);
    }
}
