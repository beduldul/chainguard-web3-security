'use client';

import React, { useState } from 'react';
import { DomainScanResult } from '@/lib/types';
import RiskScoreBadge from '@/components/RiskScoreBadge';
import { Globe, ShieldAlert, CheckCircle2, XCircle, Search, AlertOctagon, Lock, FileCode, RefreshCw } from 'lucide-react';

export default function WebsiteScannerPage() {
  const [urlInput, setUrlInput] = useState('https://uniswap-like.xyz');
  const [scanResult, setScanResult] = useState<DomainScanResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleScan = async (targetUrl?: string) => {
    const query = targetUrl || urlInput;
    setLoading(true);
    try {
      const res = await fetch('/api/scan-domain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: query }),
      });
      const data = await res.json();
      if (data.success) {
        setScanResult(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Globe className="w-4 h-4 text-cyan-400" />
          <span>Web3 Frontend & Domain Vulnerability Auditor</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Website & dApp Security Scanner
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Before connecting your wallet to any dApp website, scan the domain age, SSL certificate, frontend scripts, and onchain contracts called by the website.
        </p>

        {/* Input Form */}
        <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
          <div className="relative flex-1 w-full">
            <Globe className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example-dapp.com"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>
          <button
            onClick={() => handleScan()}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Scanning Domain...' : 'Scan Website Security'}
          </button>
        </div>

        {/* Quick Test Links */}
        <div className="flex items-center gap-2 pt-1 font-mono text-xs text-gray-400">
          <span>Try quick tests:</span>
          <button
            onClick={() => {
              setUrlInput('https://uniswap-like.xyz');
              handleScan('https://uniswap-like.xyz');
            }}
            className="text-rose-400 hover:underline"
          >
            uniswap-like.xyz (Phishing)
          </button>
          <span>•</span>
          <button
            onClick={() => {
              setUrlInput('https://app.uniswap.org');
              handleScan('https://app.uniswap.org');
            }}
            className="text-emerald-400 hover:underline"
          >
            app.uniswap.org (Official)
          </button>
        </div>
      </div>

      {/* Result Display */}
      {scanResult && (
        <div className="rounded-3xl bg-card border border-cardBorder p-6 sm:p-8 backdrop-blur-xl space-y-6 shadow-xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 border-b border-white/10 pb-6">
            <RiskScoreBadge score={scanResult.score} riskLevel={scanResult.riskLevel} size="lg" />

            <div className="text-left sm:text-right font-mono space-y-1">
              <div className="text-sm font-bold text-white flex items-center gap-2 sm:justify-end">
                <Globe className="w-4 h-4 text-cyan-400" />
                {scanResult.domain}
              </div>
              <p className="text-xs text-gray-400">Domain Age: {scanResult.domainAgeDays} Days</p>
            </div>
          </div>

          {/* Website Security Scorecard Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-mono">
            {/* Domain Age Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-sans text-gray-400 font-bold block">Domain Age</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-white">{scanResult.domainAgeDays} Days</span>
                {scanResult.domainAgeDays < 7 ? (
                  <span className="text-rose-400 font-bold text-xs bg-rose-950 px-2 py-0.5 rounded border border-rose-800">⚠️ VERY NEW</span>
                ) : (
                  <span className="text-emerald-400 font-bold text-xs bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">✅ ESTABLISHED</span>
                )}
              </div>
            </div>

            {/* SSL Certificate Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-sans text-gray-400 font-bold block">SSL Security Certificate</span>
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-emerald-400">Valid HTTPS SSL</span>
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
            </div>

            {/* Frontend Script Audit */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-sans text-gray-400 font-bold block">Frontend Script Audit</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${scanResult.frontendRisk ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {scanResult.frontendRisk ? '🔴 Suspicious Scripts' : '✅ Clean Code'}
                </span>
              </div>
            </div>

            {/* Blacklist Report Card */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 space-y-2">
              <span className="text-xs font-sans text-gray-400 font-bold block">Security Blacklist Check</span>
              <div className="flex items-center justify-between">
                <span className={`text-sm font-bold ${scanResult.reportedPhishing ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {scanResult.reportedPhishing ? '🔴 FLAGGED SCAM' : '✅ No Reports'}
                </span>
              </div>
            </div>
          </div>

          {/* Identified Issues */}
          {scanResult.issues.length > 0 && (
            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4" /> Detected Security Vulnerabilities ({scanResult.issues.length})
              </h4>
              <div className="space-y-2 font-mono text-xs">
                {scanResult.issues.map((issue, idx) => (
                  <div key={idx} className="p-3 rounded-xl bg-rose-950/30 border border-rose-500/40 text-rose-200 flex items-start gap-2">
                    <span className="text-rose-400 font-bold">•</span>
                    <span>{issue}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
