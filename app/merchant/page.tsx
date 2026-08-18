'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Code, Copy, Check, Plus, ExternalLink, ShieldCheck, DollarSign } from 'lucide-react';

export default function MerchantPage() {
  const [amount, setAmount] = useState('49.99');
  const [itemName, setItemName] = useState('Pro SaaS Subscription');
  const [merchantAddress, setMerchantAddress] = useState('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
  const [preferredAsset, setPreferredAsset] = useState('USDC');
  const [copied, setCopied] = useState(false);

  const embedCode = `<CryptoCheckout 
  amount={${amount}}
  itemName="${itemName}"
  merchantAddress="${merchantAddress}"
  preferredAsset="${preferredAsset}"
/>`;

  const copyCode = () => {
    navigator.clipboard.writeText(embedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <CreditCard className="w-4 h-4 text-cyan-400" />
          <span>Merchant Crypto Checkout Portal</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Create Payment Links & Embeddable Checkout Widgets
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Accept crypto payments on your dApp or ecommerce website seamlessly. Customers can pay with any token on Base, Arbitrum, or Ethereum, while you receive 100% stablecoin settlement into your wallet.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Invoice Generator Form */}
        <div className="rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-4">
          <h3 className="text-sm font-bold text-white border-b border-white/10 pb-3 flex items-center gap-2">
            <Plus className="w-4 h-4 text-cyan-400" /> Configure Payment Invoice
          </h3>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Invoice Item Name</label>
            <input
              type="text"
              value={itemName}
              onChange={(e) => setItemName(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Invoice Amount ($USD)</label>
            <input
              type="text"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Merchant Wallet Address</label>
            <input
              type="text"
              value={merchantAddress}
              onChange={(e) => setMerchantAddress(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-300 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-400 mb-1 font-mono">Preferred Payout Stablecoin</label>
            <select
              value={preferredAsset}
              onChange={(e) => setPreferredAsset(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-xs font-mono text-gray-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="USDC">USDC (Base Mainnet)</option>
              <option value="USDT">USDT (Arbitrum One)</option>
            </select>
          </div>

          <Link
            href="/checkout"
            className="w-full py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-extrabold text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20"
          >
            <span>Test Customer Checkout View</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Embeddable Code Generator */}
        <div className="rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Code className="w-4 h-4 text-cyan-400" /> React Widget Embed Code
            </h3>
            <button
              onClick={copyCode}
              className="flex items-center gap-1 text-xs font-mono text-gray-400 hover:text-cyan-300 px-3 py-1 rounded-lg bg-white/5 border border-white/10"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied!' : 'Copy Code'}
            </button>
          </div>

          <pre className="p-4 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-cyan-300 leading-relaxed overflow-x-auto">
            <code>{embedCode}</code>
          </pre>

          <div className="p-4 rounded-xl bg-white/[0.02] border border-white/10 font-mono text-xs space-y-2">
            <span className="text-gray-400 block font-bold">Checkout Features Included:</span>
            <ul className="space-y-1 text-[11px] text-gray-300">
              <li>• Multi-chain liquidity routing (Base, Arbitrum, Ethereum)</li>
              <li>• Automated gas-optimized route picker</li>
              <li>• Zero merchant processing fee on Base</li>
              <li>• Instant transaction finality verification</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
