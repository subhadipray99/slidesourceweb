import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyUser } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

function generateRandomCode(): string {
  // Exclude confusing characters like I, O, 0, 1, etc.
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await verifyUser(request);
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const db = getAdminDb();
    const snapshot = await db.collection("redeemCodes").orderBy("createdAt", "desc").get();
    const codes = snapshot.docs.map((doc) => doc.data());

    return NextResponse.json({ codes });
  } catch (error) {
    console.error("Fetch redeem codes error:", error);
    return NextResponse.json({ error: "Failed to fetch redeem codes" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyUser(request);
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const { codeName, durationDays, expiresAtDate, maxRedemptions } = body;

    // Validate durationDays
    const days = parseInt(durationDays, 10);
    if (isNaN(days) || days <= 0) {
      return NextResponse.json({ error: "Duration must be a positive number of days" }, { status: 400 });
    }

    // Validate maxRedemptions
    const maxReds = parseInt(maxRedemptions, 10);
    if (isNaN(maxReds) || maxReds <= 0) {
      return NextResponse.json({ error: "Max redemptions must be at least 1" }, { status: 400 });
    }

    // Validate expiresAtDate
    if (!expiresAtDate) {
      return NextResponse.json({ error: "Code expiry date is required" }, { status: 400 });
    }
    const expiryTime = new Date(expiresAtDate).getTime();
    if (isNaN(expiryTime) || expiryTime <= Date.now()) {
      return NextResponse.json({ error: "Expiry date must be a valid future date" }, { status: 400 });
    }

    const db = getAdminDb();
    let code = "";

    if (codeName && typeof codeName === "string") {
      // Custom Code Name
      code = codeName.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, "");
      if (code.length < 3) {
        return NextResponse.json({ error: "Custom code must be at least 3 characters" }, { status: 400 });
      }

      // Check if custom code already exists
      const existing = await db.collection("redeemCodes").doc(code).get();
      if (existing.exists) {
        return NextResponse.json({ error: "This redeem code name is already taken" }, { status: 400 });
      }
    } else {
      // Generated Code Name
      let attempts = 0;
      let foundUnique = false;
      while (attempts < 5 && !foundUnique) {
        code = generateRandomCode();
        const checkDoc = await db.collection("redeemCodes").doc(code).get();
        if (!checkDoc.exists) {
          foundUnique = true;
        }
        attempts++;
      }

      if (!foundUnique) {
        return NextResponse.json({ error: "Failed to generate a unique code. Try again." }, { status: 500 });
      }
    }

    const newCodeDoc = {
      code,
      durationDays: days,
      expiresAt: expiryTime,
      maxRedemptions: maxReds,
      redemptionCount: 0,
      redeemedUids: [],
      redemptions: [],
      createdAt: Date.now(),
    };

    await db.collection("redeemCodes").doc(code).set(newCodeDoc);

    return NextResponse.json({ success: true, code: newCodeDoc }, { status: 201 });
  } catch (error) {
    console.error("Create redeem code error:", error);
    return NextResponse.json({ error: "Failed to create redeem code" }, { status: 500 });
  }
}
