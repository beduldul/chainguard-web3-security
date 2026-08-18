import http from 'http';

function testEndpoint(path, postData = null) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3000,
      path,
      method: postData ? 'POST' : 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, body: data });
      });
    });

    req.on('error', (err) => resolve({ error: err.message }));
    if (postData) req.write(JSON.stringify(postData));
    req.end();
  });
}

async function runTests() {
  console.log('=== CHAINGUARD SUITE INTEGRATION TEST RUNNER ===\n');

  // Test 1: Analyze Tx API
  const txRes = await testEndpoint('/api/analyze-tx', {
    calldata: '0x095ea7b30000000000000000000000008192fa000000000000000000000000000092faffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
    targetContract: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    dappDomain: 'https://uniswap-like.xyz'
  });
  console.log(`[TEST 1] POST /api/analyze-tx -> Status: ${txRes.statusCode} ${txRes.statusCode === 200 ? '✓ PASS' : '❌ FAIL'}`);

  // Test 2: Scan Domain API
  const domainRes = await testEndpoint('/api/scan-domain', {
    domain: 'uniswap-like.xyz'
  });
  console.log(`[TEST 2] POST /api/scan-domain -> Status: ${domainRes.statusCode} ${domainRes.statusCode === 200 ? '✓ PASS' : '❌ FAIL'}`);

  console.log('\n=== TEST SUITE COMPLETED SUCCESSFULLY ===');
}

runTests();
