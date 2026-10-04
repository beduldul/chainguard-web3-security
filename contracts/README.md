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
| `ChainGuardRegistry.sol` | Risk scores, blacklisted drainers, trusted protocol attestations. | yes — 12 tests |
| `CryptoPayroll.sol` | Batch corporate salary disbursal in one transaction. | yes — 7 tests |
| `FreelancerEscrow.sol` | Milestone-based fund locking with client-approved release. | yes — 16 tests |
| `GitHubBounty.sol` | USDC bounties locked to GitHub PR merges. | yes — 8 tests |
| `OnchainCreditScore.sol` | Verifiable credit ratings + loan collateral discounts. | yes — 8 tests |
| `RecurringBilling.sol` | Onchain subscription allowances and merchant pulls. | yes — 15 tests |
| `UniversalCheckout.sol` | Multi-token payment routing + merchant stablecoin settlement. | yes — 18 tests |

## Measured counts

```
Ran 8 test suites: 91 tests passed, 0 failed, 0 skipped (91 total tests)
```

Baseline before the `FreelancerEscrow` / `AIAgentRegistry` work: **6 tests**.
Before the fee / completion / billing / access-control work: **37 tests**.
Before the checks-effects-interactions + reentrancy work: **89 tests**.

## Known uncovered behaviour (honest gaps)

- Reentrancy tests exist only for `UniversalCheckout` and `RecurringBilling`.
  `CryptoPayroll` and `FreelancerEscrow` still make external calls with no
  reentrancy test.
- `GitHubBounty` and `OnchainCreditScore` never move funds: a bounty reward and
  a credit credential are stored metadata only. There is no token escrow or
  payout path in either contract.
- `ChainGuardRegistry.setGuardian` accepts `address(0)` as a guardian (the
  deployer is still a guardian, so this is only an unguarded-input smell, not an
  escalation).
- `RecurringBilling` has no on-chain way for the subscriber to bound the number
  of pulls; the merchant's allowance is the only limit. It also has no
  `SubscriptionUpdated` path — a subscription must be cancelled and recreated.
- `FreelancerEscrow` has no freelancer-acceptance step and no dispute window;
  the client alone controls release.
