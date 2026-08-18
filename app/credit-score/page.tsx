'use client';

import React, { useState } from 'react';
import { calculateWalletReputation, WalletReputation } from '@/lib/reputationEngine';
import { Award, ShieldCheck, Search, Clock, Activity, CheckCircle2, AlertOctagon, RefreshCw, Zap, Lock, Sparkles } from 'lucide-react';

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
    <div className="space-y-8 max-w-5xl mx-auto font-tech">
      {/* Header Banner - Pixel Cyberpunk Styling */}
      <div className="bg-[#090d16] border-2 border-cyan-400 shadow-[6px_6px_0px_0px_#00f2fe] p-8 space-y-4 relative overflow-hidden">
        <div className="flex items-center gap-2 text-xs font-tech uppercase text-cyan-400">
          <Award className="w-4 h-4 text-cyan-400" />
          <span>PORTABLE ONCHAIN CREDIT SCORE & REPUTATION LAYER</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-pixel text-white tracking-tight leading-snug">
          WEB3 WALLET CREDIT SCORE
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed font-tech">
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
              className="w-full pl-10 pr-4 py-2.5 bg-black/80 border-2 border-white/20 text-xs font-tech text-cyan-300 focus:outline-none focus:border-cyan-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 border-2 border-cyan-300 pixel-btn"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'CALCULATING...' : 'CALCULATE SCORE'}
          </button>
        </div>
      </div>

      {/* Credit Score Gauge & Breakdown Card */}
      <div className="bg-[#090d16] border-2 border-cyan-500/50 shadow-[6px_6px_0px_0px_#a855f7] p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-white/10 pb-6">
          <div className="flex items-center gap-6">
            {/* Score Ring */}
            <div className="relative flex items-center justify-center w-24 h-24 bg-cyan-950/80 border-4 border-cyan-400 shadow-[0_0_20px_rgba(0,242,254,0.4)]">
              <div className="text-center font-tech">
                <span className="text-4xl font-pixel text-white block leading-none">{reputation.score}</span>
                <span className="text-[10px] text-cyan-400 font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-pixel px-3 py-1 bg-emerald-950 text-emerald-400 border border-emerald-500 inline-block mb-2">
                {reputation.badge}
              </span>
              <h3 className="text-lg font-bold text-white uppercase font-tech">
                Credit Rating: <span className="text-cyan-300">{reputation.tier}</span>
              </h3>
              <p className="text-xs text-emerald-400 font-tech">{reputation.collateralDiscount}</p>
            </div>
          </div>

          <div className="text-left sm:text-right font-tech text-xs">
            <span className="text-gray-400 block uppercase">Scanned Address:</span>
            <span className="text-cyan-300 font-bold">{reputation.address.slice(0, 10)}...{reputation.address.slice(-6)}</span>
          </div>
        </div>

        {/* Reputation Metrics Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-tech text-xs">
          <div className="p-4 bg-black/60 border-2 border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Wallet Longevity</span>
            <span className="text-lg font-bold text-white">{reputation.walletAgeYears} Years</span>
          </div>

          <div className="p-4 bg-black/60 border-2 border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Total Onchain Txs</span>
            <span className="text-lg font-bold text-white">{reputation.totalTransactions.toLocaleString()} Txs</span>
          </div>

          <div className="p-4 bg-black/60 border-2 border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">Successful Repayments</span>
            <span className="text-lg font-bold text-emerald-400">{reputation.successfulRepayments} Loans</span>
          </div>

          <div className="p-4 bg-black/60 border-2 border-white/10 space-y-1">
            <span className="text-gray-400 text-[10px] uppercase font-bold block">DeFi Liquidations</span>
            <span className="text-lg font-bold text-emerald-400">{reputation.liquidationsCount} (Zero)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
