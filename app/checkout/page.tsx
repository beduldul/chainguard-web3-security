'use client';

import React, { useState } from 'react';
import { generateCheckoutRoutes, PaymentRoute } from '@/lib/checkoutEngine';
import { CreditCard, CheckCircle2, ShieldCheck, Zap, ArrowRight, RefreshCw, Layers, Wallet, Lock } from 'lucide-react';

export default function CheckoutPage() {
  const requestedUsd = 49.99;
  const routes = generateCheckoutRoutes(requestedUsd);
  const [selectedRoute, setSelectedRoute] = useState<PaymentRoute>(routes[0]);
  const [paymentStatus, setPaymentStatus] = useState<'IDLE' | 'PROCESSING' | 'SUCCESS'>('IDLE');

  const handleExecutePayment = () => {
    setPaymentStatus('PROCESSING');
    setTimeout(() => {
      setPaymentStatus('SUCCESS');
    }, 2200);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0e1626] via-[#090d16] to-[#07090e] border border-cyan-500/20 p-8 space-y-3 shadow-2xl">
        <div className="flex items-center gap-2 text-xs font-mono text-cyan-400">
          <CreditCard className="w-4 h-4 text-cyan-400" />
          <span>Universal Crypto Checkout • Multi-Chain Stablecoin Router</span>
        </div>

        <h1 className="text-3xl font-black text-white tracking-tight">
          Stripe for Crypto (Universal Checkout)
        </h1>

        <p className="text-xs sm:text-sm text-gray-300 max-w-2xl leading-relaxed">
          Pay merchants using ANY token on ANY chain (Base, Arbitrum, Ethereum). Our background router automatically selects the lowest gas route and settles into the merchant's preferred stablecoin.
        </p>
      </div>

      {/* Stripe-Style Universal Checkout Modal Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Order Summary */}
        <div className="rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 border-b border-white/10 pb-3">
              <Lock className="w-3.5 h-3.5" />
              <span>Merchant Order Invoice</span>
            </div>

            <div>
              <span className="text-xs text-gray-400 font-mono">Merchant:</span>
              <h3 className="text-base font-bold text-white">Acme Web3 SaaS Inc.</h3>
              <p className="text-xs text-gray-400">Pro Developer API Subscription (Monthly)</p>
            </div>

            <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-2 font-mono">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Subtotal:</span>
                <span className="text-white">${requestedUsd.toFixed(2)} USD</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Estimated Gas ({selectedRoute.sourceChain}):</span>
                <span className="text-emerald-400">+${selectedRoute.estimatedGasUsd.toFixed(2)}</span>
              </div>
              <div className="border-t border-white/10 pt-2 flex justify-between text-sm font-bold text-white">
                <span>Total Payment:</span>
                <span className="text-cyan-300">${selectedRoute.totalCostUsd.toFixed(2)} USD</span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-[11px] font-mono flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Merchant receives 100% USDC on Base Mainnet</span>
          </div>
        </div>

        {/* Right Column: Multi-Chain Payment Route Selector */}
        <div className="lg:col-span-2 rounded-2xl bg-card border border-cardBorder p-6 backdrop-blur-xl space-y-6">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" /> Select Payment Chain & Token
            </h3>
            <span className="text-xs text-gray-400 font-mono">Auto-routed by gas & speed</span>
          </div>

          {/* Route Options Grid */}
          <div className="space-y-3">
            {routes.map((route) => {
              const isSelected = selectedRoute.id === route.id;
              return (
                <div
                  key={route.id}
                  onClick={() => setSelectedRoute(route)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-cyan-950/60 border-cyan-500/60 shadow-[0_0_15px_rgba(0,242,254,0.15)]'
                      : 'bg-white/[0.02] border-white/10 hover:border-white/20'
                  }`}
                >
                  <div className="space-y-1 font-mono">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{route.sourceToken}</span>
                      <span className="text-[11px] text-gray-400">on {route.sourceChain}</span>
                      {route.recommended && (
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                          BEST ROUTE (LOWEST GAS)
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-400">
                      Pay {route.sourceAmount} {route.sourceToken} • Gas ~${route.estimatedGasUsd.toFixed(2)}
                    </p>
                  </div>

                  <div className="text-right font-mono text-xs">
                    <div className="font-bold text-cyan-300">${route.totalCostUsd.toFixed(2)}</div>
                    <div className="text-[10px] text-gray-500">~{route.speedSeconds}s finality</div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Execution Button */}
          {paymentStatus === 'IDLE' ? (
            <button
              onClick={handleExecutePayment}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold text-sm transition-all shadow-xl shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>Pay ${selectedRoute.totalCostUsd.toFixed(2)} using {selectedRoute.sourceToken}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : paymentStatus === 'PROCESSING' ? (
            <div className="p-4 rounded-xl bg-black/60 border border-cyan-500/40 text-center space-y-2 font-mono text-xs">
              <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin mx-auto" />
              <p className="text-cyan-300 font-bold">Executing Cross-Chain Payment Route...</p>
              <p className="text-[11px] text-gray-400">Swapping {selectedRoute.sourceToken} on {selectedRoute.sourceChain} ➔ Settling USDC to Merchant</p>
            </div>
          ) : (
            <div className="p-6 rounded-xl bg-emerald-950/80 border border-emerald-500/50 text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
              <h4 className="font-bold text-white text-base">Payment Completed Successfully!</h4>
              <p className="text-xs text-gray-300 font-mono">
                Merchant received $49.99 USDC on Base. Transaction Hash: 0x4f8a...92b1
              </p>
              <button
                onClick={() => setPaymentStatus('IDLE')}
                className="mt-2 px-4 py-2 bg-emerald-500 text-black font-bold rounded-xl text-xs"
              >
                Done / New Payment
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
