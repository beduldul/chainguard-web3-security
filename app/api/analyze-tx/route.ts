import { NextRequest, NextResponse } from 'next/server';
import { decodeCalldata } from '@/lib/txDecoder';
import { calculateRiskScore } from '@/lib/riskEngine';
import { simulateTransaction } from '@/lib/simulator';
import { generateAiExplanation } from '@/lib/aiExplainer';
import { ContractSecurityReport } from '@/lib/types';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { to = '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', calldata = '0x', valueEth = '0', chainId = 8453, locale = 'en', isPreset = false } = body;

    // Validate inputs
    if (to && !to.startsWith('0x')) {
      return NextResponse.json({ success: false, error: 'Invalid contract address format. Must start with 0x.' }, { status: 400 });
    }

    const decoded = decodeCalldata(to, calldata, valueEth, chainId, isPreset);

    // Mock/Fetch contract security report
    const normalizedTo = to.toLowerCase();
    const isKnownMalicious = normalizedTo.includes('8192fa') || normalizedTo.includes('1234567890');
    const isKnownLegit = normalizedTo.includes('a0b86991') || normalizedTo.includes('ef1c6e67');

    const contractReport: ContractSecurityReport = {
      address: to,
      name: decoded.contractName,
      verified: isKnownLegit ? true : !isKnownMalicious,
      ageDays: isKnownLegit ? 1420 : isKnownMalicious ? 2 : 12,
      isProxy: normalizedTo.includes('91f840') || normalizedTo.includes('8192fa'),
      adminPresent: isKnownMalicious || normalizedTo.includes('91f840'),
      holderCount: isKnownLegit ? 485000 : isKnownMalicious ? 18 : 140,
      liquidityUsd: isKnownLegit ? 15000000 : isKnownMalicious ? 420 : 12000,
      knownExploitsCount: isKnownMalicious ? 3 : 0,
      honeypotDetected: isKnownMalicious,
      creatorAddress: '0x3a4b9c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b',
      transactionCount: isKnownLegit ? 1204000 : isKnownMalicious ? 42 : 890,
    };

    const riskResult = calculateRiskScore(decoded, contractReport);
    const simulation = simulateTransaction(decoded);

    const fullReport = {
      score: riskResult.score,
      riskLevel: riskResult.riskLevel,
      decodedTx: decoded,
      contractReport,
      simulation,
      riskFactors: riskResult.factors,
      recommendations: riskResult.recommendations,
      dataSource: 'SIMULATION_SANDBOX' as const,
    };

    const aiExplanation = generateAiExplanation(fullReport, locale);

    return NextResponse.json({
      success: true,
      data: {
        ...fullReport,
        aiExplanation,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to analyze transaction' },
      { status: 400 }
    );
  }
}
