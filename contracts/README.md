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
| `ChainGuardRegistry.sol` | Risk scores, blacklisted drainers, trusted protocol attestations. | yes — 13 tests |
| `CryptoPayroll.sol` | Batch corporate salary disbursal in one transaction. | yes — 10 tests |
| `FreelancerEscrow.sol` | Milestone-based fund locking with bilateral acceptance and a dispute window. | yes — 41 tests |
| `GitHubBounty.sol` | ERC20 bounty escrow released to a solver on maintainer approval. | yes — 33 tests |
| `OnchainCreditScore.sol` | Credit ratings backed by withdrawable ERC20 collateral. | yes — 24 tests |
| `RecurringBilling.sol` | Onchain subscription allowances, merchant pulls, and subscriber-set amount/interval updates. | yes — 29 tests |
| `UniversalCheckout.sol` | Multi-token payment routing + merchant stablecoin settlement. | yes — 19 tests |

## Measured counts

```
Ran 8 test suites in 3.85ms (12.52ms CPU time): 176 tests passed, 0 failed, 0 skipped (176 total tests)
```

Baseline before the `FreelancerEscrow` / `AIAgentRegistry` work: **6 tests**.
Before the fee / completion / billing / access-control work: **37 tests**.
Before the checks-effects-interactions + reentrancy work: **89 tests**.
Before the escrow / staked-score / guardian / max-pulls work: **91 tests**.
Before the full reentrancy coverage / subscription-update / safe-return-decoding work: **157 tests**.

## Known uncovered behaviour (honest gaps)

- Reentrancy tests now cover every contract that makes an external call:
  `UniversalCheckout`, `RecurringBilling`, `GitHubBounty`, `OnchainCreditScore`,
  `CryptoPayroll`, and `FreelancerEscrow`. `CryptoPayroll` was found to be genuinely
  reentrant on `disburseBatch` (no guard) and was fixed by adding a `nonReentrant`
  modifier; its test is fail-before/pass-after. The `FreelancerEscrow` and
  `OnchainCreditScore` tests are regression guards — those paths were already safe by
  checks-effects-interactions ordering, so the tests pin behaviour rather than prove a
  new fix.
- `GitHubBounty` escrows the reward and pays the solver. The "who resolved the
  GitHub issue" decision is still off-chain: the issuer or a maintainer the
  issuer authorized marks the solver, and the contract does not verify the
  issue/PR merge itself.
- `OnchainCreditScore` now requires staked collateral before a score can be
  issued, and collateral can only be withdrawn once the writer clears the score
  to zero. The score itself is still an owner-attested value, not computed
  on-chain from repayment history.
- `ChainGuardRegistry.setGuardian` now rejects `address(0)`.
- `RecurringBilling` now has a subscriber-settable `maxPulls` (0 = unlimited),
  enforced in `processBilling`, and a subscriber-only `updateSubscription` that changes
  the amount and/or interval for the NEXT pull only (the period clock is not reset, so an
  already-charged period is never repriced). The merchant and token remain immutable: a
  subscriber cannot redirect a merchant's future revenue stream. There is still no
  proration of a partially-elapsed period, and no merchant-side accept/reject of an
  update.
- `FreelancerEscrow` now requires freelancer acceptance and gives the freelancer
  a self-release path after a 7-day dispute window. There is still no arbiter:
  a disputed milestone can only be released by the client.
- Every `_safeTransfer`/`_safeTransferFrom` now decodes the ERC20 return value
  defensively: no data means success, a 32-byte word equal to `1` means success, and
  anything else — `false`, a non-boolean word (e.g. `2`), or a malformed length — is
  treated as failure with the contract's clear `"ERC20 transfer failed"` message instead
  of an `abi.decode` panic. Tokens that return a boolean or nothing keep working
  unchanged. (A token returning a *valid* boolean `true` in a non-standard encoding is
  still rejected; the house policy is strict.)
