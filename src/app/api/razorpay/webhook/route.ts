import { NextRequest } from "next/server";
import crypto from "crypto";
import { getAdminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get("x-razorpay-signature");

    if (!signature) {
      return Response.json({ error: "Missing signature" }, { status: 400 });
    }

    // Verify webhook signature with HMAC-SHA256
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
      .update(body)
      .digest("hex");

    if (signature !== expectedSignature) {
      console.error("Webhook signature mismatch");
      return Response.json({ error: "Invalid signature" }, { status: 400 });
    }

    const event = JSON.parse(body);

    // Handle payment.captured event
    if (event.event === "payment.captured") {
      const payment = event.payload?.payment?.entity;
      const uid = payment?.notes?.uid;

      if (!uid) {
        console.error("No uid found in payment notes");
        return Response.json({ error: "Missing uid in notes" }, { status: 400 });
      }

      // Update user document in Firestore
      const adminDb = getAdminDb();
      const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
      const proExpiresAt = Date.now() + thirtyDaysInMs;

      await adminDb.collection("users").doc(uid).set(
        {
          isPro: true,
          upgradedAt: FieldValue.serverTimestamp(),
          proExpiresAt: proExpiresAt,
          razorpayPaymentId: payment.id,
          razorpayOrderId: payment.order_id,
        },
        { merge: true }
      );

      console.log(`✅ User ${uid} upgraded to Pro`);
    }

    return Response.json({ status: "ok" }, { status: 200 });
  } catch (error) {
    console.error("Webhook processing error:", error);
    return Response.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}
