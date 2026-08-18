'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, ShieldCheck, Wallet, ChevronDown, Terminal, Globe, Smartphone, CreditCard, ShoppingBag, Users, Award, Cpu } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [walletType, setWalletType] = useState<'EVM' | 'Phantom'>('Phantom');
  
  const [securityMenuOpen, setSecurityMenuOpen] = useState(false);
  const [appsMenuOpen, setAppsMenuOpen] = useState(false);

  const securityRef = useRef<HTMLDivElement>(null);
  const appsRef = useRef<HTMLDivElement>(null);

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
    { href: '/', label: 'Tx Guardian Firewall', desc: 'Calldata Simulator & Risk Engine', icon: ShieldCheck },
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
    <header className="sticky top-0 z-50 bg-[#0c0d12] border-b-2 border-yellow-500/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo Section - 8-Bit Retro Arcade */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-9 h-9 bg-yellow-500 text-black border-2 border-yellow-300 flex items-center justify-center font-bold text-lg shadow-[3px_3px_0px_0px_#713f12]">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs tracking-wider text-yellow-400">
                  CHAINGUARD
                </span>
                <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-green-950 text-green-400 border border-green-600">
                  8-BIT
                </span>
              </div>
              <p className="text-[10px] font-mono text-zinc-400 tracking-tight">[SECURITY LAYER OK]</p>
            </div>
          </Link>

          {/* Categorized Dropdown Navigation Bar */}
          <nav className="hidden md:flex items-center gap-3 font-mono">
            
            {/* 1. Security Core Dropdown */}
            <div className="relative" ref={securityRef}>
              <button
                onClick={() => {
                  setSecurityMenuOpen(!securityMenuOpen);
                  setAppsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase transition-all ${
                  isSecurityActive
                    ? 'bg-yellow-500 text-black border-2 border-yellow-300 shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-zinc-900 text-zinc-300 border-2 border-zinc-700 hover:border-yellow-400 hover:text-white'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                <span>SECURITY HUB</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${securityMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {securityMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#14161f] border-2 border-yellow-400 shadow-[6px_6px_0px_0px_#000] p-2 space-y-1 z-50">
                  {securityLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSecurityMenuOpen(false)}
                        className={`flex items-start gap-3 p-2.5 transition-all ${
                          isActive
                            ? 'bg-yellow-500 text-black font-bold'
                            : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] opacity-80">{item.desc}</div>
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
                className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-bold uppercase transition-all ${
                  isAppsActive
                    ? 'bg-green-500 text-black border-2 border-green-300 shadow-[3px_3px_0px_0px_#000]'
                    : 'bg-zinc-900 text-zinc-300 border-2 border-zinc-700 hover:border-green-400 hover:text-white'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>WEB3 SUITE</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${appsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {appsMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#14161f] border-2 border-green-400 shadow-[6px_6px_0px_0px_#000] p-2 space-y-1 z-50">
                  {appLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAppsMenuOpen(false)}
                        className={`flex items-start gap-3 p-2.5 transition-all ${
                          isActive
                            ? 'bg-green-500 text-black font-bold'
                            : 'hover:bg-zinc-800 text-zinc-300 hover:text-white'
                        }`}
                      >
                        <Icon className="w-4 h-4 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-xs font-bold">{item.label}</div>
                          <div className="text-[10px] opacity-80">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </nav>

          {/* Right Actions: Network Indicator & 8-Bit Wallet Button */}
          <div className="flex items-center gap-3 shrink-0 font-mono">
            
            <div className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-zinc-900 border border-zinc-700 text-[11px] text-yellow-400 font-bold">
              <span>SOLANA + EVM</span>
            </div>

            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-bold transition-all ${
                isConnected
                  ? 'bg-green-500 text-black border-2 border-green-300 shadow-[3px_3px_0px_0px_#000]'
                  : 'pixel-btn-gold text-black'
              }`}
            >
              <Wallet className="w-4 h-4 text-black" />
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
