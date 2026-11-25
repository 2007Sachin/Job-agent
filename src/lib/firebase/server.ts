import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

export function firebaseAdminConfigured() {
  return Boolean(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}

function adminApp(): App | null {
  if (!firebaseAdminConfigured()) return null;
  if (getApps().length) return getApps()[0]!;
  return initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, "\n"),
    }),
  });
}

export function adminDb() {
  const app = adminApp();
  return app ? getFirestore(app) : null;
}

export function adminAuth() {
  const app = adminApp();
  return app ? getAuth(app) : null;
}

export async function userFromAuthHeader(request: Request) {
  const header = request.headers.get("authorization");
  const bearer = header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : "";
  const cookie = request.headers.get("cookie") ?? "";
  const fromCookie = cookie.match(/(?:^|;\s*)ja_id_token=([^;]+)/);
  const token = bearer || (fromCookie ? decodeURIComponent(fromCookie[1]) : "");
  const auth = adminAuth();
  if (!auth || !token) return null;
  try {
    const user = await auth.verifyIdToken(token);
    return { user: { id: user.uid, email: user.email ?? "" } };
  } catch {
    return null;
  }
}
