'use client';

import React, { useState } from 'react';
import { calculateWalletReputation, WalletReputation } from '@/lib/reputationEngine';
import { Award, ShieldCheck, Search, Clock, Activity, CheckCircle2, AlertOctagon, RefreshCw, Zap, Lock } from 'lucide-react';

export default function CreditScorePage() {
  const [addressInput, setAddressInput] = useState('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2');
  const [reputation, setReputation] = useState<WalletReputation>(calculateWalletReputation('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2'));
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setReputation(calculateWalletReputation(addressInput));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>Portable Onchain Credit Score & Reputation Layer</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Web3 Wallet Credit Score & Identity
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Evaluate wallet creditworthiness based on onchain behavior, loan repayment history, and transaction longevity. High-score wallets unlock lower collateral requirements in lending protocols.
        </p>

        {/* Address Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Phantom or 0x wallet address..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Calculating Score...' : 'Calculate Credit Score'}
          </button>
        </div>
      </div>

      {/* Credit Score Gauge & Breakdown Card */}
      <div className="rounded-3xl bg-card border border-cardBorder p-8 backdrop-blur-xl space-y-6 shadow-xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-gradient-to-br from-cyan-500/20 to-emerald-500/20 border-4 border-cyan-400 shadow-[0_0_30px_rgba(0,242,254,0.3)]">
              <div className="text-center font-mono">
                <span className="text-3xl font-black text-white block leading-none">{reputation.score}</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                {reputation.badge}
              </span>
              <h3 className="text-lg font-bold text-white mt-2">
                Credit Rating: <span className="text-cyan-300">{reputation.tier}</span>
              </h3>
              <p className="text-xs text-emerald-400 font-mono mt-0.5">{reputation.collateralDiscount}</p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-gray-400 block">Scanned Wallet Address:</span>
            <span className="text-cyan-300 font-bold">{reputation.address.slice(0, 10)}...{reputation.address.slice(-6)}</span>
          </div>
        </div>

        {/* Reputation Metrics Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] font-sans font-bold uppercase block">Wallet Longevity</span>
            <span className="text-base font-bold text-white">{reputation.walletAgeYears} Years</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] font-sans font-bold uppercase block">Total Onchain Txs</span>
            <span className="text-base font-bold text-white">{reputation.totalTransactions.toLocaleString()} Txs</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] font-sans font-bold uppercase block">Successful Repayments</span>
            <span className="text-base font-bold text-emerald-400">{reputation.successfulRepayments} Loans</span>
          </div>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] font-sans font-bold uppercase block">DeFi Liquidations</span>
            <span className="text-base font-bold text-emerald-400">{reputation.liquidationsCount} (Zero)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
