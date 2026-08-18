// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../GitHubBounty.sol";

contract GitHubBountyTest {
    GitHubBounty public bountyContract;
    address public solver = address(0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b);

    function setUp() public {
        bountyContract = new GitHubBounty();
    }

    function testCreateAndClaimBounty() public {
        bytes32 bountyId = bytes32("bounty-201");
        bountyContract.createBounty(bountyId, "https://github.com/beduldul/chainguard-web3-security/issues/12", 500000000);

        bountyContract.claimBounty(bountyId, solver);

        (, string memory url, uint256 reward, address sol, bool claimed) = bountyContract.bounties(bountyId);

        require(reward == 500000000, "Reward check failed");
        require(sol == solver, "Solver check failed");
        require(claimed == true, "Claimed check failed");
    }
}
