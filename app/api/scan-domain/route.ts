import { NextRequest, NextResponse } from 'next/server';
import { scanDappDomain } from '@/lib/domainScanner';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = body.url || body.domain || body.targetDomain;
    
    if (!targetUrl) {
      return NextResponse.json(
        { success: false, error: 'URL or domain parameter is required' },
        {
          status: 400,
          headers: { 'Access-Control-Allow-Origin': '*' },
        }
      );
    }

    const scanResult = scanDappDomain(targetUrl);
    return NextResponse.json(
      { success: true, data: scanResult },
      { headers: { 'Access-Control-Allow-Origin': '*' } }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message },
      {
        status: 500,
        headers: { 'Access-Control-Allow-Origin': '*' },
      }
    );
  }
}
