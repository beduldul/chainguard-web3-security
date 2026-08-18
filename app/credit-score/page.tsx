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
    <div className="space-y-8 max-w-5xl mx-auto font-mono">
      {/* Header Banner - 8-Bit Retro Arcade Styling */}
      <div className="pixel-box-gold p-8 space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase text-yellow-400">
          <Award className="w-4 h-4 text-yellow-400" />
          <span>[ONCHAIN CREDIT SCORE & REPUTATION ENGINE]</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-pixel text-yellow-400 tracking-tight leading-snug">
          WEB3 CREDIT RATING
        </h1>

        <p className="text-xs sm:text-sm text-zinc-300 max-w-2xl leading-relaxed">
          Evaluate wallet creditworthiness based on onchain behavior, loan repayment history, and transaction longevity. High-score wallets unlock lower collateral requirements in lending protocols.
        </p>

        {/* Address Search Bar */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={addressInput}
              onChange={(e) => setAddressInput(e.target.value)}
              placeholder="Enter Phantom or 0x wallet address..."
              className="w-full pl-10 pr-4 py-2.5 bg-black border-2 border-zinc-700 text-xs font-mono text-yellow-400 focus:outline-none focus:border-yellow-400"
            />
          </div>
          <button
            onClick={handleSearch}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 pixel-btn-gold text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'CALCULATING...' : 'SCAN SCORE'}
          </button>
        </div>
      </div>

      {/* Credit Score Gauge & Breakdown Card */}
      <div className="pixel-box-green p-8 space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b-2 border-zinc-800 pb-6">
          <div className="flex items-center gap-6">
            {/* Score Ring / Box */}
            <div className="w-24 h-24 bg-black border-4 border-green-500 flex items-center justify-center shadow-[4px_4px_0px_0px_#15803d]">
              <div className="text-center font-mono">
                <span className="text-4xl font-pixel text-green-400 block leading-none">{reputation.score}</span>
                <span className="text-[10px] text-zinc-400 font-bold uppercase">/ 100</span>
              </div>
            </div>

            <div>
              <span className="text-[10px] font-pixel px-3 py-1 bg-green-950 text-green-400 border border-green-600 inline-block mb-2">
                {reputation.badge}
              </span>
              <h3 className="text-lg font-bold text-white uppercase font-mono">
                RATING: <span className="text-yellow-400">{reputation.tier}</span>
              </h3>
              <p className="text-xs text-green-400 font-mono">{reputation.collateralDiscount}</p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono text-xs">
            <span className="text-zinc-400 block uppercase">SCANNED WALLET:</span>
            <span className="text-yellow-400 font-bold">{reputation.address.slice(0, 10)}...{reputation.address.slice(-6)}</span>
          </div>
        </div>

        {/* Reputation Metrics Matrix */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div className="p-4 bg-black border-2 border-zinc-800 space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold block">LONGEVITY</span>
            <span className="text-base font-bold text-white">{reputation.walletAgeYears} Years</span>
          </div>

          <div className="p-4 bg-black border-2 border-zinc-800 space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold block">TOTAL TXS</span>
            <span className="text-base font-bold text-white">{reputation.totalTransactions.toLocaleString()} Txs</span>
          </div>

          <div className="p-4 bg-black border-2 border-zinc-800 space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold block">REPAYMENTS</span>
            <span className="text-base font-bold text-green-400">{reputation.successfulRepayments} Loans</span>
          </div>

          <div className="p-4 bg-black border-2 border-zinc-800 space-y-1">
            <span className="text-zinc-400 text-[10px] uppercase font-bold block">LIQUIDATIONS</span>
            <span className="text-base font-bold text-green-400">{reputation.liquidationsCount} (Zero)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
