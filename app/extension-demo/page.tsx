'use client';

import React, { useState } from 'react';
import { Smartphone, Shield, ShieldAlert, ShieldCheck, CheckCircle2, Lock, ArrowRight, Zap } from 'lucide-react';

export default function ExtensionDemoPage() {
  const [selectedTxType, setSelectedTxType] = useState<'APPROVAL' | 'SWAP' | 'PERMIT' | 'NFT'>('APPROVAL');

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#12101e] via-[#0d0f18] to-[#08090e] border border-purple-500/20 p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400">
          <Smartphone className="w-4 h-4 text-purple-400" />
          <span>ChainGuard Browser Extension Interceptor (Manifest V3)</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Browser Extension Security Overlay
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Experience how the ChainGuard Chrome/Brave Extension automatically hooks into <code className="text-purple-300">window.ethereum</code>, intercepts calldata, runs simulation & risk scoring, and blocks phishing drainers before Metamask signature popups appear.
        </p>

        <div className="flex items-center gap-4 text-xs font-mono text-emerald-400 pt-2">
          <span className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-400" /> Zero Gas Cost Simulation</span>
          <span>•</span>
          <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-purple-400" /> 12ms Interception Latency</span>
        </div>
      </div>

      {/* DApp Interface Simulation Frame */}
      <div className="rounded-3xl bg-[#0b0d14] border border-white/10 p-6 space-y-6 shadow-2xl">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500/80" />
            <span className="w-3 h-3 rounded-full bg-amber-500/80" />
            <span className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-gray-400">https://uniswap-like.xyz</span>
          </div>
          <span className="text-xs font-mono text-purple-400 font-semibold">ChainGuard Interceptor Active</span>
        </div>

        {/* Transaction Type Test Selector */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedTxType('APPROVAL')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedTxType === 'APPROVAL'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            ⚠️ High Risk: Unlimited USDC Approval Scan
          </button>
          <button
            onClick={() => setSelectedTxType('SWAP')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedTxType === 'SWAP'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            🟢 Low Risk: Uniswap V3 Token Swap (1,000 USDC ➔ WETH)
          </button>
          <button
            onClick={() => setSelectedTxType('PERMIT')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold font-mono transition-all ${
              selectedTxType === 'PERMIT'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-lg'
                : 'bg-white/5 text-gray-400 border border-white/10 hover:text-white'
            }`}
          >
            🔴 Critical: EIP-712 Permit Signature Drainer
          </button>
        </div>

        {/* Extension Modal Overlay Preview */}
        <div className="relative rounded-2xl bg-[#090b12] border border-white/10 p-8 flex items-center justify-center min-h-[380px]">
          {selectedTxType === 'APPROVAL' && (
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#130d18] border-2 border-rose-500/50 shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-400" />
                  <span className="font-bold text-white text-xs">ChainGuard Interceptor</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  CRITICAL RISK (87/100)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-500/40 space-y-1">
                <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-400" /> HIGH RISK TRANSACTION BLOCKED
                </h4>
                <p className="text-[11px] text-gray-300 leading-normal">
                  Target contract requests UNLIMITED USDC spending access to unverified contract. High probability of wallet drainer!
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">Target Spender:</span>
                  <span className="text-rose-300 font-bold">0x742d...44e0 (Unverified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Allowance Requested:</span>
                  <span className="text-rose-400 font-bold">115,792,089,237,316,195,423...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Value at Risk:</span>
                  <span className="text-white font-bold">$12,450.00 USD</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button className="flex-1 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-all shadow-lg shadow-rose-950/50">
                  Reject Signature
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 text-xs">
                  Bypass (Unsafe)
                </button>
              </div>
            </div>
          )}

          {selectedTxType === 'SWAP' && (
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#091512] border-2 border-emerald-500/50 shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-emerald-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  <span className="font-bold text-white text-xs">ChainGuard Interceptor</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                  SAFE (0/100)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 space-y-1">
                <h4 className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" /> TRANSACTION VERIFIED SAFE
                </h4>
                <p className="text-[11px] text-gray-300 leading-normal">
                  Uniswap V3 Swap Router is officially verified. Exact token output matched simulation.
                </p>
              </div>

              <div className="space-y-1.5 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span className="text-gray-400">DEX Protocol:</span>
                  <span className="text-emerald-300 font-bold">Uniswap V3 Router (Verified)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">In / Out Token:</span>
                  <span className="text-white font-bold">1,000 USDC ➔ 0.3125 WETH</span>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all">
                Proceed to Metamask Signature
              </button>
            </div>
          )}

          {selectedTxType === 'PERMIT' && (
            <div className="w-full max-w-md p-6 rounded-2xl bg-[#160d10] border-2 border-rose-600/70 shadow-2xl space-y-4 font-mono animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between border-b border-rose-500/30 pb-3">
                <div className="flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5 text-rose-500" />
                  <span className="font-bold text-white text-xs">ChainGuard Interceptor</span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-950 text-rose-400 border border-rose-800">
                  CRITICAL DRAINER (99/100)
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/80 border border-rose-500/50 space-y-1">
                <h4 className="text-xs font-bold text-rose-200">⛔ GASLESS PERMIT DRAINER DETECTED</h4>
                <p className="text-[11px] text-gray-300">
                  This EIP-712 off-chain signature grants full spending control to a known phishing address without incurring gas!
                </p>
              </div>

              <button className="w-full py-2.5 rounded-xl bg-rose-600 text-white font-bold text-xs shadow-lg">
                Block & Protect Wallet
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
