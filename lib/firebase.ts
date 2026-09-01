/**
 * Modular Firebase configuration helper.
 * Automatically checks for process.env variables. If present, initializes Firebase SDK.
 * Supports Anonymous Authentication and Firestore Cloud Sync.
 * Otherwise, degrades gracefully so the game works 100% locally out-of-the-box.
 */

import { GameState } from './gameState';

export const isFirebaseConfigured = (): boolean => {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID &&
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY.includes('your_firebase_api_key')
  );
};

const USER_ID_KEY = 'pet_rescue_anonymous_uid';

export function getLocalUserId(): string {
  if (typeof window === 'undefined') return 'guest_user';
  let uid = localStorage.getItem(USER_ID_KEY);
  if (!uid) {
    uid = 'anon_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
    localStorage.setItem(USER_ID_KEY, uid);
  }
  return uid;
}

/**
 * Initializes Firebase and signs in anonymously if configured.
 * Returns the stable anonymous user ID (UID).
 */
export async function initFirebaseAnonymousAuth(): Promise<string> {
  const fallbackUid = getLocalUserId();
  if (!isFirebaseConfigured() || typeof window === 'undefined') {
    return fallbackUid;
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getAuth, signInAnonymously } = await import('firebase/auth');

    const firebaseConfig = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    };

    const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
    const auth = getAuth(app);

    if (auth.currentUser) {
      localStorage.setItem(USER_ID_KEY, auth.currentUser.uid);
      return auth.currentUser.uid;
    }

    const userCredential = await signInAnonymously(auth);
    const uid = userCredential.user.uid;
    localStorage.setItem(USER_ID_KEY, uid);
    return uid;
  } catch (error) {
    console.warn('Firebase Anonymous Auth fallback to local ID:', error);
    return fallbackUid;
  }
}

/**
 * Syncs user game state to Firebase Firestore document users/{userId}.
 */
export async function syncStateWithFirebase(userId: string, data: Partial<GameState>) {
  if (!isFirebaseConfigured() || typeof window === 'undefined') {
    return { success: true, mode: 'local' };
  }

  try {
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

    await setDoc(
      doc(db, 'users', userId),
      {
        ...data,
        lastUpdated: new Date().toISOString(),
      },
      { merge: true }
    );

    return { success: true, mode: 'firebase' };
  } catch (error) {
    console.error('Firebase Sync Error:', error);
    return { success: false, error };
  }
}

/**
 * Loads user state from Firebase Firestore document users/{userId}.
 */
export async function loadStateFromFirebase(userId: string): Promise<Partial<GameState> | null> {
  if (!isFirebaseConfigured() || typeof window === 'undefined') {
    return null;
  }

  try {
    const { initializeApp, getApps } = await import('firebase/app');
    const { getFirestore, doc, getDoc } = await import('firebase/firestore');

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

    const docSnap = await getDoc(doc(db, 'users', userId));
    if (docSnap.exists()) {
      return docSnap.data() as Partial<GameState>;
    }
    return null;
  } catch (error) {
    console.warn('Firebase Load Error:', error);
    return null;
  }
}
