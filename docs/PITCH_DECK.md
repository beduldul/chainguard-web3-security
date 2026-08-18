# 🚀 ChainGuard — Investor Pitch & Hackathon Demo Guide

---

## 💎 Executive Summary

**ChainGuard** is a Web3 security layer and transaction firewall. It solves the #1 source of crypto user loss in H1 2026: **human signature exploitation and malicious frontend wallet drainers**.

Before a user signs any transaction or permit message, ChainGuard decodes calldata, simulates token balance diffs, checks contract logic, flags unlimited approval risks, and provides a clear human-language safety warning.

---

## 🎯 The Problem

1. **Illegible Wallet Signatures**: Users are forced to approve raw hex bytecode or obscure spending permits (`eth_signTypedData_v4`).
2. **Unlimited Approval Scams**: Phishing dApps request 2^256-1 token spending allowances, draining wallets long after the user leaves the site.
3. **Frontend Exploits**: Legitimate-looking dApps interact with unverified or newly created contracts.

---

## 🛡️ The ChainGuard Solution

```
User Action (dApp) ➔ ChainGuard Interceptor ➔ Calldata Decoder ➔ State Simulator ➔ 0-100 Risk Engine ➔ AI Explainer ➔ User Sign/Reject
```

- **Zero Gas Cost Pre-Execution Simulation**: Trace token diffs before spending gas.
- **Deterministic 0-100 Threat Score**: Clear risk levels (SAFE, MODERATE, HIGH, CRITICAL).
- **Multi-surface Protection**: Web Dashboard + Chrome Manifest V3 Extension + B2B Developer Security SDK (`@chainguard/sdk`).

---

## 💼 Business Model & Monetization

1. **B2B Security SDK & Developer API Subscriptions**: SaaS subscription for dApp developers and wallet providers integrating `@chainguard/sdk`.
2. **Freemium Web Dashboard & Extension**: Free basic protection with premium real-time MEV protection & automated revoke monitors.
3. **Onchain Security Registry Attestations**: Protocol fees for security auditors attesting safe/malicious contracts onchain.

---

## 🎥 60-Second Demo Walkthrough Script

1. **0:00 - 0:15 (The Problem)**: Show a fake Airdrop dApp requesting unlimited USDC spending permission. Standard MetaMask popup just says "Give permission to spend USDC".
2. **0:15 - 0:35 (ChainGuard Interceptor)**: Show ChainGuard intercepting the transaction. The 0-100 Risk Gauge hits **87/100 (CRITICAL RISK)**.
3. **0:35 - 0:50 (AI & State Trace)**: Show the AI summary explaining in plain language: *"This contract is unverified and deployed 2 days ago. It requests permission to drain up to $4,820 USDC."*
4. **0:50 - 1:00 (Call to Action)**: Click `[ REJECT TRANSACTION ]`. The wallet assets are 100% saved! Show the Web Dashboard and Wallet Allowance Revoker.
