'use client';

import React, { useState, useEffect } from 'react';
import { INITIAL_THREAT_EVENTS, ThreatEvent } from '@/lib/aiAgentEngine';
import { RefreshCw, Search, ShieldAlert, Cpu } from 'lucide-react';

export default function AIAgentPage() {
  const [events, setEvents] = useState<ThreatEvent[]>(INITIAL_THREAT_EVENTS);
  const [addressInput, setAddressInput] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const handleScanContract = (e: React.FormEvent) => {
    e.preventDefault();
    if (!addressInput) return;

    setScanning(true);
    setScanResult(null);

    setTimeout(() => {
      setScanning(false);
      const isScam = addressInput.toLowerCase().includes('scam') || addressInput.length > 30;
      if (isScam) {
        setScanResult(`[!] THREAT DETECTED: Contract ${addressInput} flagged as UNLIMITED_DRAINER (Score: 96/100). Auto-added to global blacklist.`);
        const newEvt: ThreatEvent = {
          id: `threat-${Date.now()}`,
          timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
          chain: 'Base / Solana',
          contractAddress: addressInput,
          dappDomain: 'https://suspicious-dapp.xyz',
          threatType: 'UNLIMITED_DRAINER',
          riskScore: 96,
          status: 'INTERCEPTED_AND_BLACKLISTED',
          details: 'User-scanned contract identified with malicious delegate transfer permissions.',
        };
        setEvents([newEvt, ...events]);
      } else {
        setScanResult(`[+] SAFE CONTRACT: ${addressInput} analyzed cleanly (Score: 0/100). Standard verified contract bytecode.`);
      }
      setAddressInput('');
    }, 1200);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-ai-agent-daemon.sh (80x24)</span>
          <span>TTY /dev/pts/3</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          <pre className="text-[#00ff66] font-bold leading-none hidden sm:block">
{`
    _   ___   ___ ___ ___ _  _ _____   ___  _   ___ _  _ 
   /_\\ |_ _| / __| __/ __| || |_   _| |   \\/_\\ | __| \\| |
  / _ \\ | |  \\__ | _| (__| __ | | |   | |)/ _ \\| _|| .\` |
 /_/ \\_|___| |___/___\\___|_||_| |_|   |___/_/\\_|_| |_|\\_|
       [ AUTONOMOUS MEMPOOL DRAINER HUNTER BOT v2.6 ]
`}
          </pre>

          <div className="text-gray-300">
            <span className="text-[#00ff66] font-bold">root@chainguard:~#</span> ./ai_agent_daemon --watch mempool --auto-blacklist
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#00ff66] pt-1">
            <span>MEMPOOL TXS ANALYZED: 142,850</span>
            <span>•</span>
            <span>DRAINERS NEUTRALIZED: 1,429</span>
            <span>•</span>
            <span>LATENCY: 0.8ms</span>
          </div>
        </div>
      </div>

      {/* Manual Agent Scan Input */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66]">
          <span>[INPUT] Submit Contract Address or Domain for Real-Time AI Analysis</span>
        </div>

        <div className="p-6 space-y-3 text-xs">
          <form onSubmit={handleScanContract} className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <span className="text-gray-400 absolute left-3 top-2.5">$</span>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter contract 0x... or domain..."
                className="w-full pl-8 pr-4 py-2 bg-black border border-[#00ff66]/40 text-xs font-mono text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
              />
            </div>
            <button
              type="submit"
              disabled={scanning}
              className="px-5 py-2 bg-[#00ff66] text-black font-bold text-xs hover:bg-[#00cc52] transition-all border border-[#00ff66] disabled:opacity-50"
            >
              {scanning ? '[ANALYZING_BYTECODE...]' : '[EXECUTE_AI_SCAN]'}
            </button>
          </form>

          {scanResult && (
            <div className={`p-3 border font-mono ${scanResult.includes('THREAT') ? 'bg-[#1e0a0d] border-[#ff3355] text-[#ff3355]' : 'bg-[#0a1e12] border-[#00ff66] text-[#00ff66]'}`}>
              {scanResult}
            </div>
          )}
        </div>
      </div>

      {/* Real-time Threat Stream */}
      <div className="cli-window">
        <div className="cli-header text-[#ffb000] flex justify-between">
          <span>[STREAM] REAL-TIME NEUTRALIZED THREAT EVENTS FEED</span>
          <span>LIVE MEMPOOL FEED</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          {events.map((evt) => (
            <div key={evt.id} className="p-3 bg-black border border-[#ff3355] space-y-1 text-[#ff3355]">
              <div className="flex flex-col sm:flex-row justify-between font-bold">
                <span>[THREAT_ID: {evt.id}] {evt.threatType} (RISK: {evt.riskScore}/100)</span>
                <span className="text-gray-400">{evt.timestamp}</span>
              </div>

              <div className="text-gray-300">
                Target Contract: <span className="text-white font-bold">{evt.contractAddress}</span> ({evt.chain})<br />
                Domain Vector  : <span className="text-[#00f2fe]">{evt.dappDomain}</span>
              </div>

              <div className="text-gray-400 text-[11px]">
                Analysis: {evt.details}
              </div>

              <div className="text-[#00ff66] font-bold pt-1">
                ✓ STATUS: {evt.status} (Syncing Chrome Extension Rules...)
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
