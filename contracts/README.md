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
| `CryptoPayroll.sol` | Batch corporate salary disbursal in one transaction. | yes — 7 tests |
| `FreelancerEscrow.sol` | Milestone-based fund locking with bilateral acceptance and a dispute window. | yes — 37 tests |
| `GitHubBounty.sol` | ERC20 bounty escrow released to a solver on maintainer approval. | yes — 31 tests |
| `OnchainCreditScore.sol` | Credit ratings backed by withdrawable ERC20 collateral. | yes — 22 tests |
| `RecurringBilling.sol` | Onchain subscription allowances and merchant pulls. | yes — 22 tests |
| `UniversalCheckout.sol` | Multi-token payment routing + merchant stablecoin settlement. | yes — 18 tests |

## Measured counts

```
Ran 8 test suites in 3.81ms (11.77ms CPU time): 157 tests passed, 0 failed, 0 skipped (157 total tests)
```

Baseline before the `FreelancerEscrow` / `AIAgentRegistry` work: **6 tests**.
Before the fee / completion / billing / access-control work: **37 tests**.
Before the checks-effects-interactions + reentrancy work: **89 tests**.
Before the escrow / staked-score / guardian / max-pulls work: **91 tests**.

## Known uncovered behaviour (honest gaps)

- Reentrancy tests now cover `UniversalCheckout`, `RecurringBilling`, `GitHubBounty`,
  and `OnchainCreditScore`. `CryptoPayroll` and `FreelancerEscrow` still make
  external calls with no dedicated reentrancy test.
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
  enforced in `processBilling`. It still has no `SubscriptionUpdated` path for
  amount/interval changes — a subscription must be cancelled and recreated.
- `FreelancerEscrow` now requires freelancer acceptance and gives the freelancer
  a self-release path after a 7-day dispute window. There is still no arbiter:
  a disputed milestone can only be released by the client.
- Every `_safeTransfer`/`_safeTransferFrom` assumes the ERC20 returns a boolean
  or no data; tokens that return a non-boolean value would revert on decode.
