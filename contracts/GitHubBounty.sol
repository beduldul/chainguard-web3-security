// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title GitHubBounty
 * @dev Smart contract locking USDC bounties linked to GitHub PR Merges.
 */
contract GitHubBounty {
    struct Bounty {
        address issuer;
        string issueUrl;
        uint256 rewardUsdc;
        address solver;
        bool isClaimed;
    }

    mapping(bytes32 => Bounty) public bounties;

    event BountyCreated(bytes32 indexed bountyId, string issueUrl, uint256 rewardUsdc);
    event BountyClaimed(bytes32 indexed bountyId, address indexed solver);

    function createBounty(bytes32 bountyId, string calldata issueUrl, uint256 rewardUsdc) external {
        bounties[bountyId] = Bounty({
            issuer: msg.sender,
            issueUrl: issueUrl,
            rewardUsdc: rewardUsdc,
            solver: address(0),
            isClaimed: false
        });

        emit BountyCreated(bountyId, issueUrl, rewardUsdc);
    }

    function claimBounty(bytes32 bountyId, address solver) external {
        Bounty storage b = bounties[bountyId];
        require(!b.isClaimed, "GitHubBounty: bounty already claimed");
        require(b.issuer == msg.sender, "GitHubBounty: only issuer can approve solver");

        b.solver = solver;
        b.isClaimed = true;

        emit BountyClaimed(bountyId, solver);
    }
}
