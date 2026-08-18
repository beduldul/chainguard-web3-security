'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Terminal, Shield, Wallet, ChevronDown, Cpu, Lock } from 'lucide-react';

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
    { href: '/', label: './tx-guardian.sh', desc: 'Calldata Simulator & Risk Score Engine' },
    { href: '/wallet-exposure', label: './wallet-audit.sh', desc: 'Scan & Revoke At-Risk Approvals' },
    { href: '/website-scanner', label: './domain-scan.sh', desc: 'Check Phishing & SSL Integrity' },
    { href: '/extension-demo', label: './extension-interceptor.sh', desc: 'Live Chrome Extension Sandbox' },
  ];

  const appLinks = [
    { href: '/checkout', label: './checkout-router.sh', desc: 'Stripe for Multi-Chain Crypto' },
    { href: '/payroll', label: './crypto-payroll.sh', desc: 'Corporate Batch Disbursal Engine' },
    { href: '/escrow', label: './freelancer-escrow.sh', desc: 'Milestone Fund Locking & Release' },
    { href: '/credit-score', label: './credit-score.sh', desc: 'Wallet Reputation & DeFi Rating' },
    { href: '/merchant', label: './merchant-portal.sh', desc: 'Embeddable Payment Widget Code' },
    { href: '/sdk-docs', label: './api-sandbox.sh', desc: 'Live REST API Testing Sandbox' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#07090e] border-b border-[#00ff66] font-cli text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-12 gap-4">
          
          {/* CLI Terminal Prompt Logo */}
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <span className="text-[#00ff66] font-bold">root@chainguard:~#</span>
            <span className="text-gray-400 font-mono text-[11px] hidden sm:inline">[v2.6 SECURED]</span>
          </Link>

          {/* Terminal Command Dropdowns */}
          <nav className="hidden md:flex items-center gap-4">
            
            {/* 1. Security Tools Dropdown */}
            <div className="relative" ref={securityRef}>
              <button
                onClick={() => {
                  setSecurityMenuOpen(!securityMenuOpen);
                  setAppsMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 px-3 py-1 border transition-all ${
                  securityLinks.some(l => l.href === pathname)
                    ? 'bg-[#00ff66] text-black font-bold border-[#00ff66]'
                    : 'bg-black text-[#00ff66] border-[#00ff66]/40 hover:border-[#00ff66]'
                }`}
              >
                <span>$ ./security-hub</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {securityMenuOpen && (
                <div className="absolute left-0 mt-2 w-72 bg-[#0a0c10] border border-[#00ff66] p-2 space-y-1 z-50 shadow-[0_0_20px_rgba(0,255,102,0.2)]">
                  {securityLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setSecurityMenuOpen(false)}
                      className={`block p-2 border ${
                        pathname === item.href
                          ? 'bg-[#00ff66] text-black font-bold border-[#00ff66]'
                          : 'border-transparent text-gray-300 hover:bg-[#121620] hover:text-[#00ff66]'
                      }`}
                    >
                      <div className="font-bold">{item.label}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </Link>
                  ))}
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
                className={`flex items-center gap-1.5 px-3 py-1 border transition-all ${
                  appLinks.some(l => l.href === pathname)
                    ? 'bg-[#ffb000] text-black font-bold border-[#ffb000]'
                    : 'bg-black text-[#ffb000] border-[#ffb000]/40 hover:border-[#ffb000]'
                }`}
              >
                <span>$ ./web3-apps</span>
                <ChevronDown className="w-3 h-3" />
              </button>

              {appsMenuOpen && (
                <div className="absolute left-0 mt-2 w-80 bg-[#0a0c10] border border-[#ffb000] p-2 space-y-1 z-50 shadow-[0_0_20px_rgba(255,176,0,0.2)]">
                  {appLinks.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setAppsMenuOpen(false)}
                      className={`block p-2 border ${
                        pathname === item.href
                          ? 'bg-[#ffb000] text-black font-bold border-[#ffb000]'
                          : 'border-transparent text-gray-300 hover:bg-[#121620] hover:text-[#ffb000]'
                      }`}
                    >
                      <div className="font-bold">{item.label}</div>
                      <div className="text-[10px] text-gray-400">{item.desc}</div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/extension-demo"
              className={`px-3 py-1 border ${
                pathname === '/extension-demo'
                  ? 'bg-[#00ff66] text-black font-bold border-[#00ff66]'
                  : 'bg-black text-gray-300 border-gray-700 hover:border-[#00ff66] hover:text-[#00ff66]'
              }`}
            >
              ./extension.sh
            </Link>

          </nav>

          {/* Right Wallet Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={connectWallet}
              className={`px-3 py-1 border font-bold transition-all ${
                isConnected
                  ? 'bg-[#00ff66] text-black border-[#00ff66]'
                  : 'bg-[#ffb000] text-black border-[#ffb000]'
              }`}
            >
              {isConnected ? (
                <span>[{walletAddress.slice(0, 4)}...{walletAddress.slice(-4)} ({walletType})]</span>
              ) : (
                <span>[AUTH_WALLET]</span>
              )}
            </button>
          </div>

        </div>
      </div>
    </header>
  );
}
