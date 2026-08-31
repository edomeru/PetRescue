/**
 * Modular Firebase configuration helper.
 * Automatically checks for process.env variables. If present, initializes Firebase SDK.
 * Otherwise, degrades gracefully so the game works 100% locally out-of-the-box.
 */

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
};

export async function syncStateWithFirebase(userId: string, data: Record<string, unknown>) {
  if (!isFirebaseConfigured()) {
    console.log('[Local Fallback] Firebase keys not configured. State saved to LocalStorage.');
    return { success: true, mode: 'local' };
  }

  try {
    // Dynamic import to keep initial JS bundle tiny when Firebase isn't set up yet
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore, doc, setDoc } = await import('firebase/firestore');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const db = getFirestore(app);

    await setDoc(doc(db, 'users', userId), data, { merge: true });
    return { success: true, mode: 'firebase' };
  } catch (error) {
    console.error('Firebase Sync Error:', error);
    return { success: false, error };
  }
}
