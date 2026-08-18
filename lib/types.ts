export type RiskLevel = 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW' | 'SAFE';

export interface RiskFactor {
  id: string;
  label: string;
  points: number;
  severity: 'CRITICAL' | 'HIGH' | 'MODERATE' | 'LOW';
  description: string;
}

export interface DecodedTx {
  functionName: string;
  signature: string;
  contractAddress: string;
  contractName?: string;
  spenderAddress?: string;
  spenderName?: string;
  amount?: string;
  amountFormatted?: string;
  isUnlimitedApproval: boolean;
  rawCalldata: string;
  valueEth: string;
  chainId: number;
  chainName: string;
  params: Record<string, any>;
  provenance: 'PRESET_VECTOR' | 'LIVE_RPC_DECODED' | 'MANUAL_PARSED';
}

export interface ContractSecurityReport {
  address: string;
  name?: string;
  verified: boolean;
  ageDays: number;
  isProxy: boolean;
  adminPresent: boolean;
  holderCount: number;
  liquidityUsd: number;
  knownExploitsCount: number;
  honeypotDetected: boolean;
  creatorAddress: string;
  transactionCount: number;
}

export interface SimulationResult {
  status: 'SUCCESS' | 'REVERTED';
  revertReason?: string;
  gasEstimated: number;
  gasEstimatedUsd: number;
  tokensOut: {
    symbol: string;
    amount: string;
    usdValue: number;
    icon?: string;
    tokenAddress: string;
  }[];
  tokensIn: {
    symbol: string;
    amount: string;
    usdValue: number;
    icon?: string;
    tokenAddress: string;
  }[];
  approvalsGranted: {
    tokenSymbol: string;
    spender: string;
    spenderName?: string;
    allowance: string;
    isUnlimited: boolean;
  }[];
  balanceChanges: {
    asset: string;
    before: string;
    after: string;
    change: string;
    isNegative: boolean;
  }[];
}

export interface RiskAnalysisReport {
  score: number; // 0 - 100
  riskLevel: RiskLevel;
  decodedTx: DecodedTx;
  contractReport: ContractSecurityReport;
  simulation: SimulationResult;
  riskFactors: RiskFactor[];
  aiExplanation: string;
  recommendations: string[];
  dataSource: 'SIMULATION_SANDBOX' | 'LIVE_ONCHAIN_RPC';
}

export interface ApprovalExposure {
  id: string;
  tokenSymbol: string;
  tokenName: string;
  tokenAddress: string;
  spenderAddress: string;
  spenderName: string;
  allowance: string;
  allowanceUsd: number;
  isUnlimited: boolean;
  lastActiveDays: number;
  contractVerified: boolean;
  riskLevel: RiskLevel;
}

export interface DomainScanResult {
  url: string;
  domain: string;
  domainAgeDays: number;
  sslValid: boolean;
  frontendRisk: boolean;
  reportedPhishing: boolean;
  contractsCalled: string[];
  score: number;
  riskLevel: RiskLevel;
  issues: string[];
}
