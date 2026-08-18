'use client';

import React, { useState, useEffect } from 'react';
import { PRESET_TRANSACTIONS, TxPreset } from '@/lib/mockData';
import { RiskAnalysisReport } from '@/lib/types';
import RiskScoreBadge from '@/components/RiskScoreBadge';
import TxSimulationCard from '@/components/TxSimulationCard';
import ContractRiskDetails from '@/components/ContractRiskDetails';
import DownloadAuditReport from '@/components/DownloadAuditReport';
import { Shield, ShieldAlert, Sparkles, AlertOctagon, Terminal, CheckCircle2, XCircle, ArrowRight, RefreshCw, Cpu, Globe, Info, Database } from 'lucide-react';

export default function Home() {
  const [selectedPreset, setSelectedPreset] = useState<TxPreset>(PRESET_TRANSACTIONS[0]);
  const [targetContract, setTargetContract] = useState(PRESET_TRANSACTIONS[0].targetContract);
  const [calldata, setCalldata] = useState(PRESET_TRANSACTIONS[0].calldata);
  const [valueEth, setValueEth] = useState(PRESET_TRANSACTIONS[0].valueEth);
  const [chainId, setChainId] = useState<number>(PRESET_TRANSACTIONS[0].chainId);
  const [locale, setLocale] = useState<'en' | 'id'>('en');

  const [loading, setLoading] = useState<boolean>(false);
  const [report, setReport] = useState<RiskAnalysisReport | null>(null);
  const [actionStatus, setActionStatus] = useState<'IDLE' | 'REJECTED' | 'PROCEEDED'>('IDLE');

  const handleRunAudit = async (preset?: TxPreset) => {
    setLoading(true);
    setActionStatus('IDLE');
    const contractToScan = preset ? preset.targetContract : targetContract;
    const dataToScan = preset ? preset.calldata : calldata;
    const valToScan = preset ? preset.valueEth : valueEth;
    const chainToScan = preset ? preset.chainId : chainId;

    try {
      const res = await fetch('/api/analyze-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: contractToScan,
          calldata: dataToScan,
          valueEth: valToScan,
          chainId: chainToScan,
          locale,
          isPreset: !!preset,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReport(data.data);
      }
    } catch (err) {
      console.error('Audit failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPreset = (preset: TxPreset) => {
    setSelectedPreset(preset);
    setTargetContract(preset.targetContract);
    setCalldata(preset.calldata);
    setValueEth(preset.valueEth);
    setChainId(preset.chainId);
    handleRunAudit(preset);
  };

  useEffect(() => {
    handleRunAudit();
  }, []);

  return (
    <div className="space-y-10">
      {/* Hero Header Banner */}
      <div className="relative rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 sm:p-10 overflow-hidden shadow-2xl">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-mono">
            <Shield className="w-3.5 h-3.5" />
            <span>Web3 Transaction Firewall & Calldata Simulator</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight leading-tight">
            Stop Malicious Wallet Signatures <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400">
              Before You Sign.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-gray-300 leading-relaxed font-normal">
            ChainGuard acts as your onchain antivirus security layer. Inspect calldata, simulate token balance diffs, flag unverified contracts, and catch unlimited token approval drains in real time.
          </p>

          <div className="flex flex-wrap items-center gap-6 pt-2 font-mono text-xs text-gray-400">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>12,480+ Contracts Scanned</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-cyan-400 font-bold">$4.82M</span>
              <span>Potential Drains Intercepted</span>
            </div>
            <div className="flex items-center gap-1 text-gray-500">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Sandbox Simulation Mode Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* Preset Test Vector Selector Studio */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-gray-300 uppercase tracking-wider flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" /> Test Vector Studio (1-Click Presets)
          </h3>
          <span className="text-xs text-gray-400 font-mono">Select a scenario to analyze</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRESET_TRANSACTIONS.map((preset) => {
            const isSelected = selectedPreset.id === preset.id;
            return (
              <button
                key={preset.id}
                onClick={() => handleSelectPreset(preset)}
                className={`p-4 rounded-2xl border text-left transition-all ${
                  isSelected
                    ? 'bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_20px_rgba(0,242,254,0.15)] ring-1 ring-cyan-500/50'
                    : 'bg-card border-cardBorder hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span
                    className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md ${
                      preset.category === 'SCAM' || preset.category === 'PERMIT'
                        ? 'bg-rose-950 text-rose-400 border border-rose-800'
                        : preset.category === 'PROXY'
                        ? 'bg-amber-950 text-amber-400 border border-amber-800'
                        : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    }`}
                  >
                    {preset.badge}
                  </span>
                  <span className="text-[11px] font-mono text-gray-500">{preset.chainId === 1 ? 'ETH' : 'Base'}</span>
                </div>
                <h4 className="text-xs font-bold text-white mb-1 line-clamp-1">{preset.name}</h4>
                <p className="text-[11px] text-gray-400 line-clamp-2">{preset.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Manual Input / Custom Calldata Form */}
      <div className="rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Target Transaction Parameters</h3>
          </div>
          
          <button
            onClick={() => handleRunAudit()}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Simulating & Auditing...' : 'Analyze Calldata'}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Target Contract (To)</label>
            <input
              type="text"
              value={targetContract}
              onChange={(e) => setTargetContract(e.target.value)}
              placeholder="0x..."
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">ETH Value (Eth)</label>
            <input
              type="text"
              value={valueEth}
              onChange={(e) => setValueEth(e.target.value)}
              placeholder="0.0"
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Target EVM Chain</label>
            <select
              value={chainId}
              onChange={(e) => setChainId(Number(e.target.value))}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value={8453}>Base Mainnet (8453)</option>
              <option value={1}>Ethereum Mainnet (1)</option>
              <option value={42161}>Arbitrum One (42161)</option>
              <option value={84532}>Base Sepolia (84532)</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Raw Calldata Hex (data)</label>
          <textarea
            value={calldata}
            onChange={(e) => setCalldata(e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
          />
        </div>
      </div>

      {/* Analysis Output Section */}
      {report && (
        <div className="space-y-6">
          {/* Data Provenance & Safety Notice */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-black/40 border border-white/10 font-mono text-xs">
            <span className="text-gray-400 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" /> Data Source:
              <span className="text-cyan-300 font-bold">
                {report.dataSource === 'SIMULATION_SANDBOX' ? 'Security Engine Simulation Sandbox' : 'Live On-chain RPC'}
              </span>
            </span>

            <DownloadAuditReport report={report} />
          </div>

          {/* Main Risk Overview Banner */}
          <div className="rounded-3xl bg-card border border-cardBorder p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-white/10 pb-6">
              <RiskScoreBadge score={report.score} riskLevel={report.riskLevel} size="lg" />

              {/* Action Decision Controls */}
              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <button
                  onClick={() => setActionStatus('REJECTED')}
                  className={`flex-1 md:flex-none px-6 py-3 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 shadow-xl ${
                    actionStatus === 'REJECTED'
                      ? 'bg-rose-700 text-white border border-rose-400 shadow-rose-900/80'
                      : 'bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white shadow-rose-950/50'
                  }`}
                >
                  <XCircle className="w-4 h-4" />
                  {actionStatus === 'REJECTED' ? 'TRANSACTION REJECTED (SAFE)' : 'REJECT TRANSACTION'}
                </button>

                <button
                  onClick={() => setActionStatus('PROCEEDED')}
                  className="px-5 py-3 rounded-xl bg-white/5 hover:bg-white/10 font-bold text-xs text-gray-300 border border-white/10 transition-all"
                >
                  I Understand Risk
                </button>
              </div>
            </div>

            {/* AI Natural Language Explainer Box */}
            <div className="rounded-2xl bg-gradient-to-r from-cyan-950/40 via-blue-950/30 to-purple-950/40 border border-cyan-500/30 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-300">
                  <Sparkles className="w-4 h-4 text-cyan-400 animate-spin" />
                  <span>AI Transaction Safety Summary</span>
                </div>

                {/* Language Switcher */}
                <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10 text-[10px] font-mono">
                  <button
                    onClick={() => {
                      setLocale('en');
                      handleRunAudit();
                    }}
                    className={`px-2 py-0.5 rounded ${locale === 'en' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400'}`}
                  >
                    EN
                  </button>
                  <button
                    onClick={() => {
                      setLocale('id');
                      handleRunAudit();
                    }}
                    className={`px-2 py-0.5 rounded ${locale === 'id' ? 'bg-cyan-500 text-black font-bold' : 'text-gray-400'}`}
                  >
                    ID (Bahasa)
                  </button>
                </div>
              </div>

              <p className="text-xs leading-relaxed text-gray-200 font-medium">
                {report.aiExplanation}
              </p>
            </div>

            {/* Granular Risk Breakdown Factors */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-gray-300 uppercase tracking-wider">
                Risk Breakdown & Detected Threat Vectors ({report.riskFactors.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {report.riskFactors.map((factor) => (
                  <div
                    key={factor.id}
                    className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-1"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-rose-400 flex items-center gap-1.5">
                        <AlertOctagon className="w-3.5 h-3.5" />
                        {factor.label}
                      </span>
                      <span className="font-mono text-[11px] font-bold text-rose-300 px-2 py-0.5 rounded bg-rose-950/80 border border-rose-800">
                        +{factor.points} Risk Points
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-400 leading-relaxed">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Simulation & Contract Security Split View */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TxSimulationCard simulation={report.simulation} />
            <ContractRiskDetails report={report.contractReport} />
          </div>
        </div>
      )}
    </div>
  );
}
