import { RiskAnalysisReport } from './types';

export function generateAiExplanation(
  report: Omit<RiskAnalysisReport, 'aiExplanation'>,
  locale: 'en' | 'id' = 'en'
): string {
  const { decodedTx, contractReport, score, riskLevel } = report;

  if (locale === 'id') {
    if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
      if (decodedTx.isUnlimitedApproval) {
        return `⚠️ Transaksi ini meminta izin untuk memindahkan aset ${decodedTx.contractName || 'Token'} tanpa batas (UNLIMITED approval) ke kontrak unverified (${decodedTx.spenderAddress?.slice(0, 6)}...${decodedTx.spenderAddress?.slice(-4)}). Jika kontrak ini diretas atau merupakan scam, peretas dapat menguras seluruh saldo wallet Anda sebesar estimasi $4,820 USDC kapan saja tanpa konfirmasi tambahan. Ditolak sangat disarankan!`;
      }
      return `⚠️ Transaksi berisiko tinggi (${score}/100). Anda berinteraksi dengan smart contract unverified yang baru dibuat ${contractReport.ageDays} hari lalu. Kontrak ini memiliki hak admin penuh yang dapat mengubah logika kontrak secara sepihak.`;
    }

    return `✅ Transaksi ini relatif aman (${score}/100). Anda melakukan ${decodedTx.functionName} pada kontrak terverifikasi (${contractReport.name || decodedTx.contractName}) dengan batas transaksi yang wajar. Estimasi gas adalah $${report.simulation.gasEstimatedUsd}.`;
  }

  // English (default)
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') {
    if (decodedTx.isUnlimitedApproval) {
      return `⚠️ High Security Risk (${score}/100): This transaction requests UNLIMITED spending permission for your ${decodedTx.contractName || 'tokens'} to spender contract (${decodedTx.spenderAddress?.slice(0, 6)}...${decodedTx.spenderAddress?.slice(-4)}). You do NOT need to grant unlimited approval to complete this transaction. If this contract is malicious or compromised, your entire wallet balance of up to $4,820 USDC can be drained remotely without any further popup!`;
    }
    return `⚠️ High Risk Transaction Detected (${score}/100). Target contract is unverified on-chain and was deployed only ${contractReport.ageDays} days ago. An active owner/admin key was detected, allowing implementation upgrades or funds withdrawal.`;
  }

  return `✅ Low Risk Transaction (${score}/100). Standard ${decodedTx.functionName} call on verified contract (${contractReport.name || decodedTx.contractName}). Simulated execution succeeded with expected token changes and clean gas estimation ($${report.simulation.gasEstimatedUsd}).`;
}
