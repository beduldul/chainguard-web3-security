'use client';

import React, { useState } from 'react';
import { INITIAL_BOUNTIES, BountyItem } from '@/lib/bountyEngine';

export default function BountiesPage() {
  const [bounties, setBounties] = useState<BountyItem[]>(INITIAL_BOUNTIES);
  const [repoInput, setRepoInput] = useState('beduldul/chainguard-web3-security');
  const [titleInput, setTitleInput] = useState('');
  const [rewardInput, setRewardInput] = useState('250');
  const [creating, setCreating] = useState(false);

  const claimBounty = (id: string) => {
    setBounties(bounties.map(b => {
      if (b.id === id) {
        return {
          ...b,
          status: 'SOLVED',
          claimedByWallet: '7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2'
        };
      }
      return b;
    }));
  };

  const handleCreateBounty = (e: React.FormEvent) => {
    e.preventDefault();
    if (!titleInput) return;

    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      const newBounty: BountyItem = {
        id: `bounty-${Date.now()}`,
        githubIssueUrl: `https://github.com/${repoInput}/issues/${Math.floor(Math.random() * 50)}`,
        repoName: repoInput,
        issueTitle: titleInput,
        rewardUsdc: parseFloat(rewardInput) || 250,
        status: 'OPEN',
        tags: ['Web3', 'Solidity', 'TypeScript'],
      };
      setBounties([newBounty, ...bounties]);
      setTitleInput('');
    }, 1000);
  };

  const totalRewardsLocked = bounties.reduce((acc, b) => b.status === 'OPEN' ? acc + b.rewardUsdc : acc, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-github-bounties.sh (80x24)</span>
          <span>TTY /dev/pts/5</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          <div className="text-[#00ff66] font-bold text-sm">
            [=== OPEN SOURCE GITHUB BOUNTY MARKETPLACE v2.6 ===]
          </div>

          <div className="text-gray-300">
            <span className="text-[#00ff66] font-bold">root@chainguard:~#</span> ./bounty_daemon --repo beduldul/chainguard-web3-security
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#00ff66] pt-1">
            <span>OPEN BOUNTIES: {bounties.filter(b => b.status === 'OPEN').length}</span>
            <span>•</span>
            <span>TOTAL LOCKED REWARDS: ${totalRewardsLocked} USDC</span>
            <span>•</span>
            <span>PAYOUT: AUTOMATIC UPON MERGE</span>
          </div>
        </div>
      </div>

      {/* New Bounty Form */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66]">
          <span>[ACTION] DEPOSIT USDC & POST NEW GITHUB ISSUE BOUNTY</span>
        </div>

        <div className="p-6">
          <form onSubmit={handleCreateBounty} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-gray-400 block mb-1">GitHub Repo:</label>
              <input
                type="text"
                value={repoInput}
                onChange={(e) => setRepoInput(e.target.value)}
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div className="sm:col-span-2">
              <label className="text-gray-400 block mb-1">Issue Title / Task:</label>
              <input
                type="text"
                value={titleInput}
                onChange={(e) => setTitleInput(e.target.value)}
                placeholder="e.g. Write unit test suite for smart contract"
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Bounty Reward ($USDC):</label>
              <input
                type="number"
                value={rewardInput}
                onChange={(e) => setRewardInput(e.target.value)}
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div className="sm:col-span-4 flex justify-end">
              <button
                type="submit"
                disabled={creating}
                className="px-6 py-2 bg-[#00ff66] text-black font-bold border border-[#00ff66] hover:bg-[#00cc52] transition-all disabled:opacity-50"
              >
                {creating ? '[LOCKING_DANA_USDC...]' : '[+ DEPOSIT & POST BOUNTY]'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bounties List */}
      <div className="cli-window">
        <div className="cli-header text-[#ffb000] flex justify-between">
          <span>[MARKETPLACE] ACTIVE OPEN-SOURCE GITHUB BOUNTIES</span>
          <span>SOLANA & BASE REPAIR POOL</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          {bounties.map((bounty) => (
            <div key={bounty.id} className="p-4 bg-black border border-[#00ff66]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span>{bounty.issueTitle}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold ${bounty.status === 'OPEN' ? 'bg-[#00ff66] text-black' : 'bg-[#ffb000] text-black'}`}>
                    [{bounty.status}]
                  </span>
                </div>
                <div className="text-gray-400 text-[11px]">
                  Repo: <span className="text-[#00f2fe]">{bounty.repoName}</span> • Reward: <span className="text-[#00ff66] font-bold">${bounty.rewardUsdc} USDC</span>
                </div>
                <div className="flex gap-1 text-[10px]">
                  {bounty.tags.map(t => (
                    <span key={t} className="px-1.5 py-0.5 bg-[#121620] text-gray-300 border border-gray-700">
                      #{t}
                    </span>
                  ))}
                </div>
                {bounty.claimedByWallet && (
                  <div className="text-[#00ff66] text-[11px]">
                    ✓ Paid to Wallet: <span className="font-bold">{bounty.claimedByWallet}</span>
                  </div>
                )}
              </div>

              {bounty.status === 'OPEN' && (
                <button
                  onClick={() => claimBounty(bounty.id)}
                  className="px-4 py-2 bg-[#00ff66] text-black border border-[#00ff66] font-bold transition-all shrink-0 hover:bg-[#00cc52]"
                >
                  $ ./claim_bounty.sh
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
