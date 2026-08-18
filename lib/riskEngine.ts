import { DecodedTx, ContractSecurityReport, RiskFactor, RiskLevel, RiskAnalysisReport } from './types';

export function calculateRiskScore(
  decodedTx: DecodedTx,
  contractReport: ContractSecurityReport
): { score: number; riskLevel: RiskLevel; factors: RiskFactor[]; recommendations: string[] } {
  const factors: RiskFactor[] = [];
  const recommendations: string[] = [];
  let score = 0;

  // Rule 1: Unlimited Token Approval Risk (+30 points)
  if (decodedTx.isUnlimitedApproval) {
    score += 30;
    factors.push({
      id: 'UNLIMITED_APPROVAL',
      label: 'Unlimited Token Approval',
      points: 30,
      severity: 'CRITICAL',
      description: 'Transaction requests full 2^256-1 spending allowance. High vulnerability exposure if contract is compromised.',
    });
    recommendations.push('Custom Allowance: Modify your approval to only cover the exact token amount needed.');
  }

  // Rule 2: Unverified Contract Source (+20 points)
  if (!contractReport.verified) {
    score += 20;
    factors.push({
      id: 'UNVERIFIED_SOURCE',
      label: 'Unverified Contract Source',
      points: 20,
      severity: 'HIGH',
      description: 'Source code is not verified on Etherscan/Basescan. Hidden backdoors or malicious logic cannot be audited.',
    });
    recommendations.push('Do not sign unless you personally built or audited this contract source code.');
  }

  // Rule 3: Newly Deployed Contract (< 7 days old) (+15 points)
  if (contractReport.ageDays < 7) {
    score += 15;
    factors.push({
      id: 'RECENT_DEPLOYMENT',
      label: `Recent Contract Deployment (${contractReport.ageDays} days old)`,
      points: 15,
      severity: 'MODERATE',
      description: 'Contract was deployed very recently. Freshly created contracts are frequently used in phishing scams.',
    });
    recommendations.push('Exercise caution with newly deployed contracts with low operational history.');
  }

  // Rule 4: Upgradeable Proxy with Unknown Admin (+20 points)
  if (contractReport.isProxy && contractReport.adminPresent) {
    score += 20;
    factors.push({
      id: 'UNGUARDED_PROXY',
      label: 'Proxy Contract with Mutable Ownership',
      points: 20,
      severity: 'HIGH',
      description: 'Admin can upgrade implementation bytecode at any time to siphon funds.',
    });
    recommendations.push('Verify if proxy contract admin is controlled by a multi-sig or timelock.');
  }

  // Rule 5: Honeypot or Known Exploit Reports (+25 points)
  if (contractReport.honeypotDetected || contractReport.knownExploitsCount > 0) {
    score += 25;
    factors.push({
      id: 'KNOWN_EXPLOIT_MALICIOUS',
      label: 'Blacklisted / Known Exploit Flagged',
      points: 25,
      severity: 'CRITICAL',
      description: 'Security databases have flagged this contract address as associated with active phishing or honeypots.',
    });
    recommendations.push('REJECT IMMEDIATELY. This contract address has active malicious security reports.');
  }

  // Rule 6: Extremely Low Liquidity / Holder Count (+10 points)
  if (contractReport.holderCount < 20) {
    score += 10;
    factors.push({
      id: 'LOW_HOLDER_COUNT',
      label: `Low Holder Count (${contractReport.holderCount} holders)`,
      points: 10,
      severity: 'MODERATE',
      description: 'Target token or contract has minimal holders and negligible liquidity.',
    });
  }

  // Cap score at 100 max
  score = Math.min(100, Math.max(0, score));

  // Determine Risk Level
  let riskLevel: RiskLevel = 'SAFE';
  if (score >= 75) riskLevel = 'CRITICAL';
  else if (score >= 50) riskLevel = 'HIGH';
  else if (score >= 25) riskLevel = 'MODERATE';
  else if (score > 0) riskLevel = 'LOW';

  if (recommendations.length === 0) {
    recommendations.push('Transaction appears standard and low risk. Verify gas limit before confirming.');
  }

  return { score, riskLevel, factors, recommendations };
}
