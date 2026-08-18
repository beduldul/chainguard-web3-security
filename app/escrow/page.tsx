'use client';

import React, { useState } from 'react';
import { MOCK_ESCROW_JOBS, EscrowJob } from '@/lib/escrowEngine';
import { Lock, Unlock, CheckCircle2, RefreshCw, ShieldCheck, DollarSign } from 'lucide-react';

export default function EscrowPage() {
  const [jobs, setJobs] = useState<EscrowJob[]>(MOCK_ESCROW_JOBS);
  const [releasingId, setReleasingId] = useState<string | null>(null);

  const activeJob = jobs[0];

  const handleReleaseMilestone = (milestoneId: string) => {
    setReleasingId(milestoneId);
    setTimeout(() => {
      setJobs((prevJobs) =>
        prevJobs.map((job) => ({
          ...job,
          milestones: job.milestones.map((ms) =>
            ms.id === milestoneId ? { ...ms, status: 'RELEASED' as const } : ms
          ),
        }))
      );
      setReleasingId(null);
    }, 1500);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-freelancer-escrow.sh (80x24)</span>
          <span>TTY /dev/pts/2</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          <div className="text-[#00ff66] font-bold">
            root@chainguard:~# ./escrow_daemon --job {activeJob.id} --status ACTIVE
          </div>

          <p className="text-gray-300">
            Onchain Freelancer Escrow Protocol. Funds are locked in smart contract escrow and released to freelancer wallet upon milestone completion.
          </p>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#00ff66] pt-1">
            <span>TOTAL LOCKED: ${activeJob.totalUsd.toLocaleString()} {activeJob.tokenSymbol}</span>
            <span>•</span>
            <span>FREELANCER: {activeJob.freelancerAddress.slice(0, 8)}... (Phantom)</span>
          </div>
        </div>
      </div>

      {/* Active Escrow Job Milestones */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66] flex justify-between">
          <span>[CONTRACT JOB #{activeJob.id}] MILESTONE AGREEMENT</span>
          <span>VALUATION: ${activeJob.totalUsd.toLocaleString()} USDC</span>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono">
          <div className="space-y-3">
            {activeJob.milestones.map((ms) => (
              <div
                key={ms.id}
                className={`p-4 border font-mono space-y-2 ${
                  ms.status === 'RELEASED'
                    ? 'bg-[#0a1e12] border-[#00ff66] text-[#00ff66]'
                    : 'bg-[#121620] border-[#ffb000] text-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                  <span className="font-bold text-sm">{ms.title}</span>
                  <span className="font-bold text-[#00ff66]">${ms.amountUsd.toLocaleString()} USDC</span>
                </div>

                <div className="flex justify-between items-center text-xs">
                  <span className="text-gray-400">
                    STATUS: {ms.status === 'RELEASED' ? '[FUNDS_RELEASED]' : '[LOCKED_IN_ESCROW]'}
                  </span>

                  {ms.status === 'LOCKED' ? (
                    <button
                      onClick={() => handleReleaseMilestone(ms.id)}
                      disabled={releasingId === ms.id}
                      className="px-4 py-1.5 bg-[#ffb000] text-black font-bold border border-[#ffb000] hover:bg-[#e69e00] transition-all disabled:opacity-50"
                    >
                      {releasingId === ms.id ? '[RELEASING...]' : '[RELEASE_PAYMENT_TO_FREELANCER]'}
                    </button>
                  ) : (
                    <span className="text-[#00ff66] font-bold">✓ DISBURSED TO PHANTOM WALLET</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
