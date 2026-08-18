# 🛡️ ChainGuard — Web3 Security & Multi-Product Startup Suite

> **The Next-Generation Web3 Security Layer, Transaction Firewall & Decentralized Commerce Infrastructure.**  
> *Intercepts, simulates, and audits EVM & Solana transactions before wallet signatures.*

---

## 🌟 Ecosystem Overview

**ChainGuard** is an all-in-one Web3 security & decentralized financial platform. It features an onchain transaction firewall, Chrome Manifest V3 interceptor, cross-chain checkout engine, corporate crypto payroll, onchain credit scoring, freelancer escrow, and autonomous AI drainer bot hunter.

---

## 🔥 6 Web3 Startup Platforms Included

1. 🥇 **ChainGuard Firewall** (`/` & `/wallet-exposure` & `/website-scanner`)
   - Decodes EVM calldata (`approve`, `transfer`, `permit`, `multicall`), traces token state diffs, calculates dynamic 0-100 risk scores, scans token approvals, and audits dApp domains.
2. 🥈 **Universal Crypto Checkout (Stripe for Web3)** (`/checkout` & `/merchant`)
   - Multi-chain payment router across Solana (Phantom), Base (USDC/ETH), Arbitrum (USDT), and Ethereum. Includes embeddable React payment widget generator.
3. 🥉 **Corporate Crypto Payroll Infrastructure** (`/payroll`)
   - 1-transaction batch salary disbursal engine, employee roster manager, and automated CSV tax reporting.
4. 4️⃣ **Onchain Credit Score & Identity** (`/credit-score`)
   - Wallet creditworthiness scoring engine (0-100) based on onchain longevity, transaction count, loan repayments, zero liquidations, and average USD balances. Unlocks 30% collateral discounts in DeFi lending.
5. 5️⃣ **Onchain Freelancer Escrow Protocol** (`/escrow`)
   - Milestone-based escrow contract locking client funds and releasing payouts to freelancer wallets upon milestone verification.
6. 🤖 **Autonomous AI Security Agent & Drainer Bot Hunter** (`/ai-agent`)
   - Autonomous mempool & bytecode scanner detecting fake airdrop drainers, phishing signatures, and honeypot mint calls 24/7. Auto-pushes threats to the global blacklist registry.

---

## 📁 Smart Contracts & Test Suite

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

## ⚡ Quick Start & Verification Commands

### 1. Run Production Server
```bash
npm run build
npm run start
```
App runs live at **[http://localhost:3000](http://localhost:3000)**.

### 2. Run Automated API Integration Tests
```bash
node scripts/test-all-apis.mjs
```

### 3. Run Solidity Contract Verifier Audit
```bash
node scripts/test-solidity-contracts.mjs
```

---

## 🔌 Load Chrome Extension (Manifest V3)

1. Open Google Chrome / Brave and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension/` directory.

---

## 📜 License & Open Source
Distributed under the MIT License. Published on GitHub at **[beduldul/chainguard-web3-security](https://github.com/beduldul/chainguard-web3-security)**.
