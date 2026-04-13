import { initializeApp, getApps, cert, type App, type ServiceAccount } from "firebase-admin/app";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

let _adminDb: Firestore | null = null;

function getAdminApp(): App {
  if (getApps().length) {
    return getApps()[0];
  }

  const serviceAccount: ServiceAccount = {
    projectId: process.env.FIREBASE_ADMIN_PROJECT_ID,
    clientEmail: process.env.FIREBASE_ADMIN_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  };

  return initializeApp({
    credential: cert(serviceAccount),
  });
}

export function getAdminDb(): Firestore {
  if (!_adminDb) {
    getAdminApp();
    _adminDb = getFirestore();
  }
  return _adminDb;
}
