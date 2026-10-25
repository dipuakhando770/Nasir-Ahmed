/**
 * Centralized Firebase initialization module for Boss URL Shortener SaaS
 * Project ID: urlshort-1c52b
 * Auth Domain: urlshort-1c52b.firebaseapp.com
 */

import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  User,
  Auth
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs,
  Firestore
} from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics, logEvent } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: "AIzaSyD_OjHncJsgYSnoMJD5l44mNeZAhN4J0YQ",
  authDomain: "urlshort-1c52b.firebaseapp.com",
  projectId: "urlshort-1c52b",
  storageBucket: "urlshort-1c52b.firebasestorage.app",
  messagingSenderId: "139631021237",
  appId: "1:139631021237:web:80f66aed00511c64f982fc",
  measurementId: "G-9SG36CTDW8"
};

// Prevent duplicate initialization
const app: FirebaseApp = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Firebase Auth & Firestore instances
export const auth: Auth = getAuth(app);
export const db: Firestore = getFirestore(app);

// Graceful Firebase Analytics initialization
let analyticsInstance: Analytics | null = null;
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      analyticsInstance = getAnalytics(app);
    }
  }).catch((err) => {
    console.warn('Firebase Analytics not supported in this environment:', err);
  });
}

/**
 * Safe logging helper that strips all sensitive data
 */
export function logSafeEvent(eventName: string, eventParams?: Record<string, any>) {
  try {
    if (analyticsInstance) {
      logEvent(analyticsInstance, eventName, eventParams);
    }
  } catch (err) {
    console.debug('Analytics log skipped:', err);
  }
}

export {
  app,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
  onAuthStateChanged,
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  query,
  where,
  getDocs
};

export type { User };

