// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../ChainGuardRegistry.sol";

contract ChainGuardRegistryTest {
    ChainGuardRegistry public registry;
    address public maliciousContract = address(0x8192FA000000000000000000000000000092FA);

    function setUp() public {
        registry = new ChainGuardRegistry();
    }

    function testSubmitRiskReport() public {
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
    }
}
