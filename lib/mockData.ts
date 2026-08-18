import { ApprovalExposure } from './types';

export interface TxPreset {
  id: string;
  name: string;
  category: 'SCAM' | 'LEGIT' | 'PERMIT' | 'PROXY';
  badge: string;
  dappDomain: string;
  targetContract: string;
  contractName: string;
  valueEth: string;
  calldata: string;
  chainId: number;
  description: string;
}

export const PRESET_TRANSACTIONS: TxPreset[] = [
  {
    id: 'unlimited-approval-scam',
    name: '⚠️ High Risk: Unlimited USDC Approval Scam',
    category: 'SCAM',
    badge: 'CRITICAL RISK (87/100)',
    dappDomain: 'https://uniswap-like.xyz',
    targetContract: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC token
    contractName: 'USDC Token (Targeting Spender 0x8192...92FA)',
    valueEth: '0',
    // approve(spender=0x8192FA000000000000000000000000000092FA, amount=type(uint256).max)
    calldata: '0x095ea7b30000000000000000000000008192fa000000000000000000000000000092faffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    chainId: 8453,
    description: 'Fake Uniswap clone requesting unlimited allowance for 0x8192...92FA unverified spender.',
  },
  {
    id: 'legit-uniswap-swap',
    name: '🟢 Low Risk: Uniswap V3 Token Swap (1,000 USDC → WETH)',
    category: 'LEGIT',
    badge: 'SAFE (12/100)',
    dappDomain: 'https://app.uniswap.org',
    targetContract: '0xef1c6e67703fe196724ded0749da599e8cb1094a',
    contractName: 'Uniswap Universal Router (Verified)',
    valueEth: '0',
    calldata: '0x35935010000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000020008',
    chainId: 8453,
    description: 'Standard token swap on official Uniswap router with exact input bounds.',
  },
  {
    id: 'permit-signature-drainer',
    name: '🔴 Critical: EIP-712 Permit Signature Drainer',
    category: 'PERMIT',
    badge: 'CRITICAL DRAINER (94/100)',
    dappDomain: 'https://eth-reward-claim.xyz',
    targetContract: '0x123456789012345678901234567890123456abcd',
    contractName: 'FakeAirdropDrainer (Blacklisted Honeypot)',
    valueEth: '0',
    // permit signature call
    calldata: '0xd547741f000000000000000000000000d8da6bf26964af9d7eed9e03e53415d37aa96045000000000000000000000000123456789012345678901234567890123456abcdffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    chainId: 1,
    description: 'Off-chain gasless signature scam granting complete token withdrawal rights without standard tx gas warning.',
  },
  {
    id: 'proxy-nft-mint',
    name: '🟡 Moderate: Unverified Proxy NFT Mint Call',
    category: 'PROXY',
    badge: 'MODERATE RISK (58/100)',
    dappDomain: 'https://cyber-pass-mint.io',
    targetContract: '0x91F8401928374829103984128913941829139418',
    contractName: 'Unverified Upgradeable NFT Proxy',
    valueEth: '0.05',
    calldata: '0xa22cb46500000000000000000000000091f84019283748291039841289139418291394180000000000000000000000000000000000000000000000000000000000000001',
    chainId: 8453,
    description: 'NFT mint call on proxy contract with unverified logic and active single-key admin.',
  },
];

export const MOCK_WALLET_EXPOSURES: ApprovalExposure[] = [
  {
    id: 'exp-1',
    tokenSymbol: 'USDT',
    tokenName: 'Tether USD',
    tokenAddress: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    spenderAddress: '0x8192FA000000000000000000000000000092FA',
    spenderName: 'Uniswap-like.xyz (Unverified)',
    allowance: 'UNLIMITED (2^256-1)',
    allowanceUsd: 1200,
    isUnlimited: true,
    lastActiveDays: 14,
    contractVerified: false,
    riskLevel: 'CRITICAL',
  },
  {
    id: 'exp-2',
    tokenSymbol: 'USDC',
    tokenName: 'USD Coin',
    tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    spenderAddress: '0x123456789012345678901234567890123456abcd',
    spenderName: 'FakeAirdropDrainer (Blacklisted)',
    allowance: 'UNLIMITED (2^256-1)',
    allowanceUsd: 900,
    isUnlimited: true,
    lastActiveDays: 45,
    contractVerified: false,
    riskLevel: 'CRITICAL',
  },
  {
    id: 'exp-3',
    tokenSymbol: 'WETH',
    tokenName: 'Wrapped Ether',
    tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    spenderAddress: '0xef1c6e67703fe196724ded0749da599e8cb1094a',
    spenderName: 'Uniswap Universal Router',
    allowance: 'UNLIMITED (2^256-1)',
    allowanceUsd: 4800,
    isUnlimited: true,
    lastActiveDays: 2,
    contractVerified: true,
    riskLevel: 'MODERATE',
  },
  {
    id: 'exp-4',
    tokenSymbol: 'DAI',
    tokenName: 'Dai Stablecoin',
    tokenAddress: '0x6b175474e89094c44da98b954eedeac495271d0f',
    spenderAddress: '0x7a250d5630b4cf539739df2c5dacb4c659f2488d',
    spenderName: 'Uniswap V2 Router (Legacy)',
    allowance: '1,000.00 DAI',
    allowanceUsd: 1000,
    isUnlimited: false,
    lastActiveDays: 120,
    contractVerified: true,
    riskLevel: 'LOW',
  },
  {
    id: 'exp-5',
    tokenSymbol: 'BAYC',
    tokenName: 'Bored Ape Yacht Club NFT',
    tokenAddress: '0xbc4ca0eda7647a8ab7c2061c2e118a18a936f13d',
    spenderAddress: '0x00000000006c3fb6406cb79173c446d22609eb4c',
    spenderName: 'Seaport 1.1 (OpenSea)',
    allowance: 'APPROVED FOR ALL',
    allowanceUsd: 28500,
    isUnlimited: true,
    lastActiveDays: 85,
    contractVerified: true,
    riskLevel: 'MODERATE',
  },
];
