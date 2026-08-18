// ChainGuard Content Script - Injected EVM Provider Interceptor
console.log('🛡️ ChainGuard Extension Interceptor Active');

// Listen for messages from injected page script
window.addEventListener('message', async (event) => {
  if (event.source !== window || !event.data || event.data.type !== 'CHAINGUARD_TX_REQUEST') {
    return;
  }

  const { payload } = event.data;
  console.log('[ChainGuard] Intercepted EVM Transaction Request:', payload);

  // Relay to background service worker for risk analysis
  chrome.runtime.sendMessage(
    { type: 'ANALYZE_TX', payload },
    (response) => {
      window.postMessage(
        { type: 'CHAINGUARD_TX_RESPONSE', response },
        '*'
      );
    }
  );
});
