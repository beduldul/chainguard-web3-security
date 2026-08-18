// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title ChainGuardRegistry
 * @dev Onchain registry for Web3 transaction risk scores, blacklisted drainers, and trusted protocol attestations.
 */
contract ChainGuardRegistry {
    address public owner;

    struct RiskReport {
        uint256 riskScore; // 0 to 100
        bool isBlacklisted;
        bool isVerified;
        string threatCategory; // e.g. "UNLIMITED_APPROVAL_DRAINER", "HONEYPOT", "PHISHING"
        uint256 reportedAt;
        address reporter;
    }

    // Contract Address => Risk Report
    mapping(address => RiskReport) public riskReports;

    // Authorized Security Guardian Nodes
    mapping(address => bool) public guardians;

    event ReportSubmitted(
        address indexed targetContract,
        uint256 riskScore,
        bool isBlacklisted,
        string threatCategory
    );

    event GuardianUpdated(address indexed guardian, bool status);

    modifier onlyOwner() {
        require(msg.sender == owner, "ChainGuard: caller is not owner");
        _;
    }

    modifier onlyGuardian() {
        require(guardians[msg.sender] || msg.sender == owner, "ChainGuard: caller is not authorized guardian");
        _;
    }

    constructor() {
        owner = msg.sender;
        guardians[msg.sender] = true;
    }

    function setGuardian(address guardian, bool status) external onlyOwner {
        guardians[guardian] = status;
        emit GuardianUpdated(guardian, status);
    }

    function submitRiskReport(
        address targetContract,
        uint256 riskScore,
        bool isBlacklisted,
        bool isVerified,
        string calldata threatCategory
    ) external onlyGuardian {
        require(riskScore <= 100, "ChainGuard: score max 100");
        require(targetContract != address(0), "ChainGuard: invalid target");

        riskReports[targetContract] = RiskReport({
            riskScore: riskScore,
            isBlacklisted: isBlacklisted,
            isVerified: isVerified,
            threatCategory: threatCategory,
            reportedAt: block.timestamp,
            reporter: msg.sender
        });

        emit ReportSubmitted(targetContract, riskScore, isBlacklisted, threatCategory);
    }

    function getRiskReport(address targetContract)
        external
        view
        returns (
            uint256 riskScore,
            bool isBlacklisted,
            bool isVerified,
            string memory threatCategory,
            uint256 reportedAt
        )
    {
        RiskReport memory report = riskReports[targetContract];
        return (
            report.riskScore,
            report.isBlacklisted,
            report.isVerified,
            report.threatCategory,
            report.reportedAt
        );
    }
}
