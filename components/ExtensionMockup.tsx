'use client';

import React, { useState } from 'react';
import { ShieldAlert, ShieldCheck, Lock, AlertOctagon, XCircle, CheckCircle2, ChevronRight } from 'lucide-react';
import { PRESET_TRANSACTIONS } from '@/lib/mockData';

export default function ExtensionMockup() {
  const [selectedTx, setSelectedTx] = useState(PRESET_TRANSACTIONS[0]);
  const [status, setStatus] = useState<'IDLE' | 'INTERCEPTED' | 'REJECTED' | 'APPROVED'>('INTERCEPTED');

  const isScam = selectedTx.category === 'SCAM' || selectedTx.category === 'PERMIT';

  return (
    <div className="max-w-4xl mx-auto rounded-3xl bg-[#090d16] border border-white/15 p-6 shadow-2xl space-y-6">
      {/* Chrome Browser Header Mockup */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-rose-500" />
          <div className="w-3 h-3 rounded-full bg-amber-500" />
          <div className="w-3 h-3 rounded-full bg-emerald-500" />
          <span className="ml-4 font-mono text-xs text-gray-400 bg-black/40 px-3 py-1 rounded-full border border-white/10 flex items-center gap-2">
            <Lock className="w-3 h-3 text-emerald-400" />
            {selectedTx.dappDomain}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          ChainGuard Interceptor Active
        </div>
      </div>

      {/* Preset Selectors */}
      <div className="flex flex-wrap gap-2">
        {PRESET_TRANSACTIONS.map((tx) => (
          <button
            key={tx.id}
            onClick={() => {
              setSelectedTx(tx);
              setStatus('INTERCEPTED');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all border ${
              selectedTx.id === tx.id
                ? 'bg-cyan-950 text-cyan-300 border-cyan-500/50 shadow-[0_0_10px_rgba(0,242,254,0.2)]'
                : 'bg-white/[0.03] text-gray-400 border-white/10 hover:text-white'
            }`}
          >
            {tx.name}
          </button>
        ))}
      </div>

      {/* Browser Screen Content + Popup Overlay */}
      <div className="relative rounded-2xl bg-black/60 border border-white/10 p-8 min-h-[420px] flex items-center justify-center overflow-hidden">
        {/* Background Mock dApp Page */}
        <div className="absolute inset-0 p-8 filter blur-[2px] opacity-40 pointer-events-none space-y-4">
          <div className="flex justify-between items-center border-b border-white/20 pb-4">
            <span className="font-bold text-lg text-white">Uniswap-like DEX</span>
            <div className="px-4 py-2 bg-blue-600 rounded-lg text-xs font-bold">Swap Tokens</div>
          </div>
          <div className="max-w-md mx-auto p-6 rounded-2xl bg-white/5 border border-white/10 space-y-4">
            <h3 className="font-bold text-white">Claim 10,000 AIRDROP USDC</h3>
            <div className="p-4 bg-black/40 rounded-xl text-xs font-mono">Amount: 10,000 USDC</div>
            <button className="w-full py-3 bg-emerald-500 font-bold rounded-xl text-black">
              Connect Wallet & Sign Approval
            </button>
          </div>
        </div>

        {/* ChainGuard Extension Popup Dialog */}
        <div className="relative z-10 w-full max-w-sm rounded-2xl bg-[#0f1522] border-2 border-cyan-500/50 shadow-[0_0_40px_rgba(0,242,254,0.3)] p-5 space-y-4 animate-in fade-in zoom-in duration-300">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <ShieldAlert className="w-4 h-4 text-cyan-400" />
              </div>
              <div>
                <span className="font-bold text-xs text-white tracking-wider block">ChainGuard Firewall</span>
                <span className="text-[10px] text-gray-400 font-mono">Interceptor v2.6</span>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
              {selectedTx.badge}
            </span>
          </div>

          {status === 'INTERCEPTED' ? (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-200 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-xs">
                  <AlertOctagon className="w-4 h-4 text-rose-400" />
                  <span>{isScam ? '⚠️ HIGH RISK TRANSACTION BLOCKED' : '🟢 TRANSACTION PREVIEW'}</span>
                </div>
                <p className="text-[11px] leading-relaxed text-gray-300">
                  {isScam
                    ? 'Target contract requests UNLIMITED USDC spending access to unverified contract. High probability of wallet drainer!'
                    : 'Target is verified Uniswap Router. Token output estimate is 0.3125 WETH.'}
                </p>
              </div>

              {/* Transaction Technical Specs */}
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 font-mono text-[11px] space-y-1.5">
                <div className="flex justify-between text-gray-400">
                  <span>dApp Domain:</span>
                  <span className="text-white font-bold">{selectedTx.dappDomain}</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Contract:</span>
                  <span className="text-cyan-300 font-bold">{selectedTx.targetContract.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Method:</span>
                  <span className="text-amber-300 font-bold">approve() / permit</span>
                </div>
                <div className="flex justify-between text-gray-400">
                  <span>Exposure:</span>
                  <span className="text-rose-400 font-bold">{isScam ? '$4,820 USDC' : '$0.00'}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  onClick={() => setStatus('REJECTED')}
                  className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold text-white text-xs shadow-lg shadow-rose-950/50 transition-all flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" /> REJECT (SAFE)
                </button>
                <button
                  onClick={() => setStatus('APPROVED')}
                  className="py-2.5 px-3 rounded-xl bg-white/10 hover:bg-white/20 font-bold text-gray-300 text-xs transition-all border border-white/10"
                >
                  Bypass
                </button>
              </div>
            </div>
          ) : status === 'REJECTED' ? (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-rose-500/20 border border-rose-500/50 flex items-center justify-center mx-auto text-rose-400">
                <XCircle className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Transaction Blocked & Rejected</h4>
              <p className="text-xs text-gray-400">Your wallet assets remain 100% protected. Calldata signature was intercepted and cancelled.</p>
              <button
                onClick={() => setStatus('INTERCEPTED')}
                className="px-4 py-2 bg-cyan-950 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-800"
              >
                Reset Interceptor
              </button>
            </div>
          ) : (
            <div className="p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center mx-auto text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-white">Passed to Wallet Signing</h4>
              <p className="text-xs text-gray-400">Transaction approved by user and forwarded to Metamask for signature.</p>
              <button
                onClick={() => setStatus('INTERCEPTED')}
                className="px-4 py-2 bg-cyan-950 text-cyan-300 rounded-xl text-xs font-bold border border-cyan-800"
              >
                Reset Interceptor
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
