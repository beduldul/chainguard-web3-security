# ChainGuard — Web3 Security & Decentralized Commerce

> Intercepts, simulates, and audits EVM & Solana transactions before wallet signatures.
> Also ships a set of onchain commerce contracts built on Base, Solana, and Ethereum.

---

## Overview

ChainGuard is a Next.js application with a companion Chrome Manifest V3 extension.
It contains an onchain transaction firewall, a cross-chain checkout engine, a
corporate payroll contract, an onchain credit score, a freelancer escrow, and a
mempool scanner for drainer activity. Each surface is a route in `app/`.

---

## Modules

1. **ChainGuard Firewall** (`/` & `/wallet-exposure` & `/website-scanner`)
   - Decodes EVM calldata (`approve`, `transfer`, `permit`, `multicall`), traces token state diffs, calculates dynamic 0-100 risk scores, scans token approvals, and audits dApp domains.
2. **Universal Crypto Checkout** (`/checkout` & `/merchant`)
   - Multi-chain payment router across Solana (Phantom), Base (USDC/ETH), Arbitrum (USDT), and Ethereum. Includes embeddable React payment widget generator.
3. **Corporate Crypto Payroll** (`/payroll`)
   - 1-transaction batch salary disbursal engine, employee roster manager, and automated CSV tax reporting.
4. **Onchain Credit Score & Identity** (`/credit-score`)
   - Wallet creditworthiness scoring engine (0-100) based on onchain longevity, transaction count, loan repayments, zero liquidations, and average USD balances. Enables 30% collateral discounts in DeFi lending.
5. **Onchain Freelancer Escrow** (`/escrow`)
   - Milestone-based escrow contract locking client funds and releasing payouts to freelancer wallets upon milestone verification.
6. **AI Security Agent & Drainer Bot Hunter** (`/ai-agent`)
   - Mempool & bytecode scanner detecting fake airdrop drainers, phishing signatures, and honeypot mint calls. Auto-pushes threats to the global blacklist registry.

---

## Smart Contracts

```
contracts/
├── ChainGuardRegistry.sol         # Onchain Security Risk Attestation Registry
├── UniversalCheckout.sol          # Multi-Token Escrow & Merchant Payout Settlement
├── CryptoPayroll.sol              # 1-Tx Batch Salary Disbursal Contract
├── OnchainCreditScore.sol         # Verifiable Onchain Credit Credential Registry
├── FreelancerEscrow.sol           # Milestone Fund Locking & Client Release Contract
├── AIAgentRegistry.sol            # Autonomous Threat Telemetry & Blacklist Registry
└── test/
    ├── ChainGuardRegistry.t.sol   # Foundry Unit Test for Registry
    ├── UniversalCheckout.t.sol    # Foundry Unit Test for Merchant Checkout
    ├── CryptoPayroll.t.sol        # Foundry Unit Test for Batch Payroll
    └── OnchainCreditScore.t.sol   # Foundry Unit Test for Credit Score Credentials
```

---

## Running it

### 1. Production server
```bash
npm run build
npm run start
```
Serves on [http://localhost:3000](http://localhost:3000).

### 2. API integration tests
```bash
node scripts/test-all-apis.mjs
```

### 3. Solidity contract verifier
```bash
node scripts/test-solidity-contracts.mjs
```

---

## Chrome extension (Manifest V3)

1. Open Google Chrome / Brave and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension/` directory.

---

## License

Distributed under the MIT License. Source at
**[beduldul/chainguard-web3-security](https://github.com/beduldul/chainguard-web3-security)**.
