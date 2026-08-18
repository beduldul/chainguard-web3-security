'use client';

import React, { useState } from 'react';
import { calculateWalletReputation, WalletReputation } from '@/lib/reputationEngine';
import { RefreshCw, Search } from 'lucide-react';

export default function CreditScorePage() {
  const [addressInput, setAddressInput] = useState('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2');
  const [reputation, setReputation] = useState<WalletReputation>(calculateWalletReputation('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2'));
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    setTimeout(() => {
      setReputation(calculateWalletReputation(addressInput));
      setLoading(false);
    }, 800);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-credit-score.sh (80x24)</span>
          <span>TTY /dev/pts/1</span>
        </div>

        <div className="p-6 space-y-4 font-mono text-xs">
          <div className="text-[#00ff66] font-bold">
            root@chainguard:~# ./credit_score_evaluator --address {addressInput}
          </div>

          {/* Search Prompt */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <div className="relative flex-1 w-full">
              <span className="text-gray-400 absolute left-3 top-2.5">$</span>
              <input
                type="text"
                value={addressInput}
                onChange={(e) => setAddressInput(e.target.value)}
                placeholder="Enter wallet address (EVM / Solana Phantom)..."
                className="w-full pl-8 pr-4 py-2 bg-black border border-[#00ff66]/40 text-xs font-mono text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full sm:w-auto px-5 py-2 bg-[#00ff66] text-black font-bold text-xs hover:bg-[#00cc52] transition-all flex items-center justify-center gap-2 border border-[#00ff66]"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              {loading ? '[EVALUATING...]' : '[QUERY_CREDIT_SCORE]'}
            </button>
          </div>
        </div>
      </div>

      {/* Credit Evaluation Terminal Audit Matrix */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66] flex justify-between">
          <span>[RESULT] ONCHAIN CREDIT EVALUATION REPORT</span>
          <span>SCORE: {reputation.score}/100</span>
        </div>

        <div className="p-6 space-y-4 text-xs font-mono">
          {/* ASCII Score Table */}
          <pre className="text-[#00ff66] font-bold leading-tight overflow-x-auto">
{`
+-----------------------------------------------------------------------+
| TARGET WALLET ADDRESS  : ${reputation.address.padEnd(45)} |
| CREDIT RATING TIER     : ${reputation.tier.padEnd(45)} |
| CALCULATED SCORE       : ${reputation.score}/100 (TIER RANK: ${reputation.badge.padEnd(27)}) |
+-----------------------------------------------------------------------+
| METRIC NAME            | VALUE               | VERDICT                |
+------------------------+---------------------+------------------------+
| Wallet Longevity       | ${reputation.walletAgeYears.toString().padEnd(19)} | VERIFIED (AGE > 4 YRS) |
| Total Onchain Txs      | ${reputation.totalTransactions.toString().padEnd(19)} | HIGH ACTIVITY          |
| Successful Repayments  | ${reputation.successfulRepayments.toString().padEnd(19)} | ZERO DEFAULT HISTORY   |
| Liquidations Event     | ${reputation.liquidationsCount.toString().padEnd(19)} | CLEAN DEFI RECORD      |
+------------------------+---------------------+------------------------+
`}
          </pre>

          <div className="p-3 bg-black border border-[#00ff66] text-gray-200">
            <span className="text-[#00ff66] font-bold">[+] DEFI LENDING BENEFIT:</span> {reputation.collateralDiscount}
          </div>
        </div>
      </div>
    </div>
  );
}
