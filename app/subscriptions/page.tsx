'use client';

import React, { useState } from 'react';
import { INITIAL_SUBSCRIPTIONS, SubscriptionPlan } from '@/lib/subscriptionEngine';

export default function SubscriptionsPage() {
  const [subs, setSubs] = useState<SubscriptionPlan[]>(INITIAL_SUBSCRIPTIONS);
  const [nameInput, setNameInput] = useState('');
  const [merchantInput, setMerchantInput] = useState('');
  const [priceInput, setPriceInput] = useState('29.99');
  const [creating, setCreating] = useState(false);

  const toggleStatus = (id: string) => {
    setSubs(subs.map(s => {
      if (s.id === id) {
        const nextStatus = s.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
        return { ...s, status: nextStatus };
      }
      return s;
    }));
  };

  const handleCreateSub = (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput || !merchantInput) return;

    setCreating(true);
    setTimeout(() => {
      setCreating(false);
      const newSub: SubscriptionPlan = {
        id: `sub-${Date.now()}`,
        name: nameInput,
        merchantName: merchantInput,
        priceUsdc: parseFloat(priceInput) || 29.99,
        intervalDays: 30,
        status: 'ACTIVE',
        nextBillingDate: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
        totalPaidUsdc: parseFloat(priceInput) || 29.99,
      };
      setSubs([newSub, ...subs]);
      setNameInput('');
      setMerchantInput('');
    }, 1000);
  };

  const totalMonthlySpend = subs.reduce((acc, s) => s.status === 'ACTIVE' ? acc + s.priceUsdc : acc, 0);

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-recurring-billing.sh (80x24)</span>
          <span>TTY /dev/pts/4</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          <div className="text-[#00ff66] font-bold text-sm">
            [=== ONCHAIN RECURRING CRYPTO BILLING ENGINE v2.6 ===]
          </div>

          <div className="text-gray-300">
            <span className="text-[#00ff66] font-bold">root@chainguard:~#</span> ./recurring_billing_daemon --wallet 7rDb3Ci2... (Phantom)
          </div>

          <div className="flex flex-wrap gap-4 text-xs font-mono text-[#00ff66] pt-1">
            <span>ACTIVE SUBSCRIPTIONS: {subs.filter(s => s.status === 'ACTIVE').length}</span>
            <span>•</span>
            <span>TOTAL MONTHLY SPEND: ${totalMonthlySpend.toFixed(2)} USDC</span>
            <span>•</span>
            <span>AUTO-CHARGE: ENABLED</span>
          </div>
        </div>
      </div>

      {/* New Subscription Form */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66]">
          <span>[ACTION] CREATE NEW ONCHAIN RECURRING SUBSCRIPTION PLAN</span>
        </div>

        <div className="p-6">
          <form onSubmit={handleCreateSub} className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <label className="text-gray-400 block mb-1">Plan Name:</label>
              <input
                type="text"
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="e.g. ChainGuard Pro"
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Merchant Name:</label>
              <input
                type="text"
                value={merchantInput}
                onChange={(e) => setMerchantInput(e.target.value)}
                placeholder="e.g. ChainGuard Inc"
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div>
              <label className="text-gray-400 block mb-1">Monthly Cost ($USDC):</label>
              <input
                type="number"
                step="0.01"
                value={priceInput}
                onChange={(e) => setPriceInput(e.target.value)}
                className="w-full p-2 bg-black border border-[#00ff66]/40 text-[#00ff66] focus:outline-none focus:border-[#00ff66]"
                required
              />
            </div>
            <div className="flex items-end">
              <button
                type="submit"
                disabled={creating}
                className="w-full py-2 bg-[#00ff66] text-black font-bold border border-[#00ff66] hover:bg-[#00cc52] transition-all disabled:opacity-50"
              >
                {creating ? '[PROCESSING...]' : '[+ SUBSCRIBE]'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Subscriptions List */}
      <div className="cli-window">
        <div className="cli-header text-[#ffb000] flex justify-between">
          <span>[MANAGEMENT] ACTIVE ONCHAIN CRYPTO SUBSCRIPTIONS</span>
          <span>SMART CONTRACT STREAMING</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          {subs.map((sub) => (
            <div key={sub.id} className="p-4 bg-black border border-[#00ff66]/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="flex items-center gap-2 font-bold text-white">
                  <span>{sub.name}</span>
                  <span className={`px-2 py-0.5 text-[10px] font-bold ${sub.status === 'ACTIVE' ? 'bg-[#00ff66] text-black' : 'bg-[#ff3355] text-white'}`}>
                    [{sub.status}]
                  </span>
                </div>
                <div className="text-gray-400 text-[11px]">
                  Merchant: <span className="text-[#00f2fe]">{sub.merchantName}</span> • Rate: <span className="text-[#00ff66] font-bold">${sub.priceUsdc} USDC / month</span>
                </div>
                <div className="text-gray-400 text-[11px]">
                  Next Charge: <span className="text-white font-bold">{sub.nextBillingDate}</span> • Total Paid: <span className="text-white font-bold">${sub.totalPaidUsdc} USDC</span>
                </div>
              </div>

              <button
                onClick={() => toggleStatus(sub.id)}
                className={`px-4 py-2 border font-bold transition-all shrink-0 ${
                  sub.status === 'ACTIVE'
                    ? 'border-[#ff3355] text-[#ff3355] hover:bg-[#ff3355] hover:text-white'
                    : 'border-[#00ff66] text-[#00ff66] hover:bg-[#00ff66] hover:text-black'
                }`}
              >
                {sub.status === 'ACTIVE' ? '$ ./pause_sub.sh' : '$ ./resume_sub.sh'}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
