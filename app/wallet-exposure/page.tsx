'use client';

import React, { useState } from 'react';
import { MOCK_WALLET_EXPOSURES } from '@/lib/mockData';
import { ApprovalExposure } from '@/lib/types';
import { ShieldAlert, ShieldCheck, Lock, Unlock, AlertTriangle, RefreshCw, Trash2, Search, ExternalLink, CheckCircle2 } from 'lucide-react';

const SOLANA_PHANTOM_EXPOSURES: ApprovalExposure[] = [
  {
    id: 'sol-exp-1',
    tokenSymbol: 'USDC (Solana)',
    tokenName: 'USD Coin SPL Token',
    tokenAddress: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
    spenderAddress: 'JUP6LkbZbjS1jKKwapdHNy74zcZ3tLUZoi5QNyVTaV4',
    spenderName: 'Jupiter v6 Aggregator (Verified)',
    allowance: 'UNLIMITED (SPL Delegate)',
    allowanceUsd: 1450,
    isUnlimited: true,
    lastActiveDays: 3,
    contractVerified: true,
    riskLevel: 'MODERATE',
  },
  {
    id: 'sol-exp-2',
    tokenSymbol: 'SOL',
    tokenName: 'Solana Native',
    tokenAddress: 'So11111111111111111111111111111111111111112',
    spenderAddress: 'Raydium7z6YwS7yV8k8GjH9gC8KzZ7R9bH',
    spenderName: 'Raydium Liquidity Pool (Verified)',
    allowance: 'UNLIMITED',
    allowanceUsd: 2800,
    isUnlimited: true,
    lastActiveDays: 1,
    contractVerified: true,
    riskLevel: 'LOW',
  },
  {
    id: 'sol-exp-3',
    tokenSymbol: 'USDT (Solana)',
    tokenName: 'Tether USD SPL',
    tokenAddress: 'Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB',
    spenderAddress: 'FakeSolAirdropDrainer7777777777777777777',
    spenderName: 'FakeSolAirdrop.xyz (Unverified Malicious)',
    allowance: 'UNLIMITED (2^64-1)',
    allowanceUsd: 1200,
    isUnlimited: true,
    lastActiveDays: 12,
    contractVerified: false,
    riskLevel: 'CRITICAL',
  },
];

export default function WalletExposurePage() {
  const [addressInput, setAddressInput] = useState('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2');
  const [exposures, setExposures] = useState<ApprovalExposure[]>(SOLANA_PHANTOM_EXPOSURES);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [isBatchRevoking, setIsBatchRevoking] = useState<boolean>(false);
  const [batchRevokedDone, setBatchRevokedDone] = useState<boolean>(false);

  const totalAtRiskUsd = exposures.reduce((acc, curr) => acc + curr.allowanceUsd, 0);
  const unlimitedCount = exposures.filter((e) => e.isUnlimited).length;
  const criticalCount = exposures.filter((e) => e.riskLevel === 'CRITICAL').length;

  const handleRevokeSingle = (id: string) => {
    setRevokingId(id);
    setTimeout(() => {
      setExposures((prev) => prev.filter((item) => item.id !== id));
      setRevokingId(null);
    }, 1200);
  };

  const handleBatchRevokeHighRisk = () => {
    setIsBatchRevoking(true);
    setTimeout(() => {
      setExposures((prev) => prev.filter((item) => item.riskLevel !== 'CRITICAL'));
      setIsBatchRevoking(false);
      setBatchRevokedDone(true);
      setTimeout(() => setBatchRevokedDone(false), 3000);
    }, 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-purple-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-purple-300">
          <ShieldAlert className="w-4 h-4 text-purple-400" />
          <span>Phantom Wallet SPL Approval Audit & Allowance Revoker</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Wallet Exposure & Token Allowances
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Scan active Solana SPL token delegates and EVM allowances for Phantom wallet address <span className="font-mono text-purple-300 font-bold">{addressInput}</span>.
        </p>

        {/* Address Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Phantom or 0x address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-purple-300 focus:outline-none focus:border-purple-500"
            />
          </div>
          <button className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-purple-500 hover:bg-purple-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2">
            <RefreshCw className="w-3.5 h-3.5" /> Scan Phantom Wallet
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Total Exposure at Risk</span>
          <p className="text-2xl font-black text-rose-400">${totalAtRiskUsd.toLocaleString()} USD</p>
          <span className="text-[10px] text-gray-500 block">Across {exposures.length} active approvals</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Unlimited Approvals</span>
          <p className="text-2xl font-black text-amber-400">{unlimitedCount}</p>
          <span className="text-[10px] text-gray-500 block">Full spending allowance granted</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl space-y-1">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Critical Risk Approvals</span>
          <p className="text-2xl font-black text-rose-500">{criticalCount}</p>
          <span className="text-[10px] text-gray-500 block">Unverified or blacklisted spenders</span>
        </div>

        <div className="p-5 rounded-2xl bg-card border border-cardBorder backdrop-blur-xl flex flex-col justify-between">
          <span className="text-[11px] text-gray-400 font-sans uppercase font-bold">Batch Action</span>
          <button
            onClick={handleBatchRevokeHighRisk}
            disabled={isBatchRevoking || criticalCount === 0}
            className="w-full py-2.5 px-3 rounded-xl bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-bold text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
            {isBatchRevoking ? 'Revoking All High Risk...' : 'Revoke All High Risk'}
          </button>
        </div>
      </div>

      {/* Batch Revoke Alert */}
      {batchRevokedDone && (
        <div className="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Success! All critical and unverified token approvals have been revoked for {addressInput}. Total exposure reduced.</span>
        </div>
      )}

      {/* Active Approvals Table */}
      <div className="rounded-2xl bg-card border border-cardBorder backdrop-blur-xl overflow-hidden shadow-xl">
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <Lock className="w-4 h-4 text-purple-400" /> Active Phantom Token Delegates & Allowances ({exposures.length})
          </h3>
          <span className="text-xs text-gray-400 font-mono">1-Click Gasless Revoke Simulation</span>
        </div>

        {exposures.length > 0 ? (
          <div className="divide-y divide-white/5 overflow-x-auto">
            {exposures.map((item) => (
              <div key={item.id} className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors">
                <div className="space-y-1 min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{item.tokenSymbol}</span>
                    <span className="text-xs text-gray-400 font-mono">({item.tokenName})</span>
                    <span
                      className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        item.riskLevel === 'CRITICAL'
                          ? 'bg-rose-950 text-rose-400 border border-rose-800'
                          : item.riskLevel === 'MODERATE'
                          ? 'bg-amber-950 text-amber-400 border border-amber-800'
                          : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                      }`}
                    >
                      {item.riskLevel}
                    </span>
                  </div>

                  <p className="text-xs font-mono text-gray-400 flex items-center gap-1">
                    Spender: <span className="text-purple-300 font-semibold">{item.spenderName}</span>
                  </p>
                </div>

                <div className="font-mono text-xs text-left sm:text-right space-y-1">
                  <div className="text-white font-bold">{item.allowance}</div>
                  <div className="text-rose-400 font-bold">${item.allowanceUsd.toLocaleString()} At Risk</div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => handleRevokeSingle(item.id)}
                    disabled={revokingId === item.id}
                    className="px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/40 text-xs font-bold font-mono transition-all flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <Unlock className="w-3.5 h-3.5" />
                    {revokingId === item.id ? 'Revoking...' : 'Revoke Approval'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center space-y-3">
            <ShieldCheck className="w-12 h-12 text-emerald-400 mx-auto" />
            <h4 className="font-bold text-white text-base">Your Phantom Wallet is Fully Protected</h4>
            <p className="text-xs text-gray-400 max-w-sm mx-auto">No high-risk or unverified active approvals remain on address {addressInput}.</p>
          </div>
        )}
      </div>
    </div>
  );
}
