'use client';

import React from 'react';
import { SimulationResult } from '@/lib/types';
import { ArrowUpRight, ArrowDownLeft, Fuel, Lock, AlertCircle, CheckCircle2 } from 'lucide-react';

interface TxSimulationCardProps {
  simulation: SimulationResult;
}

export default function TxSimulationCard({ simulation }: TxSimulationCardProps) {
  return (
    <div className="rounded-2xl bg-card border border-cardBorder p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/30">
            <Fuel className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Transaction Simulation Result</h4>
            <p className="text-[11px] text-gray-400">Pre-execution trace & state diff</p>
          </div>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="text-gray-400">Gas Est:</span>
          <span className="text-cyan-300 font-semibold">{simulation.gasEstimated.toLocaleString()} units (~${simulation.gasEstimatedUsd.toFixed(2)})</span>
        </div>
      </div>

      {/* Approvals Granted Banner */}
      {simulation.approvalsGranted.length > 0 && (
        <div className="space-y-2">
          <h5 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5" /> Approvals & Permissions Granted
          </h5>
          {simulation.approvalsGranted.map((app, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xl border flex items-center justify-between ${
                app.isUnlimited
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                  : 'bg-white/[0.04] border-white/10 text-gray-200'
              }`}
            >
              <div>
                <span className="text-xs font-bold">{app.tokenSymbol}</span>
                <span className="text-[11px] font-mono text-gray-400 block">
                  Spender: {app.spenderName || app.spender}
                </span>
              </div>
              <div className="text-right">
                <span
                  className={`text-xs font-extrabold font-mono px-2 py-0.5 rounded-full ${
                    app.isUnlimited ? 'bg-rose-500/20 text-rose-400 border border-rose-500/50' : 'bg-gray-800 text-gray-300'
                  }`}
                >
                  {app.allowance}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Balance Changes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        {/* Tokens Leaving Wallet */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-rose-400 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" /> Tokens Leaving Wallet
          </span>
          {simulation.tokensOut.length > 0 ? (
            simulation.tokensOut.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-300 font-semibold">{t.symbol}</span>
                <span className="text-rose-400 font-bold">-{t.amount} (${t.usdValue.toLocaleString()})</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 font-mono">No liquid tokens directly transferred</p>
          )}
        </div>

        {/* Tokens Entering Wallet */}
        <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
          <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
            <ArrowDownLeft className="w-3.5 h-3.5" /> Tokens Entering Wallet
          </span>
          {simulation.tokensIn.length > 0 ? (
            simulation.tokensIn.map((t, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs font-mono">
                <span className="text-gray-300 font-semibold">{t.symbol}</span>
                <span className="text-emerald-400 font-bold">+{t.amount} (${t.usdValue.toLocaleString()})</span>
              </div>
            ))
          ) : (
            <p className="text-xs text-gray-500 font-mono">No incoming token credits detected</p>
          )}
        </div>
      </div>

      {/* Net Balance Preview */}
      <div className="pt-2 border-t border-white/10">
        <h5 className="text-xs font-bold text-gray-400 mb-2">Simulated Balance Changes</h5>
        <div className="space-y-1.5 font-mono text-xs">
          {simulation.balanceChanges.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-black/40">
              <span className="text-gray-300">{b.asset}</span>
              <div className="flex items-center gap-3">
                <span className="text-gray-500 line-through">{b.before}</span>
                <span className="text-gray-400">➔</span>
                <span className={b.isNegative ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                  {b.after}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
