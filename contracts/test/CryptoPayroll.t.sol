// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "../CryptoPayroll.sol";
import "./TestHelpers.sol";

contract CryptoPayrollTest {
    Vm constant vm = Vm(0x7109709ECfa91a80626fF3989D68f67F5b1DD12D);

    CryptoPayroll public payroll;
    address public emp1 = address(0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045);
    address public emp2 = address(0x3A4b9c1D2E3F4A5b6C7d8e9F0a1b2C3D4e5F6a7b);

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

    function _recipients() internal view returns (address[] memory) {
        address[] memory recipients = new address[](1);
        recipients[0] = emp1;
        return recipients;
    }

    function _amounts() internal pure returns (uint256[] memory) {
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;
        return amounts;
    }

    function testDisburseBatchRevertsOnLengthMismatch() public {
        address[] memory recipients = new address[](2);
        recipients[0] = emp1;
        recipients[1] = emp2;
        uint256[] memory amounts = new uint256[](1);
        amounts[0] = 100;

        vm.expectRevert("Payroll: length mismatch");
        payroll.disburseBatch(bytes32("batch-002"), address(0), recipients, amounts);
    }

    function testDisburseBatchRevertsOnNoRecipients() public {
        address[] memory recipients = new address[](0);
        uint256[] memory amounts = new uint256[](0);

        vm.expectRevert("Payroll: no recipients");
        payroll.disburseBatch(bytes32("batch-003"), address(0), recipients, amounts);
    }

    function testDisburseBatchRevertsOnIncorrectEthValue() public {
        vm.expectRevert("Payroll: incorrect ETH value");
        payroll.disburseBatch{value: 99}(bytes32("batch-004"), address(0), _recipients(), _amounts());
    }

    function testDisburseBatchErc20PullsFunds() public {
        MockERC20 token = new MockERC20();
        token.mint(address(this), 100);
        token.approve(address(payroll), 100);

        payroll.disburseBatch(bytes32("batch-005"), address(token), _recipients(), _amounts());

        require(token.balanceOf(emp1) == 100, "Recipient not paid");
        require(token.balanceOf(address(this)) == 0, "Payer not debited");
    }

    function testDisburseBatchRevertsWhenErc20ReturnsFalse() public {
        FalseReturnERC20 token = new FalseReturnERC20();

        vm.expectRevert("Payroll: ERC20 transferFrom failed");
        payroll.disburseBatch(bytes32("batch-006"), address(token), _recipients(), _amounts());
    }

    function testDisburseBatchRevertsWhenErc20TransferFromReverts() public {
        RevertingERC20 token = new RevertingERC20();

        vm.expectRevert("Payroll: ERC20 transferFrom failed");
        payroll.disburseBatch(bytes32("batch-007"), address(token), _recipients(), _amounts());
    }

    /// @dev FAIL-BEFORE/PASS-AFTER: before the `nonReentrant` guard was added, the
    /// re-entrant `disburseBatch` call succeeded and paid the recipient a second time.
    function testDisburseBatchIsReentrancySafe() public {
        ReentrantERC20 token = new ReentrantERC20();
        token.mint(address(this), 1_000);
        token.approve(address(payroll), 1_000);
        // Fund the mock itself so it can pay for a re-entrant batch if the guard were absent.
        token.mint(address(token), 1_000);
        token.selfApprove(address(payroll), 1_000);

        bytes memory payload = abi.encodeWithSignature(
            "disburseBatch(bytes32,address,address[],uint256[])",
            bytes32("batch-inner"),
            address(token),
            _recipients(),
            _amounts()
        );
        token.configure(address(payroll), payload);

        payroll.disburseBatch(bytes32("batch-outer"), address(token), _recipients(), _amounts());

        require(!token.reentrySucceeded(), "Reentrant disburseBatch must not succeed");
        require(token.balanceOf(emp1) == 100, "Recipient must be paid exactly once");
        require(token.balanceOf(address(this)) == 900, "Payer must be debited exactly once");
    }

    function testDisburseBatchRevertsOnNonBooleanReturn() public {
        NonBooleanERC20 token = new NonBooleanERC20();

        vm.expectRevert("Payroll: ERC20 transferFrom failed");
        payroll.disburseBatch(bytes32("batch-008"), address(token), _recipients(), _amounts());
    }

    function testDisburseBatchRevertsOnOversizedReturn() public {
        OversizedReturnERC20 token = new OversizedReturnERC20();

        vm.expectRevert("Payroll: ERC20 transferFrom failed");
        payroll.disburseBatch(bytes32("batch-009"), address(token), _recipients(), _amounts());
    }
}
