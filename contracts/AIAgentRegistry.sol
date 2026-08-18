// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title AIAgentRegistry
 * @dev Onchain registry storing autonomous threat telemetry and contract blacklists.
 */
contract AIAgentRegistry {
    address public owner;

    struct ThreatRecord {
        address targetContract;
        string dappDomain;
        string threatType;
        uint256 riskScore;
        uint256 detectedAt;
    }

    mapping(address => bool) public isBlacklisted;
    mapping(address => ThreatRecord) public threatRecords;

    event ThreatRecorded(address indexed targetContract, string dappDomain, uint256 riskScore);

    modifier onlyOwner() {
        require(msg.sender == owner, "AIAgent: caller is not owner");
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function recordThreat(
        address targetContract,
        string calldata dappDomain,
        string calldata threatType,
        uint256 riskScore
    ) external onlyOwner {
        isBlacklisted[targetContract] = true;
        threatRecords[targetContract] = ThreatRecord({
            targetContract: targetContract,
            dappDomain: dappDomain,
            threatType: threatType,
            riskScore: riskScore,
            detectedAt: block.timestamp
        });

        emit ThreatRecorded(targetContract, dappDomain, riskScore);
    }
}
