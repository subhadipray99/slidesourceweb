import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyUser } from "@/lib/auth-utils";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyUser(request);
    if (!authUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uid, email } = authUser;
    const body = await request.json();
    const rawCode = body?.code;

    if (!rawCode || typeof rawCode !== "string") {
      return NextResponse.json({ error: "Redeem code is required" }, { status: 400 });
    }

    const code = rawCode.trim().toUpperCase();
    if (code.length === 0) {
      return NextResponse.json({ error: "Redeem code cannot be empty" }, { status: 400 });
    }

    const db = getAdminDb();
    const codeRef = db.collection("redeemCodes").doc(code);
    const userRef = db.collection("users").doc(uid);

    let resultError: string | null = null;
    let newExpiresAt = 0;
    let durationDays = 0;

    await db.runTransaction(async (transaction) => {
      // 1. Fetch code document
      const codeDoc = await transaction.get(codeRef);
      if (!codeDoc.exists) {
        resultError = "Invalid redeem code";
        return;
      }

      const codeData = codeDoc.data();
      if (!codeData) {
        resultError = "Invalid redeem code";
        return;
      }

      durationDays = codeData.durationDays || 30;
      const expiresAt = codeData.expiresAt;
      const maxRedemptions = codeData.maxRedemptions || 1;
      const redemptionCount = codeData.redemptionCount || 0;
      const redeemedUids = codeData.redeemedUids || [];

      // 2. Perform validations
      if (expiresAt && Date.now() > expiresAt) {
        resultError = "This code has expired";
        return;
      }

      if (redemptionCount >= maxRedemptions) {
        resultError = "This code has reached its maximum redemptions limit";
        return;
      }

      if (redeemedUids.includes(uid)) {
        resultError = "You have already redeemed this code";
        return;
      }

      // 3. Fetch user document to compute base duration
      const userDoc = await transaction.get(userRef);
      let baseTime = Date.now();

      if (userDoc.exists) {
        const userData = userDoc.data();
        // If user is pro and has a future expiration date, stack the duration
        if (userData?.isPro === true && userData?.proExpiresAt && userData.proExpiresAt > Date.now()) {
          baseTime = userData.proExpiresAt;
        }
      }

      const durationMs = durationDays * 24 * 60 * 60 * 1000;
      newExpiresAt = baseTime + durationMs;

      // 4. Update documents in transaction
      transaction.update(codeRef, {
        redemptionCount: FieldValue.increment(1),
        redeemedUids: FieldValue.arrayUnion(uid),
        redemptions: FieldValue.arrayUnion({
          uid,
          email: email || null,
          redeemedAt: Date.now(),
        }),
      });

      transaction.set(
        userRef,
        {
          isPro: true,
          proExpiresAt: newExpiresAt,
          upgradedAt: FieldValue.serverTimestamp(),
        },
        { merge: true }
      );
    });

    if (resultError) {
      return NextResponse.json({ error: resultError }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      newExpiresAt,
      durationDays,
    });
  } catch (error) {
    console.error("Redeem code error:", error);
    return NextResponse.json({ error: "Failed to redeem code" }, { status: 500 });
  }
}
