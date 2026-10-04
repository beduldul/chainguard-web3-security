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
    event MilestoneReleased(bytes32 indexed jobId, uint256 milestoneIndex, uint256 amount);

    function setUp() public {
        escrow = new FreelancerEscrow();
    }

    function _twoMilestones() internal pure returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100;
        amounts[1] = 200;
        return amounts;
    }

    function testCreateEscrowEthStoresAgreement() public payable {
        uint256[] memory amounts = _twoMilestones();

        vm.expectEmit(true, true, true, true);
        emit EscrowCreated(jobId, address(this), freelancer, 300);
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        (address client, address fl, address token, uint256 total, bool completed) = escrow.agreements(jobId);
        require(client == address(this), "Client mismatch");
        require(fl == freelancer, "Freelancer mismatch");
        require(token == address(0), "Token mismatch");
        require(total == 300, "Total mismatch");
        require(completed == false, "Completed mismatch");

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

    function testReleaseMilestoneEthPaysFreelancer() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.expectEmit(true, false, false, true);
        emit MilestoneReleased(jobId, 0, 100);
        escrow.releaseMilestone(jobId, 0);

        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == true, "Milestone not released");
        require(freelancer.balance == 100, "Freelancer not paid");
        require(address(escrow).balance == 200, "Escrow balance mismatch");
    }

    function testReleaseMilestoneRevertsForNonClient() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

        vm.prank(stranger);
        vm.expectRevert("Escrow: only client can release");
        escrow.releaseMilestone(jobId, 0);

        (, bool released) = escrow.agreementMilestones(jobId, 0);
        require(released == false, "Unauthorized release must not persist");
    }

    function testReleaseMilestoneRevertsOnDoubleRelease() public {
        uint256[] memory amounts = _twoMilestones();
        escrow.createEscrow{value: 300}(jobId, freelancer, address(0), amounts);

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
        require(token.balanceOf(address(escrow)) == 300, "Escrow token balance mismatch");

        vm.expectRevert("Escrow: ERC20 transfer failed");
        escrow.releaseMilestone(jobId, 0);
    }
}
