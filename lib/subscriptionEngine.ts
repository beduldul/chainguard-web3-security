export interface SubscriptionPlan {
  id: string;
  name: string;
  merchantName: string;
  priceUsdc: number;
  intervalDays: number;
  status: 'ACTIVE' | 'PAUSED' | 'CANCELLED';
  nextBillingDate: string;
  totalPaidUsdc: number;
}

export const INITIAL_SUBSCRIPTIONS: SubscriptionPlan[] = [
  {
    id: 'sub-101',
    name: 'ChainGuard Security SDK Enterprise',
    merchantName: 'ChainGuard Security Inc.',
    priceUsdc: 299,
    intervalDays: 30,
    status: 'ACTIVE',
    nextBillingDate: '2026-09-18',
    totalPaidUsdc: 897,
  },
  {
    id: 'sub-102',
    name: 'Solana RPC High-Speed Dedicated Node',
    merchantName: 'Helius Labs Partner',
    priceUsdc: 49,
    intervalDays: 30,
    status: 'ACTIVE',
    nextBillingDate: '2026-09-02',
    totalPaidUsdc: 147,
  },
  {
    id: 'sub-103',
    name: 'DeFi Market Intelligence & MEV Protection',
    merchantName: 'Flashbots Analytics',
    priceUsdc: 29,
    intervalDays: 30,
    status: 'PAUSED',
    nextBillingDate: '2026-10-01',
    totalPaidUsdc: 58,
  },
];
