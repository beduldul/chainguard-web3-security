// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/// @dev Decodes an ERC20 transfer return value without panicking on malformed data.
/// Empty data (a token that returns nothing) is treated as success, matching the
/// house `_safeTransfer` policy. Exactly 32 bytes equal to 1 is success; anything
/// else — `false`, a non-boolean word, or an oversized/undersized blob — is failure.
/// Mirrors the `_tokenReturnedTrue` helper inlined in every production contract.
function decodeTransferReturn(bytes memory data) pure returns (bool) {
    if (data.length == 0) {
        return true;
    }
    if (data.length != 32) {
        return false;
    }
    uint256 word;
    // solhint-disable-next-line no-inline-assembly
    assembly {
        word := mload(add(data, 0x20))
    }
    return word == 1;
}

/// @dev ERC20 whose `transfer`/`transferFrom` return a 32-byte word that is NOT a
/// valid ABI bool (the integer `2`). A naive `abi.decode(data, (bool))` panics on
/// this; the house `_safeTransfer` treats it as failure with a clear message.
contract NonBooleanERC20 {
    function transfer(address, uint256) external pure returns (uint256) {
        return 2;
    }

    function transferFrom(address, address, uint256) external pure returns (uint256) {
        return 2;
    }
}

/// @dev ERC20 that pulls funds correctly (returning `true`) but whose outgoing
/// `transfer` returns a non-boolean word (`2`). Lets the payout paths be tested
/// without a decode panic.
contract NonBooleanOnTransferERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address to, uint256 amount) external returns (uint256) {
        balanceOf[msg.sender] -= amount;
        balanceOf[to] += amount;
        return 2;
    }

    function transferFrom(address from, address to, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        balanceOf[to] += amount;
        return true;
    }
}

/// @dev ERC20 whose transfers return an oversized (64-byte) blob, exercising the
/// malformed-length branch of the return-value decoder.
contract OversizedReturnERC20 {
    function transfer(address, uint256) external pure returns (uint256, uint256) {
        return (1, 1);
    }

    function transferFrom(address, address, uint256) external pure returns (uint256, uint256) {
        return (1, 1);
    }
}

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

        if (attackOn && !_entered) {
            _entered = true;
            (bool ok, ) = target.call(payload);
            reentrySucceeded = ok;
        }

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

/// @dev ERC20 that reports success on `transferFrom` but never credits the recipient.
/// Used to prove escrow-integrity checks that compare the held balance against the reward.
contract LyingERC20 {
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => uint256)) public allowance;

    function mint(address to, uint256 amount) external {
        balanceOf[to] += amount;
    }

    function approve(address spender, uint256 amount) external returns (bool) {
        allowance[msg.sender][spender] = amount;
        return true;
    }

    function transfer(address, uint256) external pure returns (bool) {
        return true;
    }

    function transferFrom(address from, address, uint256 amount) external returns (bool) {
        allowance[from][msg.sender] -= amount;
        balanceOf[from] -= amount;
        // Intentionally does not credit the recipient.
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
