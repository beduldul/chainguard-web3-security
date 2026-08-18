import { DecodedTx, SimulationResult } from './types';

export function simulateTransaction(decodedTx: DecodedTx): SimulationResult {
  // If it's an unlimited approval scam or transfer
  if (decodedTx.functionName === 'approve' || decodedTx.functionName === 'permit') {
    const isUnlimited = decodedTx.isUnlimitedApproval;
    const tokenSymbol = decodedTx.contractName?.includes('USDC') ? 'USDC' : decodedTx.contractName?.includes('USDT') ? 'USDT' : 'TOKEN';
    
    return {
      status: 'SUCCESS',
      gasEstimated: 45210,
      gasEstimatedUsd: 1.85,
      tokensOut: [],
      tokensIn: [],
      approvalsGranted: [
        {
          tokenSymbol,
          spender: decodedTx.spenderAddress || '0xUnknown',
          spenderName: decodedTx.spenderName || 'Unverified Contract',
          allowance: decodedTx.amountFormatted || 'UNLIMITED',
          isUnlimited,
        },
      ],
      balanceChanges: [
        {
          asset: tokenSymbol,
          before: '5,000.00 ' + tokenSymbol,
          after: isUnlimited ? '0.00 (Exposed to Drain Risk)' : '5,000.00 ' + tokenSymbol,
          change: isUnlimited ? '-5,000.00 ' + tokenSymbol + ' (Exposure)' : '0.00',
          isNegative: isUnlimited,
        },
      ],
    };
  }

  if (decodedTx.functionName === 'transfer') {
    return {
      status: 'SUCCESS',
      gasEstimated: 21000,
      gasEstimatedUsd: 0.95,
      tokensOut: [
        {
          symbol: 'ETH',
          amount: decodedTx.valueEth || '0.5',
          usdValue: (Number(decodedTx.valueEth || '0.5') * 3200),
          tokenAddress: '0x0000000000000000000000000000000000000000',
        },
      ],
      tokensIn: [],
      approvalsGranted: [],
      balanceChanges: [
        {
          asset: 'ETH',
          before: '3.42 ETH',
          after: `${(3.42 - Number(decodedTx.valueEth || 0.5)).toFixed(3)} ETH`,
          change: `-${decodedTx.valueEth} ETH`,
          isNegative: true,
        },
      ],
    };
  }

  // Fallback for standard DEX Swap (e.g. Uniswap)
  return {
    status: 'SUCCESS',
    gasEstimated: 128450,
    gasEstimatedUsd: 4.25,
    tokensOut: [
      {
        symbol: 'USDC',
        amount: '1,000.00',
        usdValue: 1000,
        tokenAddress: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
    ],
    tokensIn: [
      {
        symbol: 'WETH',
        amount: '0.3125',
        usdValue: 1000,
        tokenAddress: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
    ],
    approvalsGranted: [],
    balanceChanges: [
      {
        asset: 'USDC',
        before: '4,820.00 USDC',
        after: '3,820.00 USDC',
        change: '-1,000.00 USDC',
        isNegative: true,
      },
      {
        asset: 'WETH',
        before: '1.20 WETH',
        after: '1.5125 WETH',
        change: '+0.3125 WETH',
        isNegative: false,
      },
    ],
  };
}
