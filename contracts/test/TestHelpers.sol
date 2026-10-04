// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Minimal cheatcode interface so the suite stays dependency-free (no forge-std).
interface Vm {
    function prank(address) external;
    function expectRevert(bytes calldata) external;
    function expectEmit(bool, bool, bool, bool) external;
    function warp(uint256) external;
    function getBlockTimestamp() external view returns (uint256);
}

/// @dev Well-behaved ERC20: returns true and tracks balances/allowances.
contract MockERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

/// @dev Malicious ERC20 that silently returns false instead of reverting.
contract FalseReturnERC20 {
    function transfer(address, uint256) external pure returns (bool) {
        return false;
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        return false;
    }
}

/// @dev ERC20 that pulls funds fine but reports failure on outgoing transfer.
contract TransferFailsERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return false;
    }
}

/// @dev ERC20 that re-enters a configured target contract during `transferFrom`.
/// Used to prove reentrancy safety of the checkout and billing pull paths.
contract ReentrantERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    address public target;
    bytes public payload;
    bool public attackOn;
    bool public reentrySucceeded;

    bool private _entered;

    function configure(address target_, bytes calldata payload_) external {
        target = target_;
        payload = payload_;
        attackOn = true;
    }

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    /// @dev Lets the mock approve a spender from its own (contract) allowance slot,
    /// so it can fund a re-entrant `transferFrom` where it is the payer.
    function selfApprove(address spender, uint256 amount) external {
        allowance[address(this)][spender] = amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (bool) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return true;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;

        if (attackOn && !_entered) {
            _entered = true;
            (bool ok, ) = target.call(payload);
            reentrySucceeded = ok;
        }

        return true;
    }
}

/// @dev ERC20 that reverts on every transfer.
contract RevertingERC20 {
    function transfer(address, uint256) external pure returns (bool) {
        revert("nope");
    }

    function transferFrom(address, address, uint256) external pure returns (bool) {
        revert("nope");
    }
}
