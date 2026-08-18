'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, ShieldCheck, Wallet, ChevronDown, Terminal, Globe, Smartphone, CreditCard, ShoppingBag, Users, Award, Cpu, Sparkles } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<'EVM' | 'Phantom'>('Phantom');

  const [securityOpen, setSecurityOpen] = useState(false);
  const [appsOpen, setAppsOpen] = useState(false);

  const securityRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (securityRef.current && !securityRef.current.contains(e.target as Node)) {
        setSecurityOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(e.target as Node)) {
        setAppsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const solana = (window as any).solana || (window as any).phantom?.solana;
      if (solana && solana.isPhantom && solana.publicKey) {
        setWalletAddress(solana.publicKey.toString());
        setWalletType('Phantom');
        setIsConnected(true);
        return;
      }

      const ethereum = (window as any).ethereum;
      if (ethereum) {
        ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType('EVM');
            setIsConnected(true);
          }
        }).catch(() => {});
      }
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined') {
      const solana = (window as any).solana || (window as any).phantom?.solana;
      if (solana && solana.isPhantom) {
        try {
          const resp = await solana.connect();
          setWalletAddress(resp.publicKey.toString());
          setWalletType('Phantom');
          setIsConnected(true);
          return;
        } catch (err) {
          console.warn(err);
        }
      }

      const ethereum = (window as any).ethereum;
      if (ethereum) {
        try {
          const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
          if (accounts && accounts.length > 0) {
            setWalletAddress(accounts[0]);
            setWalletType('EVM');
            setIsConnected(true);
            return;
          }
        } catch (err) {
          console.warn(err);
        }
      }

      if (isConnected) {
        setIsConnected(false);
        setWalletAddress('');
      } else {
        setWalletAddress('7rDb3Ci2SxS7rDjMJV39do8VR49u5M4sDihNiyjiHMK2');
        setWalletType('Phantom');
        setIsConnected(true);
      }
    }
  };

  const securityLinks = [
    { href: '/', label: 'Tx Guardian Firewall', desc: 'Calldata Simulator & Risk Scoring', icon: ShieldCheck },
    { href: '/wallet-exposure', label: 'Wallet Allowance Audit', desc: 'Scan & Revoke At-Risk Approvals', icon: ShieldAlert },
    { href: '/website-scanner', label: 'dApp Domain Auditor', desc: 'Check Phishing & SSL Integrity', icon: Globe },
    { href: '/extension-demo', label: 'Extension Interceptor', desc: 'Live Chrome Overlay Sandbox', icon: Smartphone },
  ];

  const appLinks = [
    { href: '/checkout', label: 'Universal Checkout', desc: 'Stripe for Multi-Chain Crypto', icon: CreditCard },
    { href: '/payroll', label: 'Crypto Payroll', desc: 'Corporate Batch Disbursal Engine', icon: Users },
    { href: '/credit-score', label: 'Onchain Credit Score', desc: 'Wallet Reputation & DeFi Rating', icon: Award },
    { href: '/merchant', label: 'Merchant Portal', desc: 'Embeddable Payment Widget Code', icon: ShoppingBag },
    { href: '/sdk-docs', label: 'Developer SDK & API', desc: 'Live REST API Testing Sandbox', icon: Terminal },
  ];

  const isSecurityActive = securityLinks.some((l) => l.href === pathname);
  const isAppsActive = appLinks.some((l) => l.href === pathname);

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#07080c]/85 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Section */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-emerald-500/20 border border-purple-500/30 flex items-center justify-center group-hover:border-purple-400 transition-all shadow-[0_0_15px_rgba(168,85,247,0.2)]">
              <Shield className="w-5 h-5 text-purple-400 group-hover:scale-110 transition-transform" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-base tracking-tight text-white group-hover:text-purple-300 transition-colors">
                  ChainGuard
                </span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight">Onchain Security Infrastructure</p>
            </div>
          </Link>

          {/* Categorized Pill Navigation Dropdowns */}
          <nav className="hidden md:flex items-center gap-2 bg-white/[0.03] p-1 rounded-full border border-white/10">
            
            {/* 1. Security Tools Dropdown */}
            <div className="relative" ref={securityRef}>
              <button
                onClick={() => {
                  setSecurityOpen(!securityOpen);
                  setAppsOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isSecurityActive
                    ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
                <span>Security Tools</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${securityOpen ? 'rotate-180 text-purple-400' : 'text-gray-400'}`} />
              </button>

              {securityOpen && (
                <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-[#0f111a] border border-white/10 shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {securityLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSecurityOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-purple-500/20 text-purple-200 border border-purple-500/30'
                            : 'hover:bg-white/[0.05] text-gray-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Web3 Suite Dropdown */}
            <div className="relative" ref={appsRef}>
              <button
                onClick={() => {
                  setAppsOpen(!appsOpen);
                  setSecurityOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isAppsActive
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-lg'
                    : 'text-gray-300 hover:text-white hover:bg-white/[0.05]'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
                <span>Web3 Products</span>
                <ChevronDown className={`w-3 h-3 transition-transform ${appsOpen ? 'rotate-180 text-emerald-400' : 'text-gray-400'}`} />
              </button>

              {appsOpen && (
                <div className="absolute left-0 mt-2 w-80 rounded-2xl bg-[#0f111a] border border-white/10 shadow-2xl p-2 space-y-1 z-50 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
                  {appLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAppsOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-xl transition-all ${
                          isActive
                            ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/30'
                            : 'hover:bg-white/[0.05] text-gray-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Link: Extension */}
            <Link
              href="/extension-demo"
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                pathname === '/extension-demo'
                  ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                  : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              Extension Demo
            </Link>

          </nav>

          {/* Right Actions: Wallet Connection Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-lg ${
                isConnected
                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-900/80'
                  : 'bg-gradient-to-r from-purple-600 via-violet-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 text-white shadow-purple-900/30'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {isConnected ? (
                <span>
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)} ({walletType})
                </span>
              ) : (
                <span>Connect Wallet</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
