// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../GitHubBounty.sol";

contract GitHubBountyTest {
    GitHubBounty public bountyContract;
    address public solver = address(0x3A4b9c1D2E3F4A5b6C7d8e9F0a1b2C3D4e5F6a7b);

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
