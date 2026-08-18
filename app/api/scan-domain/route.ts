import { NextRequest, NextResponse } from 'next/server';
import { scanDappDomain } from '@/lib/domainScanner';

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ success: false, error: 'URL parameter is required' }, { status: 400 });
    }

    const scanResult = scanDappDomain(url);
    return NextResponse.json({ success: true, data: scanResult });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
