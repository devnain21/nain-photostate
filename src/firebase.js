import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyA3fth4Y9LEKoWlngBD4h8xqf7MZPUDS5I",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "nain-vault.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "nain-vault",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "nain-vault.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "827999091522",
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:827999091522:web:d877d8f0b07d3eb83d66db",
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL || "https://nain-vault-default-rtdb.firebaseio.com/"
};

const ADMIN_APP_NAME = 'jobs-admin-app'

const adminFirebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_API_KEY || '',
  authDomain: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_AUTH_DOMAIN || '',
  projectId: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_PROJECT_ID || '',
  storageBucket: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_APP_ID || '',
  databaseURL: process.env.NEXT_PUBLIC_JOBS_ADMIN_FIREBASE_DATABASE_URL || '',
}

export const hasAdminBackendConfig = [
  adminFirebaseConfig.apiKey,
  adminFirebaseConfig.authDomain,
  adminFirebaseConfig.projectId,
  adminFirebaseConfig.messagingSenderId,
  adminFirebaseConfig.appId,
  adminFirebaseConfig.databaseURL,
].every(Boolean)

const PUBLIC_APP_NAME = 'public-clicks-app'

const app = getApps().length ? getApp() : initializeApp(firebaseConfig)
const publicApp = getApps().some((existingApp) => existingApp.name === PUBLIC_APP_NAME)
  ? getApp(PUBLIC_APP_NAME)
  : initializeApp(firebaseConfig, PUBLIC_APP_NAME)
const adminApp = hasAdminBackendConfig
  ? (getApps().some((existingApp) => existingApp.name === ADMIN_APP_NAME)
      ? getApp(ADMIN_APP_NAME)
      : initializeApp(adminFirebaseConfig, ADMIN_APP_NAME))
  : null

export const auth = getAuth(app);
export const db = getDatabase(app);
export const publicAuth = getAuth(publicApp);
export const publicDb = getDatabase(publicApp);
export const adminAuth = adminApp ? getAuth(adminApp) : null
export const adminDb = adminApp ? getDatabase(adminApp) : null

if (adminAuth && process.env.NEXT_PUBLIC_JOBS_ADMIN_TENANT_ID) {
  adminAuth.tenantId = process.env.NEXT_PUBLIC_JOBS_ADMIN_TENANT_ID
}