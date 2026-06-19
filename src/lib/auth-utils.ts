import { getAuth } from "firebase-admin/auth";
import { getAdminDb } from "./firebase-admin";

export interface AuthenticatedUser {
  uid: string;
  email?: string;
  isAdmin: boolean;
}

export async function verifyUser(request: Request): Promise<AuthenticatedUser | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    // getAdminDb ensures firebase-admin app is initialized
    const db = getAdminDb();
    
    const decodedToken = await getAuth().verifyIdToken(token);
    const uid = decodedToken.uid;
    const email = decodedToken.email;

    // Check if user is admin (hardcoded check or read from Firestore)
    let isAdmin = email === "shuvodipray99@gmail.com";
    if (!isAdmin) {
      const userDoc = await db.collection("users").doc(uid).get();
      if (userDoc.exists) {
        isAdmin = userDoc.data()?.isAdmin === true;
      }
    }

    return { uid, email, isAdmin };
  } catch (error) {
    console.error("Token verification failed:", error);
    return null;
  }
}
