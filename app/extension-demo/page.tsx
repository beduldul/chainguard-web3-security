'use client';

import React from 'react';
import ExtensionMockup from '@/components/ExtensionMockup';
import { Smartphone, ShieldCheck, Zap, Download } from 'lucide-react';

export default function ExtensionDemoPage() {
  return (
    <div className="space-y-8">
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Smartphone className="w-4 h-4 text-cyan-400" />
          <span>ChainGuard Browser Extension Interceptor</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Browser Extension Security Overlay
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Experience how the ChainGuard Chrome/Brave Extension automatically hooks into window.ethereum, intercepts calldata, runs simulation & risk scoring, and blocks phishing drainers before Metamask signature popups appear.
        </p>

        <div className="flex items-center gap-4 pt-2 font-mono text-xs text-gray-400">
          <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" /> Zero Gas Cost Simulation
          </span>
          <span>•</span>
          <span className="flex items-center gap-1.5 text-cyan-400 font-bold">
            <Zap className="w-4 h-4" /> 12ms Latency
          </span>
        </div>
      </div>

      <ExtensionMockup />
    </div>
  );
}
