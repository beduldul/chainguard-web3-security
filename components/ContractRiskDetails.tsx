'use client';

import React from 'react';
import { ContractSecurityReport } from '@/lib/types';
import { CheckCircle2, XCircle, AlertTriangle, ShieldCheck, FileCode, Users, Clock, Key } from 'lucide-react';

interface ContractRiskDetailsProps {
  report: ContractSecurityReport;
}

export default function ContractRiskDetails({ report }: ContractRiskDetailsProps) {
  return (
    <div className="rounded-2xl bg-card border border-cardBorder p-5 backdrop-blur-xl space-y-4">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-blue-500/10 border border-blue-500/30">
            <FileCode className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Target Contract Risk Analysis</h4>
            <p className="font-mono text-[11px] text-gray-400">
              {report.address.slice(0, 10)}...{report.address.slice(-8)}
            </p>
          </div>
        </div>

        {report.verified ? (
          <span className="flex items-center gap-1 text-xs font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded-full">
            <CheckCircle2 className="w-3.5 h-3.5" /> Verified Source
          </span>
        ) : (
          <span className="flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 px-2.5 py-1 rounded-full animate-pulse">
            <XCircle className="w-3.5 h-3.5" /> Unverified Source Code
          </span>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 font-mono text-xs">
        {/* Contract Age */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            <Clock className="w-3 h-3 text-cyan-400" /> Contract Age
          </div>
          <span className={`font-bold ${report.ageDays < 7 ? 'text-rose-400' : 'text-white'}`}>
            {report.ageDays} Days Old
          </span>
        </div>

        {/* Holders */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            <Users className="w-3 h-3 text-cyan-400" /> Token Holders
          </div>
          <span className={`font-bold ${report.holderCount < 20 ? 'text-amber-400' : 'text-white'}`}>
            {report.holderCount.toLocaleString()}
          </span>
        </div>

        {/* Proxy State */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            <Key className="w-3 h-3 text-cyan-400" /> Proxy Architecture
          </div>
          <span className={`font-bold ${report.isProxy ? 'text-amber-400' : 'text-emerald-400'}`}>
            {report.isProxy ? 'Upgradeable Proxy' : 'Immutable Logic'}
          </span>
        </div>

        {/* Admin Ownership */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            <AlertTriangle className="w-3 h-3 text-cyan-400" /> Admin Privileges
          </div>
          <span className={`font-bold ${report.adminPresent ? 'text-rose-400' : 'text-emerald-400'}`}>
            {report.adminPresent ? 'Detected (Single EOA)' : 'Renounced / Multi-Sig'}
          </span>
        </div>

        {/* Honeypot Check */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            <ShieldCheck className="w-3 h-3 text-cyan-400" /> Honeypot Test
          </div>
          <span className={`font-bold ${report.honeypotDetected ? 'text-rose-400' : 'text-emerald-400'}`}>
            {report.honeypotDetected ? 'PASSED / HONEYPOT!' : 'PASSED (Clean)'}
          </span>
        </div>

        {/* Liquidity */}
        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/10">
          <div className="flex items-center gap-1.5 text-gray-400 text-[10px] uppercase font-sans mb-1">
            Liquidity Pool
          </div>
          <span className="font-bold text-white">${report.liquidityUsd.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
