# 🛡️ ChainGuard — Onchain Transaction Guardian

> **The Next-Generation Web3 Transaction Firewall & Calldata Security Layer.**  
> *Intersects, simulates, and audits EVM transactions before wallet signatures.*

---

## 🌟 Overview

**ChainGuard** is a full-stack Web3 security platform that acts as an **onchain antivirus and firewall**. Before a user signs an EVM transaction in MetaMask, Rabby, or Coinbase Wallet, ChainGuard intercepts the raw calldata, simulates token balance diffs, checks contract source verification, flags unlimited approval risks, and provides human-readable AI explanations.

---

## 🏗️ Architecture Overview

```
                          ┌──────────────────────────┐
                          │       dApp / Web3        │
                          │   Requests Signature     │
                          └────────────┬─────────────┘
                                       │ Intercept
                                       ▼
                          ┌──────────────────────────┐
                          │   ChainGuard Firewall    │
                          │  Extension / Middleware  │
                          └────────────┬─────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              ▼                                                 ▼
  ┌───────────────────────┐                         ┌───────────────────────┐
  │   Calldata Decoder    │                         │  Contract Risk Audit  │
  │  (ERC20, ERC721, EIP) │                         │ (Age, Proxy, Admin)   │
  └───────────┬───────────┘                         └───────────┬───────────┘
              │                                                 │
              └────────────────────────┬────────────────────────┘
                                       ▼
                          ┌──────────────────────────┐
                          │    Risk Scoring Engine   │
                          │      (Score: 0-100)      │
                          └────────────┬─────────────┘
                                       │
                                       ▼
                          ┌──────────────────────────┐
                          │   AI Explainer (EN/ID)   │
                          │    Human Safety Warning  │
                          └────────────┬─────────────┘
                                       │
              ┌────────────────────────┴────────────────────────┐
              ▼                                                 ▼
  🔴 CRITICAL (Score >= 75)                         🟢 SAFE / APPROVED
  [ REJECT TRANSACTION ]                             [ PROCEED TO SIGN ]
```

---

## 🔥 Key Feature Modules

1. **Transaction Firewall & Calldata Decoder** (`app/page.tsx` & `lib/txDecoder.ts`)
   - Decodes EVM function signatures (`approve`, `transfer`, `permit`, `setApprovalForAll`, `multicall`, `execute`).
   - Flags **Unlimited Token Approvals** (`2^256-1`) and calculates potential at-risk asset exposure.
2. **Pre-Execution State Simulation** (`lib/simulator.ts`)
   - Pre-traces token output/input deltas, gas fees in ETH & USD, and before/after wallet balances.
3. **Deterministic 0-100 Risk Score Engine** (`lib/riskEngine.ts`)
   - Weighted threat factors (+30 unlimited approval, +20 unverified source code, +15 age < 7 days, +20 proxy with unknown admin, +25 blacklisted address).
4. **Wallet Exposure & Revoke Manager** (`app/wallet-exposure/page.tsx`)
   - Scans active token approvals across USDT, USDC, WETH, DAI, and NFTs. Provides 1-click gasless simulation revokes.
5. **dApp Website & Domain Scanner** (`app/website-scanner/page.tsx`)
   - Audits domain age, SSL certificate, frontend scripts, and Etherscan blocklist reports.
6. **Manifest V3 Chrome Extension Package** (`extension/`)
   - Injected Web3 Provider content script hooking into `window.ethereum.request` before MetaMask popups appear.
7. **Solidity Smart Contract Security Registry** (`contracts/`)
   - Onchain registry for recording blacklisted contracts, security attestations, and risk reports on testnets/mainnet.
8. **Developer Security SDK & API Hub** (`app/sdk-docs/page.tsx` & `app/api/analyze-tx/route.ts`)
   - TypeScript `@chainguard/sdk` code generator and interactive live REST API testing bench.

---

## 📁 Repository Structure

```
web3/
├── app/                        # Next.js 14 App Router Pages & API Routes
│   ├── page.tsx                # Main Transaction Guardian & Test Vector Studio
│   ├── wallet-exposure/        # Active Approvals Scan & Revoke Manager
│   ├── website-scanner/        # dApp URL / Domain Security Scanner
│   ├── extension-demo/         # Interactive Extension Interceptor Playground
│   ├── sdk-docs/               # Developer Security SDK & Live API Bench
│   └── api/                    # REST API Endpoints (/api/analyze-tx, /api/scan-domain)
├── components/                 # Reusable UI Cards, Badges, Risk Gauges, Navbar & Footer
├── lib/                        # Core Technical Engines
│   ├── txDecoder.ts            # EVM Calldata Parser & Function Selector Decoder
│   ├── riskEngine.ts           # Deterministic Risk Scoring Algorithm
│   ├── simulator.ts            # State Diff & Token Movement Simulator
│   ├── domainScanner.ts        # Website Domain & SSL Auditor
│   ├── aiExplainer.ts          # Natural Language AI Summary Engine (EN/ID)
│   ├── mockData.ts             # Test Vector Presets & Mock Exposure Datasets
│   └── types.ts                # TypeScript Interfaces & Provenance Declarations
├── extension/                  # Chrome / Brave Browser Extension Source (Manifest V3)
│   ├── manifest.json
│   ├── contentScript.js
│   ├── background.js
│   ├── popup.html
│   └── popup.js
├── contracts/                  # Solidity Smart Contracts & Foundry Unit Tests
│   ├── ChainGuardRegistry.sol
│   └── test/ChainGuardRegistry.t.sol
└── package.json
```

---

## ⚡ Quick Start

### 1. Install Dependencies & Run Development Server
```bash
npm install
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### 2. Build for Production
```bash
npm run build
```

---

## 🔌 Load Chrome Extension (Manifest V3)

1. Open Google Chrome / Brave and navigate to `chrome://extensions`.
2. Enable **Developer mode** in the top right.
3. Click **Load unpacked** and select the `extension/` directory in this workspace.

---

## 📄 REST API Endpoint

### `POST /api/analyze-tx`
**Request Body**:
```json
{
  "to": "0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48",
  "calldata": "0x095ea7b30000000000000000000000008192fa000000000000000000000000000092faffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
  "valueEth": "0",
  "chainId": 8453
}
```

---

## 📜 License & Security Disclosure
Built for Web3 Security, Trust, and User Safety. Distributed under the MIT License.
