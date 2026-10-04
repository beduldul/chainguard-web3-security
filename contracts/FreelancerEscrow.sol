// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transferFrom(address sender, address recipient, uint256 amount) external returns (bool);
    function transfer(address recipient, uint256 amount) external returns (bool);
}

/**
 * @title FreelancerEscrow
 * @dev Milestone-based fund locking and payment disbursal smart contract.
 *
 * The agreement is bilateral: the client funds it, the freelancer must explicitly
 * accept the terms, and release is not the client's alone. A freelancer can mark a
 * milestone delivered; after `DISPUTE_WINDOW` passes with no client dispute or
 * release, the freelancer can self-release the milestone.
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
        bool freelancerAccepted;
        bool isCancelled;
    }

    /// @dev Time the client has to dispute or release a delivered milestone before the
    /// freelancer may self-release it.
    uint256 public constant DISPUTE_WINDOW = 7 days;

    mapping(bytes32 => EscrowAgreement) public agreements;
    mapping(bytes32 => Milestone[]) public agreementMilestones;

    // milestoneIndex => delivery timestamp (0 = not delivered).
    mapping(bytes32 => mapping(uint256 => uint256)) public milestoneDeliveredAt;
    // milestoneIndex => client disputed the delivery within the window.
    mapping(bytes32 => mapping(uint256 => bool)) public milestoneDisputed;

    event EscrowCreated(bytes32 indexed jobId, address indexed client, address indexed freelancer, uint256 totalAmount);
    event EscrowAccepted(bytes32 indexed jobId, address indexed freelancer);
    event EscrowCancelled(bytes32 indexed jobId, uint256 refundedAmount);
    event MilestoneDelivered(bytes32 indexed jobId, uint256 milestoneIndex);
    event MilestoneDisputed(bytes32 indexed jobId, uint256 milestoneIndex);
    event MilestoneReleased(bytes32 indexed jobId, uint256 milestoneIndex, uint256 amount);

    // Hand-rolled reentrancy guard (no forge-std / OZ dependency). 1 = unlocked, 2 = entered.
    uint256 private _reentrancyStatus = 1;

    modifier nonReentrant() {
        require(_reentrancyStatus == 1, "Escrow: reentrant call");
        _reentrancyStatus = 2;
        _;
        _reentrancyStatus = 1;
    }

    function createEscrow(
        bytes32 jobId,
        address freelancer,
        address token,
        uint256[] calldata milestoneAmounts
    ) external payable nonReentrant {
        require(agreements[jobId].client == address(0), "Escrow: job already exists");
        require(freelancer != address(0), "Escrow: invalid freelancer");

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
            isCompleted: false,
            freelancerAccepted: false,
            isCancelled: false
        });

        if (token == address(0)) {
            require(msg.value == total, "Escrow: incorrect ETH value");
        } else {
            require(msg.value == 0, "Escrow: ETH not accepted for token escrow");
            _safeTransferFrom(token, msg.sender, address(this), total);
        }

        emit EscrowCreated(jobId, msg.sender, freelancer, total);
    }

    /**
     * @dev The freelancer accepts the agreement's terms. No milestone can be released
     * before acceptance, so the client cannot unilaterally push funds at the freelancer.
     */
    function acceptEscrow(bytes32 jobId) external {
        EscrowAgreement storage agreement = agreements[jobId];
        require(agreement.freelancer == msg.sender, "Escrow: only freelancer can accept");
        require(!agreement.freelancerAccepted, "Escrow: already accepted");
        require(!agreement.isCancelled, "Escrow: agreement is cancelled");

        agreement.freelancerAccepted = true;

        emit EscrowAccepted(jobId, msg.sender);
    }

    /**
     * @dev Refunds the full escrow to the client. Only possible before the freelancer
     * accepts: once accepted, the funds are committed to the agreement.
     */
    function cancelEscrow(bytes32 jobId) external nonReentrant {
        EscrowAgreement storage agreement = agreements[jobId];
        require(agreement.client == msg.sender, "Escrow: only client can cancel");
        require(!agreement.freelancerAccepted, "Escrow: freelancer already accepted");
        require(!agreement.isCancelled, "Escrow: agreement is cancelled");

        // Effects before interactions.
        agreement.isCancelled = true;

        uint256 refund = agreement.totalAmount;

        emit EscrowCancelled(jobId, refund);

        if (agreement.token == address(0)) {
            payable(agreement.client).transfer(refund);
        } else {
            _safeTransfer(agreement.token, agreement.client, refund);
        }
    }

    /**
     * @dev Freelancer marks a milestone delivered, starting the dispute window.
     */
    function markDelivered(bytes32 jobId, uint256 milestoneIndex) external {
        EscrowAgreement storage agreement = agreements[jobId];
        require(agreement.freelancer == msg.sender, "Escrow: only freelancer can deliver");
        require(agreement.freelancerAccepted, "Escrow: freelancer has not accepted");
        require(!agreement.isCancelled, "Escrow: agreement is cancelled");

        Milestone storage ms = agreementMilestones[jobId][milestoneIndex];
        require(!ms.isReleased, "Escrow: already released");
        require(milestoneDeliveredAt[jobId][milestoneIndex] == 0, "Escrow: already delivered");

        milestoneDeliveredAt[jobId][milestoneIndex] = block.timestamp;

        emit MilestoneDelivered(jobId, milestoneIndex);
    }

    /**
     * @dev Client disputes a delivered milestone within the window, blocking the
     * freelancer's self-release path.
     */
    function disputeMilestone(bytes32 jobId, uint256 milestoneIndex) external {
        EscrowAgreement storage agreement = agreements[jobId];
        require(agreement.client == msg.sender, "Escrow: only client can dispute");

        uint256 deliveredAt = milestoneDeliveredAt[jobId][milestoneIndex];
        require(deliveredAt != 0, "Escrow: milestone not delivered");
        require(!agreementMilestones[jobId][milestoneIndex].isReleased, "Escrow: already released");
        require(block.timestamp < deliveredAt + DISPUTE_WINDOW, "Escrow: dispute window elapsed");
        require(!milestoneDisputed[jobId][milestoneIndex], "Escrow: already disputed");

        milestoneDisputed[jobId][milestoneIndex] = true;

        emit MilestoneDisputed(jobId, milestoneIndex);
    }

    /**
     * @dev Freelancer self-releases a delivered milestone once the dispute window has
     * elapsed without a client release or dispute.
     */
    function claimMilestone(bytes32 jobId, uint256 milestoneIndex) external nonReentrant {
        EscrowAgreement storage agreement = agreements[jobId];
        require(agreement.freelancer == msg.sender, "Escrow: only freelancer can claim");

        uint256 deliveredAt = milestoneDeliveredAt[jobId][milestoneIndex];
        require(deliveredAt != 0, "Escrow: milestone not delivered");
        require(!milestoneDisputed[jobId][milestoneIndex], "Escrow: milestone disputed");
        require(block.timestamp >= deliveredAt + DISPUTE_WINDOW, "Escrow: dispute window not elapsed");

        _release(jobId, milestoneIndex);
    }

    function releaseMilestone(bytes32 jobId, uint256 milestoneIndex) external nonReentrant {
        EscrowAgreement storage agreement = agreements[jobId];
        require(msg.sender == agreement.client, "Escrow: only client can release");
        require(agreement.freelancerAccepted, "Escrow: freelancer has not accepted");

        _release(jobId, milestoneIndex);
    }

    /**
     * @dev Shared release path. Writes the milestone and completion state before any
     * external transfer (checks-effects-interactions).
     */
    function _release(bytes32 jobId, uint256 milestoneIndex) internal {
        EscrowAgreement storage agreement = agreements[jobId];

        Milestone storage ms = agreementMilestones[jobId][milestoneIndex];
        require(!ms.isReleased, "Escrow: already released");

        ms.isReleased = true;

        // The agreement is complete only once every milestone has been released.
        agreement.isCompleted = _allMilestonesReleased(jobId);

        if (agreement.token == address(0)) {
            payable(agreement.freelancer).transfer(ms.amountUsd);
        } else {
            _safeTransfer(agreement.token, agreement.freelancer, ms.amountUsd);
        }

        emit MilestoneReleased(jobId, milestoneIndex, ms.amountUsd);
    }

    /**
     * @dev True when the agreement holds at least one milestone and every one is released.
     * An agreement with no milestones is never considered completed (there is no release path).
     */
    function _allMilestonesReleased(bytes32 jobId) internal view returns (bool) {
        Milestone[] storage milestones = agreementMilestones[jobId];
        if (milestones.length == 0) {
            return false;
        }
        for (uint256 i = 0; i < milestones.length; i++) {
            if (!milestones[i].isReleased) {
                return false;
            }
        }
        return true;
    }

    /**
     * @dev ERC20 `transfer` that reverts unless the token reports success.
     * Handles both boolean-returning tokens and tokens that return no data.
     */
    function _safeTransfer(address token, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transfer.selector, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "Escrow: ERC20 transfer failed");
    }

    /**
     * @dev ERC20 `transferFrom` that reverts unless the token reports success.
     */
    function _safeTransferFrom(address token, address from, address to, uint256 amount) internal {
        (bool ok, bytes memory data) = token.call(
            abi.encodeWithSelector(IERC20.transferFrom.selector, from, to, amount)
        );
        require(ok && _tokenReturnedTrue(data), "Escrow: ERC20 transferFrom failed");
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
