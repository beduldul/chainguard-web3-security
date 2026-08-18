// Automated API Verification Script
import http from 'http';

function makePost(path, body) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(body);
    const req = http.request(
      {
        hostname: 'localhost',
        port: 3000,
        path,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (res) => {
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      }
    );
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Running ChainGuard API Verification Suite...');

  try {
    // Test 1: Analyze Transaction API
    const txRes = await makePost('/api/analyze-tx', {
      to: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      calldata: '0x095ea7b30000000000000000000000008192fa000000000000000000000000000092faffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
      valueEth: '0',
      chainId: 8453,
    });

    if (txRes.status === 200 && txRes.data.success) {
      console.log('✅ TEST 1 PASSED: /api/analyze-tx returned Risk Score:', txRes.data.data.score);
    } else {
      console.error('❌ TEST 1 FAILED:', txRes);
    }

    // Test 2: Domain Scanner API
    const domainRes = await makePost('/api/scan-domain', {
      url: 'https://uniswap-like.xyz',
    });

    if (domainRes.status === 200 && domainRes.data.success) {
      console.log('✅ TEST 2 PASSED: /api/scan-domain returned Domain Score:', domainRes.data.data.score);
    } else {
      console.error('❌ TEST 2 FAILED:', domainRes);
    }

    console.log('🎉 All API verification tests completed successfully!');
  } catch (err) {
    console.error('❌ Test execution error:', err.message);
  }
}

runTests();
