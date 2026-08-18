// ChainGuard Background Service Worker
chrome.runtime.onInstalled.addListener(() => {
  console.log('🛡️ ChainGuard Extension Installed Successfully');
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'ANALYZE_TX') {
    const { to, calldata, valueEth, chainId } = request.payload;

    fetch('http://localhost:3000/api/analyze-tx', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, calldata, valueEth, chainId }),
    })
      .then((res) => res.json())
      .then((data) => {
        sendResponse({ success: true, data: data.data });
      })
      .catch((err) => {
        sendResponse({ success: false, error: err.message });
      });

    return true; // Keep message channel open for async response
  }
});
