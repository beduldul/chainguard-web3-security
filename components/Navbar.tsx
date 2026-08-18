'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, ShieldAlert, ShieldCheck, Wallet, ChevronDown, Terminal, Globe, Smartphone, CreditCard, ShoppingBag, Users, Award, Cpu, Gamepad2 } from 'lucide-react';

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
    <header className="sticky top-0 z-50 bg-[#0b0c10] border-b-4 border-[#ff0055] py-2">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4 font-vt323">
          
          {/* Logo Section - Pixel Art HUD */}
          <Link href="/" className="flex items-center gap-3 group shrink-0">
            <div className="w-10 h-10 bg-[#ff0055] text-white border-2 border-black flex items-center justify-center font-bold text-xl shadow-[4px_4px_0px_0px_#000]">
              👾
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-[#00ff66] tracking-wider">
                  CHAINGUARD
                </span>
                <span className="font-pixel text-[8px] px-1.5 py-0.5 bg-[#ffe600] text-black font-bold">
                  8-BIT
                </span>
              </div>
              <p className="text-xs text-yellow-400 leading-none mt-1">[SYSTEM LEVEL 100 • READY]</p>
            </div>
          </Link>

          {/* Categorized Dropdown Pixel Navigation */}
          <nav className="hidden md:flex items-center gap-3 font-pixel">
            
            {/* 1. Security Core Dropdown */}
            <div className="relative" ref={securityRef}>
              <button
                onClick={() => {
                  setSecurityMenuOpen(!securityMenuOpen);
                  setAppsMenuOpen(false);
                }}
                className={`flex items-center gap-2 px-3 py-2 text-[10px] uppercase transition-all ${
                  isSecurityActive
                    ? 'pixel-btn-pink'
                    : 'pixel-btn-dark'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-white" />
                <span>SECURITY HUB</span>
                <ChevronDown className={`w-3.5 h-3.5 ${securityMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {securityMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#12131c] border-4 border-[#ff0055] shadow-[6px_6px_0px_0px_#000] p-2 space-y-1 z-50 font-vt323">
                  {securityLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setSecurityMenuOpen(false)}
                        className={`flex items-start gap-3 p-2 transition-all ${
                          isActive
                            ? 'bg-[#ff0055] text-white font-bold'
                            : 'hover:bg-[#1e202e] text-gray-200 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 mt-0.5 shrink-0 text-[#00ff66]" />
                        <div>
                          <div className="text-base font-bold leading-tight">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
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
                className={`flex items-center gap-2 px-3 py-2 text-[10px] uppercase transition-all ${
                  isAppsActive
                    ? 'pixel-btn-yellow'
                    : 'pixel-btn-dark'
                }`}
              >
                <Cpu className="w-4 h-4" />
                <span>WEB3 SUITE</span>
                <ChevronDown className={`w-3.5 h-3.5 ${appsMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {appsMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#12131c] border-4 border-[#ffe600] shadow-[6px_6px_0px_0px_#000] p-2 space-y-1 z-50 font-vt323">
                  {appLinks.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setAppsMenuOpen(false)}
                        className={`flex items-start gap-3 p-2 transition-all ${
                          isActive
                            ? 'bg-[#ffe600] text-black font-bold'
                            : 'hover:bg-[#1e202e] text-gray-200 hover:text-white'
                        }`}
                      >
                        <Icon className="w-5 h-5 mt-0.5 shrink-0 text-[#00f2fe]" />
                        <div>
                          <div className="text-base font-bold leading-tight">{item.label}</div>
                          <div className="text-xs text-gray-400">{item.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>

          </nav>

          {/* Right Actions: Pixel Wallet Button */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={connectWallet}
              className={`flex items-center gap-2 px-3 py-2 text-[10px] font-pixel transition-all ${
                isConnected
                  ? 'pixel-btn-cyan'
                  : 'pixel-btn-yellow'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
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
