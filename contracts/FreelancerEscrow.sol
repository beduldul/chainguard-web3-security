// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title FreelancerEscrow
 * @dev Milestone-based fund locking and client-approved payment disbursal smart contract.
 */
contract FreelancerEscrow {
    struct Milestone {
        uint256 amountUsd;
        bool isReleased;
    }

    struct EscrowAgreement {
        address client;
        address freelancer;
        address token;
        uint256 totalAmount;
        bool isCompleted;
    }

    mapping(bytes32 => EscrowAgreement) public agreements;
    mapping(bytes32 => Milestone[]) public agreementMilestones;

    event EscrowCreated(bytes32 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event MilestoneReleased(bytes32 indexed jobId, uint256 milestoneIndex, uint256 amount);

    function createEscrow(
        bytes32 jobId,
        address freelancer,
        address token,
        uint256[] calldata milestoneAmounts
    ) external payable {
        uint256 total = 0;
        for (uint256 i = 0; i < milestoneAmounts.length; i++) {
            total += milestoneAmounts[i];
            agreementMilestones[jobId].push(Milestone({
                amountUsd: milestoneAmounts[i],
                isReleased: false
            }));
        }

        agreements[jobId] = EscrowAgreement({
            client: msg.sender,
            freelancer: freelancer,
            token: token,
            totalAmount: total,
            isCompleted: false
        });

        if (token == address(0)) {
            require(msg.value == total, "Escrow: incorrect ETH value");
        } else {
            IERC20(token).transferFrom(msg.sender, address(this), total);
        }

        emit EscrowCreated(jobId, msg.sender, freelancer, total);
    }

    function releaseMilestone(bytes32 jobId, uint256 milestoneIndex) external {
        EscrowAgreement storage agreement = agreements[jobId];
        require(msg.sender == agreement.client, "Escrow: only client can release");

        Milestone storage ms = agreementMilestones[jobId][milestoneIndex];
        require(!ms.isReleased, "Escrow: already released");

        ms.isReleased = true;

        if (agreement.token == address(0)) {
            payable(agreement.freelancer).transfer(ms.amountUsd);
        } else {
            IERC20(agreement.token).transfer(agreement.freelancer, ms.amountUsd);
        }

        emit MilestoneReleased(jobId, milestoneIndex, ms.amountUsd);
    }
}
