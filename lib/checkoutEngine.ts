export interface PaymentRoute {
  id: string;
  sourceChain: string;
  sourceChainId: number;
  sourceToken: string;
  sourceAmount: string;
  usdEquivalent: number;
  estimatedGasUsd: number;
  bridgeFeeUsd: number;
  totalCostUsd: number;
  recommended: boolean;
  speedSeconds: number;
}

export interface CheckoutSession {
  sessionId: string;
  merchantName: string;
  merchantAddress: string;
  requestedUsd: number;
  itemDescription: string;
  preferredAsset: string;
  availableRoutes: PaymentRoute[];
}

export function generateCheckoutRoutes(requestedUsd: number): PaymentRoute[] {
  const ethPrice = 3200;
  const ethNeeded = (requestedUsd / ethPrice).toFixed(4);

  return [
    {
      id: 'route-base-usdc',
      sourceChain: 'Base Mainnet',
      sourceChainId: 8453,
      sourceToken: 'USDC',
      sourceAmount: requestedUsd.toFixed(2),
      usdEquivalent: requestedUsd,
      estimatedGasUsd: 0.05,
      bridgeFeeUsd: 0,
      totalCostUsd: requestedUsd + 0.05,
      recommended: true,
      speedSeconds: 2,
    },
    {
      id: 'route-base-eth',
      sourceChain: 'Base Mainnet',
      sourceChainId: 8453,
      sourceToken: 'ETH',
      sourceAmount: ethNeeded,
      usdEquivalent: requestedUsd,
      estimatedGasUsd: 0.12,
      bridgeFeeUsd: 0,
      totalCostUsd: requestedUsd + 0.12,
      recommended: false,
      speedSeconds: 3,
    },
    {
      id: 'route-arbitrum-usdt',
      sourceChain: 'Arbitrum One',
      sourceChainId: 42161,
      sourceToken: 'USDT',
      sourceAmount: requestedUsd.toFixed(2),
      usdEquivalent: requestedUsd,
      estimatedGasUsd: 0.25,
      bridgeFeeUsd: 0.50,
      totalCostUsd: requestedUsd + 0.75,
      recommended: false,
      speedSeconds: 5,
    },
    {
      id: 'route-ethereum-eth',
      sourceChain: 'Ethereum Mainnet',
      sourceChainId: 1,
      sourceToken: 'ETH',
      sourceAmount: ethNeeded,
      usdEquivalent: requestedUsd,
      estimatedGasUsd: 2.80,
      bridgeFeeUsd: 1.20,
      totalCostUsd: requestedUsd + 4.00,
      recommended: false,
      speedSeconds: 15,
    },
  ];
}
