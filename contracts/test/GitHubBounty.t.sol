// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../GitHubBounty.sol";
import "./TestHelpers.sol";

contract GitHubBountyTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    GitHubBounty public bountyContract;
    address public solver = address(0x3A4b9c1D2E3F4A5b6C7d8e9F0a1b2C3D4e5F6a7b);
    address public issuer = address(uint160(0x1550));
    address public stranger = address(uint160(0xBEEF));
    bytes32 public bountyId = bytes32("bounty-201");

    event BountyCreated(bytes32 indexed bountyId, string issueUrl, uint256 rewardUsdc);
    event BountyClaimed(bytes32 indexed bountyId, address indexed solver);

    function setUp() public {
        bountyContract = new GitHubBounty();
    }

    function testCreateAndClaimBounty() public {
        vm.expectEmit(true, false, false, true);
        emit BountyCreated(bountyId, "https://github.com/beduldul/chainguard-web3-security/issues/12", 500000000);
        bountyContract.createBounty(bountyId, "https://github.com/beduldul/chainguard-web3-security/issues/12", 500000000);

        vm.expectEmit(true, true, false, false);
        emit BountyClaimed(bountyId, solver);
        bountyContract.claimBounty(bountyId, solver);

        (, string memory url, uint256 reward, address sol, bool claimed) = bountyContract.bounties(bountyId);

        require(keccak256(bytes(url)) == keccak256(bytes("https://github.com/beduldul/chainguard-web3-security/issues/12")), "URL check failed");
        require(reward == 500000000, "Reward check failed");
        require(sol == solver, "Solver check failed");
        require(claimed == true, "Claimed check failed");
    }

    function testCreateBountyStoresIssuer() public {
        vm.prank(issuer);
        bountyContract.createBounty(bountyId, "https://example.com/1", 1);

        (address storedIssuer, , , , bool claimed) = bountyContract.bounties(bountyId);
        require(storedIssuer == issuer, "Issuer mismatch");
        require(claimed == false, "Bounty must start unclaimed");
    }

    function testCreateBountyAllowsDuplicateIdAndOverwrites() public {
        bountyContract.createBounty(bountyId, "https://example.com/old", 100);
        bountyContract.createBounty(bountyId, "https://example.com/new", 200);

        (, string memory url, uint256 reward, , ) = bountyContract.bounties(bountyId);
        require(keccak256(bytes(url)) == keccak256(bytes("https://example.com/new")), "URL not overwritten");
        require(reward == 200, "Reward not overwritten");
    }

    function testCreateBountyAllowsZeroReward() public {
        bountyContract.createBounty(bountyId, "https://example.com/zero", 0);

        (, , uint256 reward, , ) = bountyContract.bounties(bountyId);
        require(reward == 0, "Zero reward mismatch");
    }

    function testClaimBountyRevertsForNonIssuer() public {
        bountyContract.createBounty(bountyId, "https://example.com/1", 100);

        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: only issuer can approve solver");
        bountyContract.claimBounty(bountyId, solver);

        (, , , address sol, bool claimed) = bountyContract.bounties(bountyId);
        require(sol == address(0), "Unauthorized claim must not set solver");
        require(claimed == false, "Unauthorized claim must not persist");
    }

    function testClaimBountyRevertsOnDoubleClaim() public {
        bountyContract.createBounty(bountyId, "https://example.com/1", 100);
        bountyContract.claimBounty(bountyId, solver);

        vm.expectRevert("GitHubBounty: bounty already claimed");
        bountyContract.claimBounty(bountyId, stranger);
    }

    function testClaimBountyForUnknownIdRevertsForNonIssuer() public {
        // Unknown ids have issuer == address(0), so no caller can claim them.
        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: only issuer can approve solver");
        bountyContract.claimBounty(bytes32("unknown"), solver);
    }

    function testClaimBountyAllowsZeroSolver() public {
        // Documented behaviour: the issuer may mark a bounty claimed without naming a solver.
        bountyContract.createBounty(bountyId, "https://example.com/1", 100);
        bountyContract.claimBounty(bountyId, address(0));

        (, , , address sol, bool claimed) = bountyContract.bounties(bountyId);
        require(sol == address(0), "Solver mismatch");
        require(claimed == true, "Claimed mismatch");
    }
}
