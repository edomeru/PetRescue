/**
 * Safe checkout redirection helper for standalone & iframe-embedded environments (GameJolt, CrazyGames, etc.)
 *
 * Stripe Checkout strictly blocks being embedded in iframes (X-Frame-Options: DENY / CSP frame-ancestors: 'none').
 * In iframe environments, we open a new tab synchronously during the click event to bypass popup blockers,
 * and then navigate that tab to the Stripe checkout URL.
 */

export function prepareCheckoutWindow(): Window | null {
  if (typeof window === 'undefined') return null;

  // Check if running inside an iframe (e.g. GameJolt, CrazyGames)
  const isIframe = window.self !== window.top;
  if (!isIframe) return null;

  try {
    const popup = window.open('', '_blank');
    if (popup) {
      popup.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Pawtora – Connecting to Checkout</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <style>
              body {
                margin: 0;
                padding: 0;
                background: #0f1026;
                color: #ffffff;
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                text-align: center;
              }
              .card {
                background: rgba(255, 255, 255, 0.06);
                border: 1px solid rgba(255, 255, 255, 0.12);
                border-radius: 20px;
                padding: 36px 32px;
                max-width: 360px;
                box-shadow: 0 20px 40px rgba(0,0,0,0.5);
              }
              .paw {
                font-size: 48px;
                animation: pulse 1.2s ease-in-out infinite;
                margin-bottom: 16px;
              }
              h2 {
                margin: 0 0 8px;
                font-size: 20px;
                background: linear-gradient(135deg, #ff6eb4, #ffa94d);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
              }
              p {
                margin: 0;
                font-size: 14px;
                color: #9ca3af;
                line-height: 1.5;
              }
              .spinner {
                width: 28px;
                height: 28px;
                border: 3px solid rgba(255,255,255,0.1);
                border-top-color: #ff6eb4;
                border-radius: 50%;
                animation: spin 0.8s linear infinite;
                margin: 20px auto 0;
              }
              @keyframes spin { to { transform: rotate(360deg); } }
              @keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.15); } }
            </style>
          </head>
          <body>
            <div class="card">
              <div class="paw">🐾</div>
              <h2>Secure Checkout</h2>
              <p>Connecting to Stripe payment portal…</p>
              <div class="spinner"></div>
            </div>
          </body>
        </html>
      `);
      return popup;
    }
  } catch (err) {
    console.warn('Popup window initialization prevented:', err);
  }

  return null;
}

export function navigateToCheckout(url: string, popup?: Window | null): void {
  if (typeof window === 'undefined') return;

  const isIframe = window.self !== window.top;

  if (isIframe) {
    if (popup && !popup.closed) {
      popup.location.href = url;
      return;
    }

    // Fallback: Attempt top window navigation, or open new tab if blocked
    try {
      if (window.top) {
        window.top.location.href = url;
        return;
      }
    } catch {
      // Cross-origin top navigation blocked by iframe sandbox
    }

    window.open(url, '_blank');
  } else {
    // Standard standalone window redirect
    window.location.href = url;
  }
}

export function closeCheckoutWindow(popup?: Window | null): void {
  if (popup && !popup.closed) {
    try {
      popup.close();
    } catch {}
  }
}
