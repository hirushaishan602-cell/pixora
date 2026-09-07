import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required server environment variable: ${name}`);
  return value;
}

/**
 * Firebase Admin is initialized lazily.
 *
 * Next.js evaluates route modules while collecting page data during `next build`.
 * Initializing Firebase Admin at module-import time makes the build require
 * production secrets, which causes errors such as:
 * "Missing required server environment variable: pixora-ad6a8".
 *
 * Keeping initialization behind these getters means the secrets are required
 * only when a server route actually handles a request.
 */
function getAdminApp(): App {
  const existing = getApps()[0];
  if (existing) return existing;

  const projectId = getRequiredEnv("FIREBASE_ADMIN_PROJECT_ID");
  const clientEmail = getRequiredEnv("FIREBASE_ADMIN_CLIENT_EMAIL");
  const privateKey = getRequiredEnv("FIREBASE_ADMIN_PRIVATE_KEY").replace(/\\n/g, "\n");

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export function getAdminAuth(): Auth {
  return getAuth(getAdminApp());
}

export function getAdminDb(): Firestore {
  return getFirestore(getAdminApp());
}
