'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Terminal, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#040609] py-12 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                <Shield className="w-4 h-4 text-cyan-400" />
              </div>
              <span className="font-bold text-white tracking-wider text-base">ChainGuard</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-sm">
              The next-generation Web3 transaction firewall and security engine. Real-time EVM calldata simulation, contract vulnerability auditing, and automated approval risk prevention before you sign.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-cyan-400 font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Security Engine: Online • Base / Ethereum Mainnet
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Security Tools</h5>
            <ul className="space-y-2 font-mono">
              <li><Link href="/" className="hover:text-cyan-400 transition-colors">Tx Simulator Guardian</Link></li>
              <li><Link href="/wallet-exposure" className="hover:text-cyan-400 transition-colors">Wallet Approval Scanner</Link></li>
              <li><Link href="/website-scanner" className="hover:text-cyan-400 transition-colors">dApp Website Auditor</Link></li>
              <li><Link href="/extension-demo" className="hover:text-cyan-400 transition-colors">Browser Extension Popup</Link></li>
            </ul>
          </div>

          {/* Developer API */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-white uppercase tracking-wider text-[11px] mb-3">Developers & Infrastructure</h5>
            <ul className="space-y-2 font-mono">
              <li><Link href="/sdk-docs" className="hover:text-cyan-400 transition-colors">@chainguard/sdk Docs</Link></li>
              <li><Link href="/api/analyze-tx" className="hover:text-cyan-400 transition-colors">REST API (/api/v1/analyze)</Link></li>
              <li><a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-cyan-400 transition-colors flex items-center gap-1"><Github className="w-3 h-3" /> GitHub Repository</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/5 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-mono gap-4">
          <p>© 2026 ChainGuard Security Protocols. Built for Web3 Security & Trust.</p>
          <p className="flex items-center gap-4">
            <span>Privacy Policy</span>
            <span>Security Bounty</span>
            <span>Audit Reports</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
