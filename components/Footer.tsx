'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Terminal, Github, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-[#00ff66]/30 bg-[#040609] py-10 font-cli text-xs text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="text-[#00ff66] font-bold text-sm">root@chainguard:~#</span>
              <span className="text-gray-400 font-mono text-xs">[v2.6 SECURED SYSTEM]</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed max-w-md font-mono">
              The next-generation Web3 security firewall & multi-startup ecosystem. Real-time EVM calldata simulation, Solana Phantom wallet protection, automated recurring crypto billing, and autonomous AI drainer bot hunter.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#00ff66] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#00ff66] animate-pulse" />
              SYSTEM DAEMON: ONLINE • BASE / SOLANA / ETHEREUM MAINNET
            </div>
          </div>

          {/* Security Hub Links */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-[#00ff66] uppercase tracking-wider text-[11px] mb-3">$ ./security-hub</h5>
            <ul className="space-y-1.5 font-mono">
              <li><Link href="/" className="hover:text-[#00ff66] transition-colors">./tx-guardian.sh</Link></li>
              <li><Link href="/wallet-exposure" className="hover:text-[#00ff66] transition-colors">./wallet-audit.sh</Link></li>
              <li><Link href="/ai-agent" className="hover:text-[#00ff66] transition-colors">./ai-agent-bot.sh</Link></li>
              <li><Link href="/website-scanner" className="hover:text-[#00ff66] transition-colors">./domain-scan.sh</Link></li>
              <li><Link href="/extension-demo" className="hover:text-[#00ff66] transition-colors">./extension.sh</Link></li>
            </ul>
          </div>

          {/* Web3 Apps Links */}
          <div className="space-y-2 text-xs">
            <h5 className="font-bold text-[#ffb000] uppercase tracking-wider text-[11px] mb-3">$ ./web3-apps</h5>
            <ul className="space-y-1.5 font-mono">
              <li><Link href="/checkout" className="hover:text-[#ffb000] transition-colors">./checkout-router.sh</Link></li>
              <li><Link href="/subscriptions" className="hover:text-[#ffb000] transition-colors">./recurring-billing.sh</Link></li>
              <li><Link href="/bounties" className="hover:text-[#ffb000] transition-colors">./github-bounty.sh</Link></li>
              <li><Link href="/payroll" className="hover:text-[#ffb000] transition-colors">./crypto-payroll.sh</Link></li>
              <li><Link href="/escrow" className="hover:text-[#ffb000] transition-colors">./freelancer-escrow.sh</Link></li>
              <li><Link href="/credit-score" className="hover:text-[#ffb000] transition-colors">./credit-score.sh</Link></li>
              <li><a href="https://github.com/beduldul/chainguard-web3-security" target="_blank" rel="noreferrer" className="hover:text-[#00ff66] transition-colors flex items-center gap-1"><Github className="w-3 h-3" /> ./github-repo.sh</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-[#00ff66]/20 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-gray-500 font-mono gap-4">
          <p>© 2026 ChainGuard Security Protocols. Distributed under MIT License.</p>
          <p className="flex items-center gap-4 text-gray-400">
            <span>[STATUS: 100% OPERATIONAL]</span>
            <span>[BUILD: v2.6-PROD]</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
