'use client';

import React, { useState } from 'react';
import { RiskAnalysisReport } from '@/lib/types';
import { Download, CheckCircle2 } from 'lucide-react';

interface DownloadAuditReportProps {
  report: RiskAnalysisReport;
}

export default function DownloadAuditReport({ report }: DownloadAuditReportProps) {
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    const exportData = {
      title: 'ChainGuard Security Audit Certificate',
      timestamp: new Date().toISOString(),
      securityScore: `${report.score}/100`,
      riskLevel: report.riskLevel,
      targetContract: report.decodedTx.contractAddress,
      functionSignature: report.decodedTx.signature,
      unlimitedApprovalFlag: report.decodedTx.isUnlimitedApproval,
      threatFactors: report.riskFactors,
      simulationTrace: report.simulation,
      aiSummary: report.aiExplanation,
      contractAudit: report.contractReport,
      dataProvenance: report.dataSource,
    };

    const jsonStr = JSON.stringify(exportData, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `chainguard_audit_${report.decodedTx.contractAddress.slice(0, 8)}_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2500);
  };

  return (
    <button
      onClick={handleDownload}
      className="px-4 py-2 rounded-xl bg-cyan-950/60 hover:bg-cyan-900/80 text-cyan-300 border border-cyan-500/40 font-mono text-xs font-bold transition-all flex items-center gap-1.5"
    >
      {downloaded ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Download className="w-3.5 h-3.5 text-cyan-400" />}
      {downloaded ? 'Audit Report Exported!' : 'Export Security Audit JSON'}
    </button>
  );
}
