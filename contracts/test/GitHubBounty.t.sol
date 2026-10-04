// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../GitHubBounty.sol";
import "./TestHelpers.sol";

contract GitHubBountyTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    GitHubBounty public bountyContract;
    MockERC20 public token;
    address public solver = address(0x3A4b9c1D2E3F4A5b6C7d8e9F0a1b2C3D4e5F6a7b);
    address public issuer = address(uint160(0x1550));
    address public maintainer = address(uint160(0x0A1));
    address public stranger = address(uint160(0xBEEF));
    bytes32 public bountyId = bytes32("bounty-201");
    string public issueUrl = "https://github.com/beduldul/chainguard-web3-security/issues/12";
    uint256 public reward = 500_000_000;

    event BountyCreated(
        bytes32 indexed bountyId,
        address indexed issuer,
        address token,
        string issueUrl,
        uint256 rewardUsdc
    );
    event MaintainerUpdated(bytes32 indexed bountyId, address indexed maintainer, bool status);
    event BountyClaimed(bytes32 indexed bountyId, address indexed solver);
    event BountyReleased(bytes32 indexed bountyId, address indexed solver, uint256 rewardUsdc);
    event BountyCancelled(bytes32 indexed bountyId, address indexed issuer, uint256 refundedUsdc);

    function setUp() public {
        bountyContract = new GitHubBounty();
        token = new MockERC20();
        token.mint(address(this), 1_000_000_000);
        token.approve(address(bountyContract), type(uint256).max);

        token.mint(issuer, 1_000_000_000);
        vm.prank(issuer);
        token.approve(address(bountyContract), type(uint256).max);
    }

    function _createDefault() internal {
        bountyContract.createBounty(bountyId, issueUrl, address(token), reward);
    }

    function testCreateBountyEscrowsFunds() public {
        vm.expectEmit(true, true, false, true);
        emit BountyCreated(bountyId, address(this), address(token), issueUrl, reward);
        bountyContract.createBounty(bountyId, issueUrl, address(token), reward);

        (address storedIssuer, address tok, string memory url, uint256 storedReward, address sol, bool released, bool cancelled) =
            bountyContract.bounties(bountyId);

        require(storedIssuer == address(this), "Issuer mismatch");
        require(tok == address(token), "Token mismatch");
        require(keccak256(bytes(url)) == keccak256(bytes(issueUrl)), "URL mismatch");
        require(storedReward == reward, "Reward mismatch");
        require(sol == address(0), "Solver must start empty");
        require(!released, "Must start unreleased");
        require(!cancelled, "Must start uncancelled");
        require(token.balanceOf(address(bountyContract)) == reward, "Escrow not funded");
    }

    function testCreateBountyRevertsOnDuplicateId() public {
        _createDefault();

        vm.expectRevert("GitHubBounty: bounty already exists");
        bountyContract.createBounty(bountyId, "https://example.com/other", address(token), reward);

        (, , string memory url, , , , ) = bountyContract.bounties(bountyId);
        require(keccak256(bytes(url)) == keccak256(bytes(issueUrl)), "Duplicate must not overwrite");
    }

    function testCreateBountyRevertsOnZeroToken() public {
        vm.expectRevert("GitHubBounty: invalid token");
        bountyContract.createBounty(bountyId, issueUrl, address(0), reward);
    }

    function testCreateBountyRevertsOnZeroReward() public {
        vm.expectRevert("GitHubBounty: reward must be positive");
        bountyContract.createBounty(bountyId, issueUrl, address(token), 0);
    }

    function testCreateBountyRevertsWhenTransferFromFails() public {
        FalseReturnERC20 bad = new FalseReturnERC20();
        vm.expectRevert("GitHubBounty: ERC20 transferFrom failed");
        bountyContract.createBounty(bountyId, issueUrl, address(bad), reward);
    }

    function testClaimBountyMarksSolver() public {
        _createDefault();

        vm.expectEmit(true, true, false, false);
        emit BountyClaimed(bountyId, solver);
        bountyContract.claimBounty(bountyId, solver);

        (, , , , address sol, , ) = bountyContract.bounties(bountyId);
        require(sol == solver, "Solver mismatch");
    }

    function testClaimBountyRevertsForUnknownBounty() public {
        vm.expectRevert("GitHubBounty: unknown bounty");
        bountyContract.claimBounty(bytes32("unknown"), solver);
    }

    function testClaimBountyRevertsForUnauthorizedCaller() public {
        _createDefault();

        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: caller is not authorized");
        bountyContract.claimBounty(bountyId, solver);

        (, , , , address sol, , ) = bountyContract.bounties(bountyId);
        require(sol == address(0), "Unauthorized claim must not set solver");
    }

    function testClaimBountyRevertsForZeroSolver() public {
        _createDefault();

        vm.expectRevert("GitHubBounty: invalid solver");
        bountyContract.claimBounty(bountyId, address(0));
    }

    function testClaimBountyRevertsWhenAlreadyReleased() public {
        _createDefault();
        bountyContract.claimBounty(bountyId, solver);
        bountyContract.releaseBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already released");
        bountyContract.claimBounty(bountyId, stranger);
    }

    function testClaimBountyRevertsWhenCancelled() public {
        _createDefault();
        bountyContract.cancelBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already cancelled");
        bountyContract.claimBounty(bountyId, solver);
    }

    function testSetMaintainerEmitsAndAuthorizes() public {
        _createDefault();

        vm.expectEmit(true, true, false, true);
        emit MaintainerUpdated(bountyId, maintainer, true);
        bountyContract.setMaintainer(bountyId, maintainer, true);

        require(bountyContract.maintainers(bountyId, maintainer), "Maintainer not set");

        vm.prank(maintainer);
        bountyContract.claimBounty(bountyId, solver);

        (, , , , address sol, , ) = bountyContract.bounties(bountyId);
        require(sol == solver, "Maintainer claim must set solver");
    }

    function testSetMaintainerRevertsForNonIssuer() public {
        _createDefault();

        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: only issuer");
        bountyContract.setMaintainer(bountyId, maintainer, true);

        require(!bountyContract.maintainers(bountyId, maintainer), "Unauthorized write must not persist");
    }

    function testSetMaintainerRevertsForZeroAddress() public {
        _createDefault();

        vm.expectRevert("GitHubBounty: invalid maintainer");
        bountyContract.setMaintainer(bountyId, address(0), true);
    }

    function testSetMaintainerRevokedLosesAuthorization() public {
        _createDefault();
        bountyContract.setMaintainer(bountyId, maintainer, true);
        bountyContract.setMaintainer(bountyId, maintainer, false);

        vm.prank(maintainer);
        vm.expectRevert("GitHubBounty: caller is not authorized");
        bountyContract.claimBounty(bountyId, solver);
    }

    function testReleaseBountyPaysSolverAndEmits() public {
        _createDefault();
        bountyContract.claimBounty(bountyId, solver);

        vm.expectEmit(true, true, false, true);
        emit BountyReleased(bountyId, solver, reward);
        bountyContract.releaseBounty(bountyId);

        require(token.balanceOf(solver) == reward, "Solver not paid");
        require(token.balanceOf(address(bountyContract)) == 0, "Escrow not drained");

        (, , , , , bool released, ) = bountyContract.bounties(bountyId);
        require(released, "Not marked released");
    }

    function testReleaseBountyRevertsWhenSolverNotSet() public {
        _createDefault();

        vm.expectRevert("GitHubBounty: solver not set");
        bountyContract.releaseBounty(bountyId);
    }

    function testReleaseBountyRevertsForUnauthorizedCaller() public {
        _createDefault();
        bountyContract.claimBounty(bountyId, solver);

        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: caller is not authorized");
        bountyContract.releaseBounty(bountyId);

        require(token.balanceOf(solver) == 0, "Unauthorized release must not pay");
    }

    function testReleaseBountyRevertsOnDoubleRelease() public {
        _createDefault();
        bountyContract.claimBounty(bountyId, solver);
        bountyContract.releaseBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already released");
        bountyContract.releaseBounty(bountyId);
    }

    function testReleaseBountyRevertsWhenCancelled() public {
        _createDefault();
        bountyContract.cancelBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already cancelled");
        bountyContract.releaseBounty(bountyId);
    }

    function testReleaseBountyRevertsOnInsufficientEscrow() public {
        // A token that reports success on `transferFrom` without crediting this contract
        // leaves the bounty under-collateralised; the explicit escrow check must catch it.
        LyingERC20 lying = new LyingERC20();
        lying.mint(address(this), reward);
        lying.approve(address(bountyContract), reward);

        bountyContract.createBounty(bountyId, issueUrl, address(lying), reward);
        bountyContract.claimBounty(bountyId, solver);

        vm.expectRevert("GitHubBounty: insufficient escrow");
        bountyContract.releaseBounty(bountyId);
    }

    function testCancelBountyRevertsOnInsufficientEscrow() public {
        LyingERC20 lying = new LyingERC20();
        lying.mint(address(this), reward);
        lying.approve(address(bountyContract), reward);

        bountyContract.createBounty(bountyId, issueUrl, address(lying), reward);

        vm.expectRevert("GitHubBounty: insufficient escrow");
        bountyContract.cancelBounty(bountyId);
    }

    function testReleaseBountyRevertsWhenTransferFails() public {
        TransferFailsERC20 bad = new TransferFailsERC20();
        bad.mint(address(this), reward);
        bad.approve(address(bountyContract), reward);
        bountyContract.createBounty(bountyId, issueUrl, address(bad), reward);
        bountyContract.claimBounty(bountyId, solver);

        vm.expectRevert("GitHubBounty: ERC20 transfer failed");
        bountyContract.releaseBounty(bountyId);
    }

    function testReleaseBountyRevertsOnReentrancy() public {
        ReentrantERC20 reentrant = new ReentrantERC20();
        reentrant.mint(address(this), reward);
        reentrant.approve(address(bountyContract), reward);
        // Fund the mock itself so it can re-enter with a fresh pull if the guard were absent.
        reentrant.mint(address(reentrant), reward);
        reentrant.selfApprove(address(bountyContract), reward);

        bountyContract.createBounty(bountyId, issueUrl, address(reentrant), reward);
        bountyContract.claimBounty(bountyId, solver);

        bytes memory payload = abi.encodeWithSignature("releaseBounty(bytes32)", bountyId);
        reentrant.configure(address(bountyContract), payload);

        bountyContract.releaseBounty(bountyId);

        require(!reentrant.reentrySucceeded(), "Reentrant release must not succeed");
        require(reentrant.balanceOf(solver) == reward, "Solver must be paid exactly once");
    }

    function testCancelBountyRefundsIssuerAndEmits() public {
        vm.prank(issuer);
        bountyContract.createBounty(bountyId, issueUrl, address(token), reward);

        uint256 before = token.balanceOf(issuer);
        vm.expectEmit(true, true, false, true);
        emit BountyCancelled(bountyId, issuer, reward);
        vm.prank(issuer);
        bountyContract.cancelBounty(bountyId);

        require(token.balanceOf(issuer) == before + reward, "Issuer not refunded");
        require(token.balanceOf(address(bountyContract)) == 0, "Escrow not drained");

        (, , , , , , bool cancelled) = bountyContract.bounties(bountyId);
        require(cancelled, "Not marked cancelled");
    }

    function testCancelBountyRevertsForNonIssuer() public {
        _createDefault();

        vm.prank(stranger);
        vm.expectRevert("GitHubBounty: only issuer");
        bountyContract.cancelBounty(bountyId);

        (, , , , , , bool cancelled) = bountyContract.bounties(bountyId);
        require(!cancelled, "Unauthorized cancel must not persist");
    }

    function testCancelBountyRevertsAfterRelease() public {
        _createDefault();
        bountyContract.claimBounty(bountyId, solver);
        bountyContract.releaseBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already released");
        bountyContract.cancelBounty(bountyId);
    }

    function testCancelBountyRevertsOnDoubleCancel() public {
        _createDefault();
        bountyContract.cancelBounty(bountyId);

        vm.expectRevert("GitHubBounty: bounty already cancelled");
        bountyContract.cancelBounty(bountyId);
    }

    function testCancelBountyRevertsWhenTransferFails() public {
        TransferFailsERC20 bad = new TransferFailsERC20();
        bad.mint(address(this), reward);
        bad.approve(address(bountyContract), reward);
        bountyContract.createBounty(bountyId, issueUrl, address(bad), reward);

        vm.expectRevert("GitHubBounty: ERC20 transfer failed");
        bountyContract.cancelBounty(bountyId);
    }

    function testMaintainerCanReleaseButNotCancel() public {
        _createDefault();
        bountyContract.setMaintainer(bountyId, maintainer, true);

        vm.prank(maintainer);
        bountyContract.claimBounty(bountyId, solver);
        vm.prank(maintainer);
        bountyContract.releaseBounty(bountyId);

        require(token.balanceOf(solver) == reward, "Maintainer release must pay solver");
    }

    function testMaintainerCannotCancel() public {
        _createDefault();
        bountyContract.setMaintainer(bountyId, maintainer, true);

        vm.prank(maintainer);
        vm.expectRevert("GitHubBounty: only issuer");
        bountyContract.cancelBounty(bountyId);
    }
}
