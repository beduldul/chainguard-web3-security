'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, ShieldCheck, Wallet, ChevronDown, Terminal, Globe, Smartphone, CheckCircle2 } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [isConnected, setIsConnected] = useState(false);
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [network, setNetwork] = useState('Base Mainnet');

  // Check if window.ethereum is available and user is already connected
  useEffect(() => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      const ethereum = (window as any).ethereum;
      ethereum.request({ method: 'eth_accounts' }).then((accounts: string[]) => {
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      }).catch(() => {});
    }
  }, []);

  const connectWallet = async () => {
    if (typeof window !== 'undefined' && (window as any).ethereum) {
      try {
        const ethereum = (window as any).ethereum;
        const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
        if (accounts && accounts.length > 0) {
          setWalletAddress(accounts[0]);
          setIsConnected(true);
        }
      } catch (err) {
        console.warn('Wallet connection rejected:', err);
      }
    } else {
      // Fallback sandbox demo wallet mode if no Web3 extension installed
      if (isConnected) {
        setIsConnected(false);
        setWalletAddress('');
      } else {
        setWalletAddress('0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045');
        setIsConnected(true);
      }
    }
  };

  const navLinks = [
    { href: '/', label: 'Tx Guardian', icon: ShieldCheck },
    { href: '/wallet-exposure', label: 'Wallet Exposure', icon: ShieldAlert },
    { href: '/website-scanner', label: 'dApp Scanner', icon: Globe },
    { href: '/extension-demo', label: 'Extension Demo', icon: Smartphone },
    { href: '/sdk-docs', label: 'Developer SDK', icon: Terminal },
  ];

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#07090e]/80 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/30 border border-cyan-500/40 group-hover:border-cyan-400 transition-all shadow-[0_0_15px_rgba(0,242,254,0.25)]">
              <Shield className="w-5 h-5 text-cyan-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-[#07090e] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-wider text-white group-hover:text-cyan-300 transition-colors">
                  ChainGuard
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-full font-mono bg-cyan-950 text-cyan-400 border border-cyan-800">
                  v2.6
                </span>
              </div>
              <p className="text-[10px] text-gray-400 font-medium tracking-tight">Onchain Security Layer</p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-full border border-white/10">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-500/20 to-blue-600/20 text-cyan-300 border border-cyan-500/30 shadow-[0_0_10px_rgba(0,242,254,0.15)]'
                      : 'text-gray-400 hover:text-white hover:bg-white/[0.05]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-gray-400'}`} />
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Network Selector & Connect Wallet */}
          <div className="flex items-center gap-3">
            {/* Chain Selector */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/[0.04] border border-white/10 text-xs font-mono text-gray-300 cursor-pointer hover:bg-white/[0.08] transition-colors">
              <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping" />
              <span>{network}</span>
            </div>

            {/* Wallet Button */}
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border shadow-lg ${
                isConnected
                  ? 'bg-emerald-950/60 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/80 shadow-emerald-950/50'
                  : 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-extrabold border-cyan-400 shadow-cyan-500/20'
              }`}
            >
              <Wallet className="w-4 h-4" />
              {isConnected ? (
                <span>
                  {walletAddress.slice(0, 6)}...{walletAddress.slice(-4)} (Connected)
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
