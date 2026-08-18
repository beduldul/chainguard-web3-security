'use client';

import React, { useState } from 'react';

export default function ExtensionDemoPage() {
  const [selectedTxType, setSelectedTxType] = useState<'APPROVAL' | 'SWAP' | 'PERMIT'>('APPROVAL');

  return (
    <div className="space-y-6 max-w-5xl mx-auto font-cli">
      {/* CLI Header Terminal Box */}
      <div className="cli-window">
        <div className="cli-header flex items-center justify-between text-gray-400">
          <span>bash - chainguard-extension-interceptor.sh (80x24)</span>
          <span>TTY /dev/pts/0</span>
        </div>

        <div className="p-6 space-y-3 font-mono text-xs">
          <pre className="text-[#00ff66] font-bold leading-none hidden sm:block">
{`
  ___ _  _   _   ___ _  _ ___ _  _   _   ___ ___  
 / __| || | /_\\ |_ _| \\| | _ | || | /_\\ | _ |   \\ 
| (__| __ |/ _ \\ | || .\` | _ | __ |/ _ \\|   | |) |
 \\___|_||_/_/ \\_|___|_|\\_|___|_||_/_/ \\_|_|_|___/ 
      [ BROWSER EXTENSION INTERCEPTOR ENGINE v2.6 ]
`}
          </pre>

          <div className="text-gray-300">
            <span className="text-[#00ff66] font-bold">root@chainguard:~#</span> ./extension_daemon --hook window.ethereum --mode active
          </div>

          <div className="text-gray-400 text-xs">
            [+] Extension active on Google Chrome / Brave. Intercepting pre-signature calldata...
          </div>
        </div>
      </div>

      {/* Interceptor Control Window */}
      <div className="cli-window">
        <div className="cli-header text-[#00ff66]">
          <span>[INPUT] Select Target Calldata Payload Vector</span>
        </div>

        <div className="p-6 space-y-4 text-xs">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedTxType('APPROVAL')}
              className={`px-3 py-1.5 border font-bold ${
                selectedTxType === 'APPROVAL'
                  ? 'bg-[#ff3355] text-black border-[#ff3355]'
                  : 'bg-black text-[#ff3355] border-[#ff3355]/40 hover:border-[#ff3355]'
              }`}
            >
              $ ./test-calldata.sh --vector UNLIMITED_USDC_APPROVAL
            </button>
            <button
              onClick={() => setSelectedTxType('SWAP')}
              className={`px-3 py-1.5 border font-bold ${
                selectedTxType === 'SWAP'
                  ? 'bg-[#00ff66] text-black border-[#00ff66]'
                  : 'bg-black text-[#00ff66] border-[#00ff66]/40 hover:border-[#00ff66]'
              }`}
            >
              $ ./test-calldata.sh --vector LEGIT_UNISWAP_V3_SWAP
            </button>
            <button
              onClick={() => setSelectedTxType('PERMIT')}
              className={`px-3 py-1.5 border font-bold ${
                selectedTxType === 'PERMIT'
                  ? 'bg-[#ff3355] text-black border-[#ff3355]'
                  : 'bg-black text-[#ff3355] border-[#ff3355]/40 hover:border-[#ff3355]'
              }`}
            >
              $ ./test-calldata.sh --vector EIP712_PERMIT_DRAINER
            </button>
          </div>

          {/* Interception Terminal Output Box */}
          <div className="p-4 bg-black border border-gray-800 space-y-3 font-mono">
            {selectedTxType === 'APPROVAL' && (
              <div className="space-y-2 text-[#ff3355]">
                <div className="font-bold text-sm">
                  [!] CRITICAL INTERCEPTION ALERT: UNLIMITED ALLOWANCE REQUEST
                </div>
                <div className="text-gray-300">
                  Target Domain  : https://uniswap-like.xyz (Phishing Vector)<br />
                  Method Signature: approve(address spender, uint256 amount)<br />
                  Spender Address : 0x742d35Cc6634C0532925a3b844Bc454e4438f44e (UNVERIFIED)<br />
                  Requested Amount: UNLIMITED (115792089237316195423570985008687907853269984665640564039457584007913129639935)<br />
                  Calculated Risk : 87/100 (CRITICAL DRAINER PROBABILITY)
                </div>
                <div className="p-3 bg-[#1e0a0d] border border-[#ff3355] text-white">
                  ACTION TAKEN: Web3 signature request intercepted & BLOCKED. Metamask popup prevented.
                </div>
                <div className="flex gap-3 pt-2">
                  <button className="px-4 py-1.5 bg-[#ff3355] text-black font-bold border border-[#ff3355]">
                    [REJECT_TRANSACTION]
                  </button>
                  <button className="px-4 py-1.5 bg-black text-gray-400 border border-gray-700">
                    [BYPASS_FORCE_SIGN]
                  </button>
                </div>
              </div>
            )}

            {selectedTxType === 'SWAP' && (
              <div className="space-y-2 text-[#00ff66]">
                <div className="font-bold text-sm">
                  [+] VERIFIED TRANSACTION: UNISWAP V3 ROUTER INTERACTION
                </div>
                <div className="text-gray-300">
                  Target Domain  : https://app.uniswap.org (Verified)<br />
                  Method Signature: exactInputSingle(ExactInputSingleParams params)<br />
                  Protocol Router : 0xE592427A0AEce92De3Edee1F18E0157C05861564 (Uniswap V3)<br />
                  Swap Path       : 1,000.00 USDC ➔ 0.3125 WETH<br />
                  Calculated Risk : 0/100 (VERIFIED SAFE)
                </div>
                <div className="p-3 bg-[#0a1e12] border border-[#00ff66] text-[#00ff66]">
                  ACTION TAKEN: Transaction verified safe. Passing payload to Metamask wallet extension.
                </div>
              </div>
            )}

            {selectedTxType === 'PERMIT' && (
              <div className="space-y-2 text-[#ff3355]">
                <div className="font-bold text-sm">
                  [!] CRITICAL DRAINER DETECTED: EIP-712 PERMIT SIGNATURE
                </div>
                <div className="text-gray-300">
                  Signature Type  : eth_signTypedData_v4 (Off-chain Gasless Approval)<br />
                  Spender Contract: 0x123456789012345678901234567890123456abcd (Blacklisted)<br />
                  Calculated Risk : 99/100 (KNOWN HONEYPOT DRAINER)
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
