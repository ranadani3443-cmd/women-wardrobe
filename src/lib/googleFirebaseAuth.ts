import { initializeApp, getApps } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';

const GOOGLE_AUTH_APP_NAME = 'womenwardrobe-google-sheets-auth';

interface GoogleFirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  configured?: boolean;
  source?: string;
  message?: string;
}

let authPromise: Promise<Auth> | null = null;

async function loadGoogleFirebaseConfig(): Promise<GoogleFirebaseConfig> {
  const response = await fetch('/api/google-auth-config', {
    method: 'GET',
    cache: 'no-store',
    headers: { Accept: 'application/json' },
  });

  let config: GoogleFirebaseConfig | null = null;
  try {
    config = await response.json();
  } catch {
    // handled below
  }

  if (!response.ok || !config?.apiKey) {
    throw new Error(
      config?.message ||
      'Google authentication is not configured yet. Add FIREBASE_WEB_API_KEY in Hostinger Environment variables and redeploy.'
    );
  }

  return config;
}

export async function getGoogleSheetsAuth(): Promise<Auth> {
  if (!authPromise) {
    authPromise = (async () => {
      const config = await loadGoogleFirebaseConfig();
      const existing = getApps().find((app) => app.name === GOOGLE_AUTH_APP_NAME);
      const app = existing || initializeApp(
        {
          apiKey: config.apiKey,
          authDomain: config.authDomain || 'womenwardrobe-71b06.firebaseapp.com',
          projectId: config.projectId || 'womenwardrobe-71b06',
          storageBucket: config.storageBucket,
          messagingSenderId: config.messagingSenderId,
          appId: config.appId,
        },
        GOOGLE_AUTH_APP_NAME
      );
      return getAuth(app);
    })().catch((error) => {
      authPromise = null;
      throw error;
    });
  }

  return authPromise;
}
