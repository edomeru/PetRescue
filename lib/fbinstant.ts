/**
 * Facebook Instant Games Integration & In-App Purchase Bridge
 *
 * Supports both:
 * 1. Direct FBInstant environment (when FBInstant SDK is injected directly)
 * 2. Cross-domain Iframe wrapper (when hosted in Facebook Instant Games web package)
 *
 * Leaves itch.io, GameJolt, CrazyGames, and standalone web completely untouched (falls back to Stripe).
 */

export interface FBPlayerInfo {
  id: string;
  name: string;
  photo?: string;
}

export interface FBPurchaseResult {
  success: boolean;
  purchase?: {
    developerPayload?: string;
    paymentID?: string;
    productID?: string;
    purchaseTime?: string;
    purchaseToken?: string;
    signedRequest?: string;
  };
  error?: string;
  canceled?: boolean;
}

// Check if running within Facebook Instant Games (direct SDK or wrapper iframe)
export function isFBInstantEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  // Direct SDK on window
  if (typeof (window as any).FBInstant !== 'undefined') return true;

  // Embedded with ?platform=fbinstant parameter
  const params = new URLSearchParams(window.location.search);
  if (params.get('platform') === 'fbinstant') return true;

  return false;
}

// Request purchase through Facebook Instant Games In-App Purchase API
export async function purchaseViaFBInstant(
  productID: string,
  developerPayload: string = 'guest'
): Promise<FBPurchaseResult> {
  if (typeof window === 'undefined') {
    return { success: false, error: 'Window not available' };
  }

  // 1. Direct FBInstant SDK available on current window
  if (typeof (window as any).FBInstant !== 'undefined') {
    const fb = (window as any).FBInstant;
    try {
      if (!fb.payments || typeof fb.payments.purchaseAsync !== 'function') {
        return { success: false, error: 'Facebook Instant Games payments are not supported on this device/environment' };
      }

      const purchase = await fb.payments.purchaseAsync({
        productID,
        developerPayload,
      });

      // Consumables (coin packs, boosters) should be consumed immediately so they can be bought again
      const isConsumable = !productID.startsWith('pet_adopt_') && productID !== 'vip_pass' && !productID.startsWith('accessory_');
      if (isConsumable && purchase?.purchaseToken && typeof fb.payments.consumePurchaseAsync === 'function') {
        try {
          await fb.payments.consumePurchaseAsync(purchase.purchaseToken);
        } catch (consumeErr) {
          console.warn('[FBInstant] Consume note:', consumeErr);
        }
      }

      return { success: true, purchase };
    } catch (err: any) {
      console.warn('[FBInstant] Purchase error:', err);
      const isUserCancel = err?.code === 'USER_INPUT' || err?.message?.toLowerCase().includes('cancel');
      return { success: false, canceled: isUserCancel, error: err?.message || 'Payment was canceled or failed' };
    }
  }

  // 2. Iframe Bridge: Communicate with Facebook Instant Games wrapper parent
  if (window.parent && window.parent !== window) {
    return new Promise((resolve) => {
      const requestId = `fb_req_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
      let settled = false;

      const messageHandler = (event: MessageEvent) => {
        if (!event.data || event.data.type !== 'PAWTORA_FB_PURCHASE_RESPONSE' || event.data.requestId !== requestId) {
          return;
        }

        window.removeEventListener('message', messageHandler);
        settled = true;

        if (event.data.success) {
          resolve({ success: true, purchase: event.data.purchase });
        } else {
          resolve({
            success: false,
            canceled: event.data.canceled || false,
            error: event.data.error || 'Facebook purchase failed',
          });
        }
      };

      window.addEventListener('message', messageHandler);

      // Post purchase request to wrapper parent
      window.parent.postMessage(
        {
          type: 'PAWTORA_FB_PURCHASE_REQUEST',
          requestId,
          productID,
          developerPayload,
        },
        '*'
      );

      // Timeout safety (2 minutes for user to complete or cancel dialog)
      setTimeout(() => {
        if (!settled) {
          window.removeEventListener('message', messageHandler);
          resolve({ success: false, error: 'Facebook checkout timed out' });
        }
      }, 120000);
    });
  }

  return { success: false, error: 'Not in Facebook Instant Games environment' };
}
