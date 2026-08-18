'use client';

import React, { useState } from 'react';
import { Terminal, Copy, Check, Code, Cpu, Server, Sparkles, Play, RefreshCw } from 'lucide-react';
import { PRESET_TRANSACTIONS } from '@/lib/mockData';

export default function SdkDocsPage() {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sdk' | 'api' | 'curl'>('sdk');

  // API Playground State
  const [apiPreset, setApiPreset] = useState(PRESET_TRANSACTIONS[0]);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  const sdkCode = `import { Guardian } from "@chainguard/sdk";

// Initialize ChainGuard Firewall Protection
const guardian = new Guardian({
  apiKey: "cg_live_98f4a12b...",
  chainId: 8453, // Base Mainnet
});

// Intercept transaction before user signature
const securityReport = await guardian.protect({
  to: "0x8192FA000000000000000000000000000092FA",
  calldata: "0x095ea7b3...",
  valueEth: "0",
});

if (securityReport.riskScore >= 75) {
  console.warn("⚠️ Transaction blocked by ChainGuard Guardian:", securityReport.aiExplanation);
  alert(\`Transaction Blocked! Risk Score: \${securityReport.riskScore}/100\`);
} else {
  // Proceed with wallet signing
  await userWallet.sendTransaction(tx);
}`;

  const restApiCode = `POST /api/v1/analyze
Content-Type: application/json

{
  "to": "${apiPreset.targetContract}",
  "calldata": "${apiPreset.calldata.slice(0, 34)}...",
  "valueEth": "0",
  "chainId": ${apiPreset.chainId}
}`;

  const curlCode = `curl -X POST https://chainguard.security/api/v1/analyze \\
  -H "Content-Type: application/json" \\
  -d '{
    "to": "${apiPreset.targetContract}",
    "calldata": "${apiPreset.calldata.slice(0, 34)}...",
    "valueEth": "0",
    "chainId": ${apiPreset.chainId}
  }'`;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleTestApi = async () => {
    setApiLoading(true);
    try {
      const res = await fetch('/api/analyze-tx', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: apiPreset.targetContract,
          calldata: apiPreset.calldata,
          valueEth: apiPreset.valueEth,
          chainId: apiPreset.chainId,
        }),
      });
      const data = await res.json();
      setApiResponse(data);
    } catch (err: any) {
      setApiResponse({ error: err.message });
    } finally {
      setApiLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-4 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <Terminal className="w-4 h-4 text-cyan-400" />
          <span>Developer Security SDK & API Documentation</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Integrate ChainGuard into your dApp or Wallet
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Protect your dApp users from phishing drainers and accidental unlimited approvals. Embed the `@chainguard/sdk` package or use our high-speed REST API endpoints.
        </p>

        <div className="flex items-center gap-2 font-mono text-xs text-gray-400 pt-2">
          <span className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-cyan-300">
            npm i @chainguard/sdk
          </span>
          <span className="px-3 py-1 rounded-lg bg-black/60 border border-white/10 text-emerald-300">
            TypeScript Native
          </span>
        </div>
      </div>

      {/* Code Explorer */}
      <div className="rounded-2xl bg-card border border-cardBorder backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('sdk')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                activeTab === 'sdk' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              @chainguard/sdk (TypeScript)
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                activeTab === 'api' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              REST API Format
            </button>
            <button
              onClick={() => setActiveTab('curl')}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold font-mono transition-all ${
                activeTab === 'curl' ? 'bg-cyan-500 text-black' : 'text-gray-400 hover:text-white'
              }`}
            >
              cURL Request
            </button>
          </div>

          <button
            onClick={() =>
              copyToClipboard(activeTab === 'sdk' ? sdkCode : activeTab === 'api' ? restApiCode : curlCode)
            }
            className="flex items-center gap-1.5 text-xs font-mono text-gray-400 hover:text-cyan-300 px-3 py-1 rounded-lg bg-white/5 border border-white/10"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Copied!' : 'Copy Snippet'}
          </button>
        </div>

        <pre className="p-5 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto leading-relaxed">
          <code>{activeTab === 'sdk' ? sdkCode : activeTab === 'api' ? restApiCode : curlCode}</code>
        </pre>
      </div>

      {/* Interactive REST API Live Sandbox Bench */}
      <div className="rounded-2xl bg-card border border-cardBorder backdrop-blur-xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Live API Testing Sandbox</h3>
          </div>

          <button
            onClick={handleTestApi}
            disabled={apiLoading}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
          >
            <Play className={`w-3.5 h-3.5 ${apiLoading ? 'animate-spin' : ''}`} />
            {apiLoading ? 'Sending Request...' : 'Send Live Test Request'}
          </button>
        </div>

        {/* Preset Selector */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-mono text-gray-400">Select Test Vector:</span>
          {PRESET_TRANSACTIONS.map((p) => (
            <button
              key={p.id}
              onClick={() => setApiPreset(p)}
              className={`px-3 py-1 rounded-lg text-[11px] font-mono transition-all ${
                apiPreset.id === p.id ? 'bg-cyan-950 text-cyan-300 border border-cyan-700' : 'bg-black/40 text-gray-400'
              }`}
            >
              {p.category}
            </button>
          ))}
        </div>

        {/* Live Output */}
        {apiResponse && (
          <div className="space-y-2 pt-2">
            <span className="text-xs font-mono text-emerald-400 font-bold block">HTTP 200 OK Response:</span>
            <pre className="p-4 rounded-xl bg-black/90 border border-emerald-500/30 font-mono text-[11px] text-emerald-300 max-h-72 overflow-y-auto">
              <code>{JSON.stringify(apiResponse, null, 2)}</code>
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}
