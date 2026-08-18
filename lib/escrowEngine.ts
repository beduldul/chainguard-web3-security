export interface EscrowMilestone {
  id: string;
  title: string;
  amountUsd: number;
  status: 'LOCKED' | 'RELEASED' | 'DISPUTED';
  deadlineDays: number;
}

export interface EscrowJob {
  id: string;
  clientAddress: string;
  freelancerAddress: string;
  totalUsd: number;
  tokenSymbol: string;
  milestones: EscrowMilestone[];
  createdAt: string;
}

export const MOCK_ESCROW_JOBS: EscrowJob[] = [
  {
    id: 'job-101',
    clientAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    freelancerAddress: '7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2',
    totalUsd: 4000,
    tokenSymbol: 'USDC',
    createdAt: '2026-08-18',
    milestones: [
      {
        id: 'ms-1',
        title: 'Milestone 1: Smart Contract Development & Foundry Tests',
        amountUsd: 1500,
        status: 'RELEASED',
        deadlineDays: 5,
      },
      {
        id: 'ms-2',
        title: 'Milestone 2: Next.js Frontend Integration & Wallet Connect',
        amountUsd: 2500,
        status: 'LOCKED',
        deadlineDays: 10,
      },
    ],
  },
];
