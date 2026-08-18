export interface ThreatEvent {
  id: string;
  timestamp: string;
  chain: string;
  contractAddress: string;
  dappDomain: string;
  threatType: 'UNLIMITED_DRAINER' | 'HONEYPOT_MINT' | 'PROXY_UPGRADE_ATTACK' | 'MALICIOUS_PERMIT';
  riskScore: number;
  status: 'INTERCEPTED_AND_BLACKLISTED' | 'MONITORING';
  details: string;
}

export const INITIAL_THREAT_EVENTS: ThreatEvent[] = [
  {
    id: 'threat-901',
    timestamp: '2026-08-18 20:04:12',
    chain: 'Solana Mainnet (SPL)',
    contractAddress: 'FakeSolAirdropDrainer7777777777777777777',
    dappDomain: 'https://fake-solana-airdrop.xyz',
    threatType: 'UNLIMITED_DRAINER',
    riskScore: 99,
    status: 'INTERCEPTED_AND_BLACKLISTED',
    details: 'Fake Solana Airdrop claiming 50 SOL bonus. Requests full SPL token delegate access.',
  },
  {
    id: 'threat-902',
    timestamp: '2026-08-18 20:02:45',
    chain: 'Base Mainnet',
    contractAddress: '0x8192FA000000000000000000000000000092FA',
    dappDomain: 'https://uniswap-like.xyz',
    threatType: 'MALICIOUS_PERMIT',
    riskScore: 94,
    status: 'INTERCEPTED_AND_BLACKLISTED',
    details: 'EIP-712 offchain permit signature harvesting unlimited USDC spending permissions.',
  },
  {
    id: 'threat-903',
    timestamp: '2026-08-18 19:58:10',
    chain: 'Arbitrum One',
    contractAddress: '0x123456789012345678901234567890123456abcd',
    dappDomain: 'https://arbitrum-free-nft.info',
    threatType: 'HONEYPOT_MINT',
    riskScore: 91,
    status: 'INTERCEPTED_AND_BLACKLISTED',
    details: 'NFT Mint contract with honeypot transfer function preventing token resale.',
  },
];
