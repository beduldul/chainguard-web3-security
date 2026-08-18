// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../CryptoPayroll.sol";

contract CryptoPayrollTest {
    CryptoPayroll public payroll;
    address public emp1 = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public emp2 = address(0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b);

    function setUp() public {
        payroll = new CryptoPayroll();
    }

    function testDisburseBatchEth() public payable {
        address[] memory recipients = new address[](2);
        recipients[0] = emp1;
        recipients[1] = emp2;

        uint256[] memory amounts = new uint256[](2);
        amounts[0] = 100;
        amounts[1] = 200;

        payroll.disburseBatch{value: 300}(
            bytes32("batch-001"),
            address(0),
            recipients,
            amounts
        );

        require(emp1.balance >= 100, "Emp1 balance check");
        require(emp2.balance >= 200, "Emp2 balance check");
    }
}
