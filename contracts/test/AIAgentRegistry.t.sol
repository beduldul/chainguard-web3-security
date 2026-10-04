// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../AIAgentRegistry.sol";
import "./TestHelpers.sol";

contract AIAgentRegistryTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    AIAgentRegistry public registry;
    address public target = address(0x8192FA000000000000000000000000000092FA);
    address public otherTarget = address(uint160(0xDEAD));
    address public stranger = address(uint160(0xBEEF));

    event ThreatRecorded(address indexed targetContract, string dappDomain, uint256 riskScore);

    function setUp() public {
        registry = new AIAgentRegistry();
    }

    function testOwnerIsDeployer() public view {
        require(registry.owner() == address(this), "Owner mismatch");
    }

    function testRecordThreatStoresRecordAndEmits() public {
        vm.expectEmit(true, false, false, true);
        emit ThreatRecorded(target, "phish.example", 96);
        registry.recordThreat(target, "phish.example", "PHISHING", 96);

        require(registry.isBlacklisted(target) == true, "Blacklist mismatch");

        (
            address storedTarget,
            string memory dappDomain,
            string memory threatType,
            uint256 riskScore,
            uint256 detectedAt
        ) = registry.threatRecords(target);

        require(storedTarget == target, "Target mismatch");
        require(keccak256(bytes(dappDomain)) == keccak256(bytes("phish.example")), "Domain mismatch");
        require(keccak256(bytes(threatType)) == keccak256(bytes("PHISHING")), "Threat type mismatch");
        require(riskScore == 96, "Risk score mismatch");
        require(detectedAt == block.timestamp, "Detected-at mismatch");
    }

    function testRecordThreatOverwritesPreviousRecord() public {
        registry.recordThreat(target, "old.example", "PHISHING", 40);
        registry.recordThreat(target, "new.example", "DRAINER", 99);

        (, string memory dappDomain, string memory threatType, uint256 riskScore, ) = registry.threatRecords(target);

        require(keccak256(bytes(dappDomain)) == keccak256(bytes("new.example")), "Domain not overwritten");
        require(keccak256(bytes(threatType)) == keccak256(bytes("DRAINER")), "Threat type not overwritten");
        require(riskScore == 99, "Risk score not overwritten");
    }

    function testRecordThreatRevertsForNonOwner() public {
        vm.prank(stranger);
        vm.expectRevert("AIAgent: caller is not owner");
        registry.recordThreat(target, "phish.example", "PHISHING", 96);

        require(registry.isBlacklisted(target) == false, "Unauthorized write must not persist");
    }

    function testRecordThreatRevertsForNonOwnerOnSecondTarget() public {
        registry.recordThreat(target, "phish.example", "PHISHING", 96);

        vm.prank(stranger);
        vm.expectRevert("AIAgent: caller is not owner");
        registry.recordThreat(otherTarget, "drainer.example", "DRAINER", 100);
    }

    function testRecordThreatAcceptsBoundaryRiskScores() public {
        registry.recordThreat(target, "clean.example", "NONE", 0);
        (, , , uint256 zeroRisk, ) = registry.threatRecords(target);
        require(zeroRisk == 0, "Zero risk mismatch");

        registry.recordThreat(otherTarget, "max.example", "CRITICAL", 100);
        (, , , uint256 maxRisk, ) = registry.threatRecords(otherTarget);
        require(maxRisk == 100, "Max risk mismatch");
    }

    function testRecordThreatAcceptsEmptyMetadata() public {
        registry.recordThreat(target, "", "", 0);

        (, string memory dappDomain, string memory threatType, uint256 riskScore, ) = registry.threatRecords(target);
        require(bytes(dappDomain).length == 0, "Empty domain mismatch");
        require(bytes(threatType).length == 0, "Empty threat type mismatch");
        require(riskScore == 0, "Risk mismatch");
        require(registry.isBlacklisted(target) == true, "Blacklist mismatch");
    }
}
