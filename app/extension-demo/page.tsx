'use client';

import React, { useState } from 'react';
import { Smartphone, ShieldAlert, ShieldCheck, CheckCircle2, Zap } from 'lucide-react';

export default function ExtensionDemoPage() {
  const [selectedTxType, setSelectedTxType] = useState<'APPROVAL' | 'SWAP' | 'PERMIT'>('APPROVAL');

  return (
    <div className="space-y-8 max-w-5xl mx-auto font-vt323">
      {/* Header Banner - 8-Bit Pixel Box */}
      <div className="pixel-box-pink p-6 space-y-3">
        <div className="flex items-center gap-2 text-sm font-pixel text-[#00ff66]">
          <Smartphone className="w-4 h-4 text-[#00ff66]" />
          <span>[CHAINGUARD BROWSER INTERCEPTOR v2.6]</span>
        </div>

        <h1 className="text-xl sm:text-2xl font-pixel text-white tracking-tight">
          BROWSER EXTENSION OVERLAY
        </h1>

        <p className="text-base sm:text-lg text-gray-300 max-w-2xl leading-relaxed">
          Experience how the ChainGuard Chrome/Brave Extension automatically hooks into <code className="text-[#ffe600]">window.ethereum</code>, intercepts calldata, runs simulation & risk scoring, and blocks phishing drainers before Metamask signature popups appear.
        </p>

        <div className="flex flex-wrap items-center gap-4 text-sm font-pixel text-[#00ff66] pt-1">
          <span>⚡ 0 GAS COST SIMULATION</span>
          <span>•</span>
          <span>⏱️ 12ms LATENCY</span>
        </div>
      </div>

      {/* DApp Interface Simulation Frame - 8-Bit Game Screen */}
      <div className="pixel-box-cyan p-6 space-y-6">
        <div className="flex items-center justify-between border-b-4 border-black pb-3 font-pixel text-xs">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 bg-[#ff0055] inline-block" />
            <span className="w-3 h-3 bg-[#ffe600] inline-block" />
            <span className="w-3 h-3 bg-[#00ff66] inline-block" />
            <span className="ml-2 text-cyan-300">HTTP://UNISWAP-LIKE.XYZ</span>
          </div>
          <span className="text-[#00ff66]">STATUS: INTERCEPTOR ACTIVE</span>
        </div>

        {/* Transaction Type Test Selector */}
        <div className="flex flex-wrap gap-3 font-pixel">
          <button
            onClick={() => setSelectedTxType('APPROVAL')}
            className={`px-3 py-2 text-[10px] ${
              selectedTxType === 'APPROVAL'
                ? 'pixel-btn-pink'
                : 'pixel-btn-dark'
            }`}
          >
            ⚠️ HIGH RISK: UNLIMITED USDC SCAN
          </button>
          <button
            onClick={() => setSelectedTxType('SWAP')}
            className={`px-3 py-2 text-[10px] ${
              selectedTxType === 'SWAP'
                ? 'pixel-btn-cyan'
                : 'pixel-btn-dark'
            }`}
          >
            🟢 LOW RISK: UNISWAP V3 TOKEN SWAP
          </button>
          <button
            onClick={() => setSelectedTxType('PERMIT')}
            className={`px-3 py-2 text-[10px] ${
              selectedTxType === 'PERMIT'
                ? 'pixel-btn-pink'
                : 'pixel-btn-dark'
            }`}
          >
            🔴 CRITICAL: EIP-712 PERMIT DRAINER
          </button>
        </div>

        {/* Extension Modal Overlay Preview */}
        <div className="bg-[#08090d] border-4 border-black p-8 flex items-center justify-center min-h-[360px]">
          {selectedTxType === 'APPROVAL' && (
            <div className="w-full max-w-md p-6 bg-[#16101c] border-4 border-[#ff0055] shadow-[8px_8px_0px_0px_#000] space-y-4 font-mono">
              <div className="flex items-center justify-between border-b-2 border-[#ff0055] pb-2">
                <div className="flex items-center gap-2 font-pixel text-xs text-white">
                  <span>👾 CHAINGUARD INTERCEPTOR</span>
                </div>
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#ff0055] text-white">
                  RISK: 87/100
                </span>
              </div>

              <div className="p-3 bg-[#2a0b16] border-2 border-[#ff0055] font-vt323 space-y-1">
                <h4 className="text-lg font-bold text-[#ff6699] flex items-center gap-1.5 font-pixel text-[10px]">
                  ⚠️ HIGH RISK TRANSACTION BLOCKED
                </h4>
                <p className="text-sm text-gray-200">
                  Target contract requests UNLIMITED USDC spending access to unverified contract. High probability of wallet drainer!
                </p>
              </div>

              <div className="space-y-1 text-xs font-vt323 text-gray-300">
                <div className="flex justify-between">
                  <span>Target Spender:</span>
                  <span className="text-[#ff6699] font-bold">0x742d...44e0 (Unverified)</span>
                </div>
                <div className="flex justify-between">
                  <span>Allowance Requested:</span>
                  <span className="text-[#ff0055] font-bold">UNLIMITED (2^256-1)</span>
                </div>
                <div className="flex justify-between">
                  <span>Value at Risk:</span>
                  <span className="text-white font-bold">$12,450.00 USD</span>
                </div>
              </div>

              <div className="pt-2 flex gap-3 font-pixel text-[9px]">
                <button className="flex-1 py-2.5 pixel-btn-pink">
                  REJECT TRANSACTION
                </button>
                <button className="px-3 py-2.5 pixel-btn-dark">
                  BYPASS
                </button>
              </div>
            </div>
          )}

          {selectedTxType === 'SWAP' && (
            <div className="w-full max-w-md p-6 bg-[#0c1813] border-4 border-[#00ff66] shadow-[8px_8px_0px_0px_#000] space-y-4 font-mono">
              <div className="flex items-center justify-between border-b-2 border-[#00ff66] pb-2">
                <div className="flex items-center gap-2 font-pixel text-xs text-white">
                  <span>👾 CHAINGUARD INTERCEPTOR</span>
                </div>
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#00ff66] text-black font-bold">
                  SAFE: 0/100
                </span>
              </div>

              <div className="p-3 bg-[#0d2d1e] border-2 border-[#00ff66] font-vt323 space-y-1">
                <h4 className="text-lg font-bold text-[#00ff66] flex items-center gap-1.5 font-pixel text-[10px]">
                  ✅ TRANSACTION VERIFIED SAFE
                </h4>
                <p className="text-sm text-gray-200">
                  Uniswap V3 Swap Router is officially verified. Exact token output matched simulation.
                </p>
              </div>

              <div className="space-y-1 text-xs font-vt323 text-gray-300">
                <div className="flex justify-between">
                  <span>DEX Protocol:</span>
                  <span className="text-[#00ff66] font-bold">Uniswap V3 Router (Verified)</span>
                </div>
                <div className="flex justify-between">
                  <span>In / Out Token:</span>
                  <span className="text-white font-bold">1,000 USDC ➔ 0.3125 WETH</span>
                </div>
              </div>

              <button className="w-full py-2.5 pixel-btn-cyan text-[10px] font-pixel">
                PROCEED TO SIGNATURE
              </button>
            </div>
          )}

          {selectedTxType === 'PERMIT' && (
            <div className="w-full max-w-md p-6 bg-[#1f0b12] border-4 border-[#ff0055] shadow-[8px_8px_0px_0px_#000] space-y-4 font-mono">
              <div className="flex items-center justify-between border-b-2 border-[#ff0055] pb-2">
                <div className="flex items-center gap-2 font-pixel text-xs text-white">
                  <span>👾 CHAINGUARD INTERCEPTOR</span>
                </div>
                <span className="font-pixel text-[8px] px-2 py-0.5 bg-[#ff0055] text-white">
                  CRITICAL: 99/100
                </span>
              </div>

              <div className="p-3 bg-[#380b18] border-2 border-[#ff0055] font-vt323 space-y-1">
                <h4 className="text-lg font-bold text-[#ff3377]">⛔ EIP-712 PERMIT DRAINER DETECTED</h4>
                <p className="text-sm text-gray-200">
                  This off-chain signature grants full spending control to a known phishing address without incurring gas!
                </p>
              </div>

              <button className="w-full py-2.5 pixel-btn-pink text-[10px] font-pixel">
                BLOCK & PROTECT WALLET
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
