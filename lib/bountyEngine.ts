export interface BountyItem {
  id: string;
  githubIssueUrl: string;
  repoName: string;
  issueTitle: string;
  rewardUsdc: number;
  status: 'OPEN' | 'CLAIMED' | 'SOLVED';
  claimedByWallet?: string;
  tags: string[];
}

export const INITIAL_BOUNTIES: BountyItem[] = [
  {
    id: 'bounty-201',
    githubIssueUrl: 'https://github.com/beduldul/chainguard-web3-security/issues/12',
    repoName: 'beduldul/chainguard-web3-security',
    issueTitle: 'Add Solana Anchor IDL calldata decoder to ChainGuard core engine',
    rewardUsdc: 500,
    status: 'OPEN',
    tags: ['Solana', 'Rust', 'Security'],
  },
  {
    id: 'bounty-202',
    githubIssueUrl: 'https://github.com/beduldul/chainguard-web3-security/issues/8',
    repoName: 'beduldul/chainguard-web3-security',
    issueTitle: 'Implement EIP-712 typed data hashing validator for hardware wallets',
    rewardUsdc: 350,
    status: 'OPEN',
    tags: ['Solidity', 'EIP-712', 'TypeScript'],
  },
  {
    id: 'bounty-203',
    githubIssueUrl: 'https://github.com/beduldul/chainguard-web3-security/issues/5',
    repoName: 'beduldul/chainguard-web3-security',
    issueTitle: 'Optimize Next.js 14 static page build performance under 100ms',
    rewardUsdc: 200,
    status: 'SOLVED',
    claimedByWallet: '7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2',
    tags: ['Next.js', 'React', 'Performance'],
  },
];
