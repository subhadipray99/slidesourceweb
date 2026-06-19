import { NextRequest, NextResponse } from "next/server";
import { getAdminDb } from "@/lib/firebase-admin";
import { verifyUser } from "@/lib/auth-utils";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const authUser = await verifyUser(request);
    if (!authUser || !authUser.isAdmin) {
      return NextResponse.json({ error: "Forbidden: Admin privileges required" }, { status: 403 });
    }

    const body = await request.json();
    const { code } = body;

    if (!code || typeof code !== "string") {
      return NextResponse.json({ error: "Redeem code is required" }, { status: 400 });
    }

    const db = getAdminDb();
    const codeRef = db.collection("redeemCodes").doc(code.toUpperCase().trim());
    
    const codeDoc = await codeRef.get();
    if (!codeDoc.exists) {
      return NextResponse.json({ error: "Redeem code not found" }, { status: 404 });
    }

    await codeRef.delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Revoke redeem code error:", error);
    return NextResponse.json({ error: "Failed to revoke redeem code" }, { status: 500 });
  }
}
