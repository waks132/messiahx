
// src/lib/firebase.ts
import { initializeApp, getApp, getApps } from "firebase/app";
import { getRemoteConfig, fetchAndActivate, getString } from "firebase/remote-config";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
let app;
let remoteConfigInstance;

if (!firebaseConfig.projectId || !firebaseConfig.appId || !firebaseConfig.apiKey) {
  console.error(
    "Firebase initialization error: Missing critical configuration values. " +
    "Please ensure NEXT_PUBLIC_FIREBASE_PROJECT_ID, NEXT_PUBLIC_FIREBASE_APP_ID, and NEXT_PUBLIC_FIREBASE_API_KEY " +
    "are set in your .env file."
  );
  // To prevent further errors, we can assign null or a dummy object to remoteConfigInstance
  // or throw an error if Firebase is absolutely critical for the app to start.
  // For now, we'll let it proceed but Remote Config will likely fail.
} else {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }

  remoteConfigInstance = getRemoteConfig(app);
  // Configure minimum fetch interval for development (e.g., 10 seconds)
  // For production, use a higher value or rely on the default (12 hours).
  if (process.env.NODE_ENV === 'development') {
    remoteConfigInstance.settings.minimumFetchIntervalMillis = 10000; // 10 seconds
  } else {
    remoteConfigInstance.settings.minimumFetchIntervalMillis = 3600000; // 1 hour
  }

  // Set default values (optional, but good practice)
  remoteConfigInstance.defaultConfig = {
    // Example:
    // "reformulation_neutral_system_prompt": "Default neutral system prompt...",
    // "research_contextual_prompt_template": "Default contextual research prompt..."
  };
}

// Export remoteConfigInstance safely
export const remoteConfig = remoteConfigInstance;
export { app, fetchAndActivate, getString };
