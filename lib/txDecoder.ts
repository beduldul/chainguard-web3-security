import { DecodedTx } from './types';

// Common EVM signature hashes
const SIGNATURE_MAP: Record<string, { name: string; sig: string; decoder: (data: string) => any }> = {
  '0x095ea7b3': {
    name: 'approve',
    sig: 'approve(address spender, uint256 amount)',
    decoder: (data: string) => {
      const spender = '0x' + data.slice(34, 74);
      const rawAmount = BigInt('0x' + (data.slice(74, 138) || '0'));
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      const isUnlimited = rawAmount >= (maxUint256 / BigInt(2));
      return {
        spender,
        amount: rawAmount.toString(),
        amountFormatted: isUnlimited ? 'UNLIMITED (2^256-1)' : (Number(rawAmount) / 1e6).toLocaleString() + ' tokens',
        isUnlimited,
      };
    },
  },
  '0xa9059cbb': {
    name: 'transfer',
    sig: 'transfer(address recipient, uint256 amount)',
    decoder: (data: string) => {
      const recipient = '0x' + data.slice(34, 74);
      const rawAmount = BigInt('0x' + (data.slice(74, 138) || '0'));
      return {
        recipient,
        amount: rawAmount.toString(),
        amountFormatted: (Number(rawAmount) / 1e18).toFixed(4),
        isUnlimited: false,
      };
    },
  },
  '0x23b872dd': {
    name: 'transferFrom',
    sig: 'transferFrom(address sender, address recipient, uint256 amount)',
    decoder: (data: string) => {
      const sender = '0x' + data.slice(34, 74);
      const recipient = '0x' + data.slice(98, 138);
      const rawAmount = BigInt('0x' + (data.slice(138, 202) || '0'));
      return {
        sender,
        recipient,
        amount: rawAmount.toString(),
        amountFormatted: (Number(rawAmount) / 1e18).toFixed(4),
        isUnlimited: false,
      };
    },
  },
  '0xd547741f': {
    name: 'permit',
    sig: 'permit(address owner, address spender, uint256 value, uint256 deadline, uint8 v, bytes32 r, bytes32 s)',
    decoder: (data: string) => {
      const spender = '0x' + data.slice(98, 138);
      const rawAmount = BigInt('0x' + (data.slice(138, 202) || '0'));
      const maxUint256 = BigInt('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff');
      const isUnlimited = rawAmount >= (maxUint256 / BigInt(2));
      return {
        spender,
        amount: rawAmount.toString(),
        amountFormatted: isUnlimited ? 'UNLIMITED (Off-chain EIP-712 Permit)' : (Number(rawAmount) / 1e6).toLocaleString(),
        isUnlimited,
      };
    },
  },
  '0xa22cb465': {
    name: 'setApprovalForAll',
    sig: 'setApprovalForAll(address operator, bool approved)',
    decoder: (data: string) => {
      const operator = '0x' + data.slice(34, 74);
      const approved = BigInt('0x' + (data.slice(74, 138) || '0')) !== BigInt(0);
      return {
        operator,
        approved,
        amountFormatted: approved ? 'UNLIMITED (All NFT Collection Items)' : 'REVOKED',
        isUnlimited: approved,
      };
    },
  },
  '0x35935010': {
    name: 'execute',
    sig: 'execute(bytes commands, bytes[] inputs, uint256 deadline)',
    decoder: (data: string) => ({
      router: 'Uniswap Universal Router',
      commandsLength: data.length,
      amountFormatted: 'Multicall Router Swap Command',
      isUnlimited: false,
    }),
  },
  '0x5ae4010a': {
    name: 'multicall',
    sig: 'multicall(uint256 deadline, bytes[] data)',
    decoder: (data: string) => ({
      batchCalls: 'Multicall Batch Execution',
      amountFormatted: 'Batch Interaction',
      isUnlimited: false,
    }),
  },
};

const CHAIN_NAMES: Record<number, string> = {
  1: 'Ethereum Mainnet',
  8453: 'Base Mainnet',
  42161: 'Arbitrum One',
  84532: 'Base Sepolia Testnet',
  11155111: 'Sepolia Testnet',
};

const KNOWN_CONTRACTS: Record<string, string> = {
  '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48': 'USDC Token (Verified)',
  '0xdac17f958d2ee523a2206206994597c13d831ec7': 'USDT Token (Verified)',
  '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2': 'WETH Token (Verified)',
  '0x6b175474e89094c44da98b954eedeac495271d0f': 'DAI Stablecoin (Verified)',
  '0xef1c6e67703fe196724ded0749da599e8cb1094a': 'Uniswap Universal Router',
  '0x8192fa00000000000000000000000000000092fa': 'Uniswap-like.xyz (Unverified Malicious)',
  '0x123456789012345678901234567890123456abcd': 'FakeAirdropDrainer (Honeypot)',
};

export function decodeCalldata(
  to: string,
  calldata: string,
  valueEth: string = '0',
  chainId: number = 8453,
  isPreset: boolean = false
): DecodedTx {
  const normalizedTo = to.toLowerCase();
  const hexData = calldata.startsWith('0x') ? calldata : '0x' + calldata;
  const methodSig = hexData.slice(0, 10).toLowerCase();

  const known = SIGNATURE_MAP[methodSig];

  if (known) {
    const parsedParams = known.decoder(hexData);
    const spenderAddr = parsedParams.spender || parsedParams.operator || parsedParams.recipient;

    return {
      functionName: known.name,
      signature: known.sig,
      contractAddress: to,
      contractName: KNOWN_CONTRACTS[normalizedTo] || 'Unknown Contract',
      spenderAddress: spenderAddr,
      spenderName: spenderAddr ? KNOWN_CONTRACTS[spenderAddr.toLowerCase()] || undefined : undefined,
      amount: parsedParams.amount || '0',
      amountFormatted: parsedParams.amountFormatted || 'N/A',
      isUnlimitedApproval: !!parsedParams.isUnlimited,
      rawCalldata: hexData,
      valueEth,
      chainId,
      chainName: CHAIN_NAMES[chainId] || `Chain ID ${chainId}`,
      params: parsedParams,
      provenance: isPreset ? 'PRESET_VECTOR' : 'MANUAL_PARSED',
    };
  }

  // Fallback for custom or unknown calldata
  return {
    functionName: calldata.length > 2 ? 'executeCustomTransaction' : 'nativeTransfer',
    signature: 'customInteraction(bytes data)',
    contractAddress: to,
    contractName: KNOWN_CONTRACTS[normalizedTo] || 'Unverified Contract',
    rawCalldata: hexData,
    valueEth,
    chainId,
    chainName: CHAIN_NAMES[chainId] || `Chain ID ${chainId}`,
    isUnlimitedApproval: false,
    params: { hexLength: hexData.length },
    provenance: isPreset ? 'PRESET_VECTOR' : 'MANUAL_PARSED',
  };
}
