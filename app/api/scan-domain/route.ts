import { NextRequest, NextResponse } from 'next/server';
import { scanDappDomain } from '@/lib/domainScanner';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const targetUrl = body.url || body.domain || body.targetDomain;
    
    if (!targetUrl) {
      return NextResponse.json({ success: false, error: 'URL or domain parameter is required' }, { status: 400 });
    }

    const scanResult = scanDappDomain(targetUrl);
    return NextResponse.json({ success: true, data: scanResult });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
