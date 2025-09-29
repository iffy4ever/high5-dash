import { initializeApp, getApps } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
};

// Avoid double-init in Vite HMR
const createApp = (name, config) => {
  const existingApp = getApps().find(app => app.name === name);
  return existingApp || initializeApp(config, name);
};

// HIGH5 Firebase app and services
export const appHigh5 = createApp("high5-app", firebaseConfig);
export const authHigh5 = getAuth(appHigh5);
export const dbHigh5 = getFirestore(appHigh5);
export const storageHigh5 = getStorage(appHigh5);

// PD & KAIIA Firebase app and services
export const appPdKaiia = createApp("pd-kaiia-app", firebaseConfig);
export const authPdKaiia = getAuth(appPdKaiia);
export const dbPdKaiia = getFirestore(appPdKaiia);
export const storagePdKaiia = getStorage(appPdKaiia);

// Default export for backward compatibility
export default appHigh5;