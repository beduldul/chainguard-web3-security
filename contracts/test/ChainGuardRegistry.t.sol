// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ChainGuardRegistry.sol";
import "./TestHelpers.sol";

contract ChainGuardRegistryTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    ChainGuardRegistry public registry;
    address public maliciousContract = address(0x8192FA000000000000000000000000000092FA);
    address public otherContract = address(uint160(0xDEAD));
    address public guardian = address(uint160(0x600D));
    address public stranger = address(uint160(0xBEEF));

    event ReportSubmitted(
        address indexed targetContract,
        uint256 riskScore,
        bool isBlacklisted,
        string threatCategory
    );
    event GuardianUpdated(address indexed guardian, bool status);

    function setUp() public {
        registry = new ChainGuardRegistry();
    }

    function testSubmitRiskReport() public {
        vm.expectEmit(true, false, false, true);
        emit ReportSubmitted(maliciousContract, 87, true, "UNLIMITED_APPROVAL_DRAINER");
        registry.submitRiskReport(
            maliciousContract,
            87,
            true,
            false,
            "UNLIMITED_APPROVAL_DRAINER"
        );

        (uint256 score, bool blacklisted, bool verified, string memory category, ) = registry.getRiskReport(maliciousContract);

        require(score == 87, "Score mismatch");
        require(blacklisted == true, "Blacklist mismatch");
        require(verified == false, "Verified mismatch");
        require(keccak256(bytes(category)) == keccak256(bytes("UNLIMITED_APPROVAL_DRAINER")), "Category mismatch");
    }

    function testConstructorMakesDeployerOwnerAndGuardian() public view {
        require(registry.owner() == address(this), "Owner mismatch");
        require(registry.guardians(address(this)) == true, "Deployer not guardian");
    }

    function testSetGuardianUpdatesAndEmits() public {
        vm.expectEmit(true, false, false, true);
        emit GuardianUpdated(guardian, true);
        registry.setGuardian(guardian, true);

        require(registry.guardians(guardian) == true, "Guardian not set");

        registry.setGuardian(guardian, false);
        require(registry.guardians(guardian) == false, "Guardian not revoked");
    }

    function testSetGuardianRevertsForNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert("ChainGuard: caller is not owner");
        registry.setGuardian(stranger, true);

        require(registry.guardians(stranger) == false, "Unauthorized guardian write must not persist");
    }

    function testSubmitRiskReportAllowsOwnerWithoutGuardianRole() public {
        // The owner bypasses the guardian check by design.
        registry.submitRiskReport(otherContract, 10, false, true, "NONE");

        (uint256 score, , bool verified, , ) = registry.getRiskReport(otherContract);
        require(score == 10, "Score mismatch");
        require(verified == true, "Verified mismatch");
    }

    function testSubmitRiskReportRevertsForNonGuardian() public {
        vm.prank(stranger);
        vm.expectRevert("ChainGuard: caller is not authorized guardian");
        registry.submitRiskReport(maliciousContract, 87, true, false, "PHISHING");

        (uint256 score, , , , ) = registry.getRiskReport(maliciousContract);
        require(score == 0, "Unauthorized report must not persist");
    }

    function testSubmitRiskReportRevertsForRevokedGuardian() public {
        registry.setGuardian(guardian, true);
        registry.setGuardian(guardian, false);

        vm.prank(guardian);
        vm.expectRevert("ChainGuard: caller is not authorized guardian");
        registry.submitRiskReport(maliciousContract, 87, true, false, "PHISHING");
    }

    function testSubmitRiskReportRevertsAboveMaxScore() public {
        vm.expectRevert("ChainGuard: score max 100");
        registry.submitRiskReport(maliciousContract, 101, false, false, "NONE");
    }

    function testSubmitRiskReportAcceptsBoundaryScores() public {
        registry.submitRiskReport(maliciousContract, 0, false, false, "NONE");
        (uint256 zeroScore, , , , ) = registry.getRiskReport(maliciousContract);
        require(zeroScore == 0, "Zero score mismatch");

        registry.submitRiskReport(otherContract, 100, true, false, "CRITICAL");
        (uint256 maxScore, , , , ) = registry.getRiskReport(otherContract);
        require(maxScore == 100, "Max score mismatch");
    }

    function testSubmitRiskReportRevertsForZeroTarget() public {
        vm.expectRevert("ChainGuard: invalid target");
        registry.submitRiskReport(address(0), 50, false, false, "NONE");
    }

    function testSubmitRiskReportOverwritesPreviousReport() public {
        registry.submitRiskReport(maliciousContract, 30, false, false, "PHISHING");
        registry.submitRiskReport(maliciousContract, 99, true, false, "DRAINER");

        (uint256 score, bool blacklisted, , string memory category, ) = registry.getRiskReport(maliciousContract);
        require(score == 99, "Score not overwritten");
        require(blacklisted == true, "Blacklist not overwritten");
        require(keccak256(bytes(category)) == keccak256(bytes("DRAINER")), "Category not overwritten");
    }

    function testGetRiskReportForUnknownTargetReturnsEmpty() public view {
        (uint256 score, bool blacklisted, bool verified, string memory category, uint256 reportedAt) =
            registry.getRiskReport(address(uint160(0x1234)));
        require(score == 0, "Score mismatch");
        require(blacklisted == false, "Blacklist mismatch");
        require(verified == false, "Verified mismatch");
        require(bytes(category).length == 0, "Category mismatch");
        require(reportedAt == 0, "Reported-at mismatch");
    }
}
