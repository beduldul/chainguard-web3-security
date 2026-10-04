# Contracts

Solidity contracts for the ChainGuard Web3 security dashboard. Built and tested
with [Foundry](https://book.getfoundry.sh/) (solc `0.8.20`, `evm_version = paris`).

## Running the suite

```bash
forge build          # compile
forge test -vv       # run the full test suite (verbose)
```

Tests live in `contracts/test/`. They are intentionally **dependency-free** — no
`forge-std` submodule. A tiny hand-rolled `Vm` interface in
`contracts/test/TestHelpers.sol` provides the `vm.prank`, `vm.expectRevert`, and
`vm.expectEmit` cheatcodes the suite needs.

## Contract map

| Contract | Purpose | Tested |
| --- | --- | --- |
| `AIAgentRegistry.sol` | Onchain registry of autonomous threat telemetry + contract blacklist. | yes — 7 tests |
| `ChainGuardRegistry.sol` | Risk scores, blacklisted drainers, trusted protocol attestations. | yes — 1 test (happy path) |
| `CryptoPayroll.sol` | Batch corporate salary disbursal in one transaction. | yes — 7 tests |
| `FreelancerEscrow.sol` | Milestone-based fund locking with client-approved release. | yes — 11 tests |
| `GitHubBounty.sol` | USDC bounties locked to GitHub PR merges. | yes — 1 test (happy path) |
| `OnchainCreditScore.sol` | Verifiable credit ratings + loan collateral discounts. | yes — 1 test (happy path) |
| `RecurringBilling.sol` | Onchain subscription allowances and merchant pulls. | yes — 1 test (happy path) |
| `UniversalCheckout.sol` | Multi-token payment routing + merchant stablecoin settlement. | yes — 8 tests |

## Measured counts

```
Ran 8 test suites: 37 tests passed, 0 failed, 0 skipped (37 total tests)
```

Baseline before the `FreelancerEscrow` / `AIAgentRegistry` work: **6 tests**.

## Known uncovered behaviour (honest gaps)

- `ChainGuardRegistry`, `GitHubBounty`, `OnchainCreditScore`, `RecurringBilling`
  only have happy-path tests — no revert/access-control/event assertions.
- `FreelancerEscrow.isCompleted` is never set by any code path (dead field).
- `UniversalCheckout.feeBps` is declared but never applied to a payout.
- `RecurringBilling.processBilling` moves no funds — it only advances a timestamp.
- No reentrancy tests exist for any contract.
