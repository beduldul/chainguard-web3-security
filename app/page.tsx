'use client';

import React, { useState } from 'react';
import TxSimulationCard from '@/components/TxSimulationCard';
import DownloadAuditReport from '@/components/DownloadAuditReport';
import { PRESET_TRANSACTIONS } from '@/lib/mockData';
import { decodeCalldata } from '@/lib/txDecoder';
import { simulateTransaction } from '@/lib/simulator';
import { calculateRiskScore } from '@/lib/riskEngine';
import { generateAiExplanation } from '@/lib/aiExplainer';
import { ContractSecurityReport } from '@/lib/types';
import { Shield, ShieldAlert, ShieldCheck, Zap, Lock, Terminal, Sparkles, ArrowRight } from 'lucide-react';

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState(PRESET_TRANSACTIONS[0]);
  const decodedResult = decodeCalldata(selectedPreset.targetContract, selectedPreset.calldata, selectedPreset.valueEth, selectedPreset.chainId, true);
  const simulationResult = simulateTransaction(decodedResult);

  const mockContractReport: ContractSecurityReport = {
    address: selectedPreset.targetContract,
    verified: selectedPreset.category !== 'SCAM',
    ageDays: selectedPreset.category === 'SCAM' ? 2 : 450,
    isProxy: selectedPreset.category === 'PROXY',
    adminPresent: selectedPreset.category === 'SCAM',
    holderCount: selectedPreset.category === 'SCAM' ? 14 : 12400,
    liquidityUsd: selectedPreset.category === 'SCAM' ? 450 : 2500000,
    knownExploitsCount: selectedPreset.category === 'SCAM' ? 2 : 0,
    honeypotDetected: selectedPreset.category === 'SCAM',
    creatorAddress: '0x1111222233334444555566667777888899990000',
    transactionCount: selectedPreset.category === 'SCAM' ? 42 : 185000,
  };

  const riskAssessment = calculateRiskScore(decodedResult, mockContractReport);

  const partialReport = {
    score: riskAssessment.score,
    riskLevel: riskAssessment.riskLevel,
    decodedTx: decodedResult,
    contractReport: mockContractReport,
    riskFactors: riskAssessment.factors,
    simulation: simulationResult,
    recommendations: riskAssessment.recommendations,
    dataSource: 'SIMULATION_SANDBOX' as const,
  };

  const aiExplanation = generateAiExplanation(partialReport, 'en');

  const fullReport = {
    ...partialReport,
    aiExplanation,
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Hero Section */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#130f24] via-[#0d0e17] to-[#07080c] border border-purple-500/20 p-8 sm:p-10 overflow-hidden shadow-2xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 bg-purple-950/60 px-3 py-1.5 rounded-full border border-purple-500/30">
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            <span>Onchain Transaction Firewall & Calldata Simulator</span>
          </div>

          <DownloadAuditReport report={fullReport} />
        </div>

        <div className="space-y-3 max-w-3xl">
          <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight">
            Pre-Execution Safety Layer <br />
            <span className="bg-gradient-to-r from-purple-400 via-violet-300 to-emerald-400 bg-clip-text text-transparent">
              Before Wallet Signature.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            ChainGuard simulates EVM transaction calldata, decodes hidden smart contract approvals, calculates dynamic 0-100 risk scores, and flags phishing drainers before Metamask popups appear.
          </p>
        </div>

        {/* Preset Calldata Test Selectors */}
        <div className="space-y-3 pt-2">
          <span className="text-xs font-mono font-bold text-gray-400 uppercase tracking-wider block">
            Select Preset Calldata to Test Simulator:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESET_TRANSACTIONS.map((tx) => {
              const isSelected = selectedPreset.id === tx.id;
              return (
                <button
                  key={tx.id}
                  onClick={() => setSelectedPreset(tx)}
                  className={`p-3.5 rounded-2xl border text-left transition-all font-mono text-xs flex flex-col justify-between space-y-2 ${
                    isSelected
                      ? 'bg-purple-950/80 border-purple-500 shadow-[0_0_20px_rgba(168,85,247,0.25)]'
                      : 'bg-white/[0.03] border-white/10 hover:border-white/20 hover:bg-white/[0.06]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs">{tx.name}</span>
                  </div>
                  <p className="text-[11px] text-gray-400 line-clamp-1">{tx.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Tx Simulator Render */}
      <TxSimulationCard simulation={simulationResult} />
    </div>
  );
}
