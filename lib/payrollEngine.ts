export interface Employee {
  id: string;
  name: string;
  role: string;
  walletAddress: string;
  salaryUsd: number;
  paymentToken: string;
  status: 'ACTIVE' | 'ONBOARDING' | 'PAUSED';
}

export interface PayrollBatch {
  batchId: string;
  createdAt: string;
  totalUsd: number;
  totalEmployees: number;
  status: 'PENDING' | 'EXECUTED';
  txHash?: string;
}

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    name: 'Sarah Chen',
    role: 'Lead Solidity Engineer',
    walletAddress: '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045',
    salaryUsd: 6500,
    paymentToken: 'USDC',
    status: 'ACTIVE',
  },
  {
    id: 'emp-2',
    name: 'Alex Rivera',
    role: 'Senior Frontend Developer',
    walletAddress: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
    salaryUsd: 4800,
    paymentToken: 'USDC',
    status: 'ACTIVE',
  },
  {
    id: 'emp-3',
    name: 'Marcus Vance',
    role: 'Security Researcher',
    walletAddress: '0xef1c6e67703fe196724ded0749da599e8cb1094a',
    salaryUsd: 5200,
    paymentToken: 'USDC',
    status: 'ACTIVE',
  },
  {
    id: 'emp-4',
    name: 'Elena Rostova',
    role: 'Product Designer',
    walletAddress: '0x8192FA000000000000000000000000000092FA',
    salaryUsd: 4200,
    paymentToken: 'USDC',
    status: 'ACTIVE',
  },
];
