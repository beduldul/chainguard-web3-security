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
  
  const [securityMenuOpen, setSecurityMenuOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);

  const securityRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (securityRef.current && !securityRef.current.contains(event.target as Node)) {
        setSecurityMenuOpen(false);
      }
      if (appsRef.current && !appsRef.current.contains(event.target as Node)) {
        setAppsMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Detect Phantom / EVM wallet
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

      // Default sandbox address
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
    { href: '/', label: 'Tx Guardian Firewall', desc: 'Calldata Simulator & Risk Score', icon: ShieldCheck },
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
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-[#060810]/90 border-b-2 border-cyan-500/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Section - Retro Pixel Styling */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 bg-cyan-950 border-2 border-cyan-400 flex items-center justify-center pixel-btn group-hover:bg-cyan-900 transition-all">
              <Shield className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs tracking-wider text-cyan-300 group-hover:text-cyan-200">
                  CHAIN<span className="text-purple-400">GUARD</span>
                </span>
                <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-purple-950 text-purple-300 border border-purple-500">
                  8-BIT
                </span>
              </div>
              <p className="text-[10px] font-tech text-gray-400 tracking-tight">EVM + SOLANA SECURITY</p>
            </div>
          </Link>

          {/* Categorized Dropdown Navigation Bar (Prevents Overcrowding) */}
          <nav className="hidden md:flex items-center gap-2">
            
            {/* 1. Security Core Dropdown */}
            <div className="relative" ref={securityRef}>
              <button
                onClick={() => {
                  setSecurityMenuOpen(!securityMenuOpen);
                  setAppsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-tech uppercase tracking-wider transition-all border-2 ${
                  isSecurityActive
                    ? 'bg-cyan-950/80 text-cyan-300 border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.3)]'
                    : 'bg-black/50 text-gray-300 border-white/10 hover:border-cyan-500/50 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>Security Hub</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${securityMenuOpen ? 'rotate-180 text-cyan-400' : 'text-gray-400'}`} />
              </button>

              {securityMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#090d16] border-2 border-cyan-400 shadow-[4px_4px_0px_0px_#00f2fe] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {securityLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSecurityMenuOpen(false)}
                        className={`flex items-start gap-3 p-2.5 rounded-none transition-all border ${
                          isActive
                            ? 'bg-cyan-950/80 border-cyan-400 text-cyan-200'
                            : 'border-transparent hover:bg-white/[0.05] text-gray-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-cyan-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold font-tech">{item.label}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Web3 Apps Dropdown */}
            <div className="relative" ref={appsRef}>
              <button
                onClick={() => {
                  setAppsMenuOpen(!appsMenuOpen);
                  setSecurityMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-tech uppercase tracking-wider transition-all border-2 ${
                  isAppsActive
                    ? 'bg-purple-950/80 text-purple-300 border-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.3)]'
                    : 'bg-black/50 text-gray-300 border-white/10 hover:border-purple-500/50 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4 text-purple-400" />
                <span>Web3 Startup Suite</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${appsMenuOpen ? 'rotate-180 text-purple-400' : 'text-gray-400'}`} />
              </button>

              {appsMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#090d16] border-2 border-purple-400 shadow-[4px_4px_0px_0px_#a855f7] p-2 space-y-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                  {appLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAppsMenuOpen(false)}
                        className={`flex items-start gap-3 p-2.5 transition-all border ${
                          isActive
                            ? 'bg-purple-950/80 border-purple-400 text-purple-200'
                            : 'border-transparent hover:bg-white/[0.05] text-gray-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 text-purple-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold font-tech">{item.label}</div>
                          <div className="text-[10px] text-gray-400 leading-tight">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Direct Quick Link: Extension Playground */}
            <Link
              href="/extension-demo"
              className={`px-3 py-2 text-xs font-bold font-tech uppercase tracking-wider transition-all border-2 ${
                pathname === '/extension-demo'
                  ? 'bg-cyan-950 text-cyan-300 border-cyan-400'
                  : 'bg-black/40 text-gray-400 border-white/10 hover:text-white hover:border-white/30'
              }`}
            >
              Extension
            </Link>

          </nav>

          {/* Right Actions: Network Indicator & Pixel Wallet Button */}
          <div className="flex items-center gap-3 shrink-0">
            
            {/* Multi-Chain Badge */}
            <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 bg-black/60 border-2 border-purple-500/40 text-xs font-tech text-purple-300">
              <span className="w-2 h-2 bg-purple-400 rounded-none animate-pulse" />
              <span>SOLANA + BASE</span>
            </div>

            {/* Pixel Button Wallet Connect */}
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold font-tech transition-all border-2 ${
                isConnected
                  ? 'bg-purple-950 text-purple-300 border-purple-400 shadow-[3px_3px_0px_0px_#a855f7]'
                  : 'bg-cyan-500 text-black border-cyan-300 pixel-btn font-extrabold'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {isConnected ? (
                <span>
                  {walletAddress.slice(0, 4)}...{walletAddress.slice(-4)} ({walletType})
                </span>
              ) : (
                <span>CONNECT WALLET</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
