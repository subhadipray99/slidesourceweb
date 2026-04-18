import Razorpay from "razorpay";
import { NextRequest } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const { uid, amount, currency } = await request.json();

    if (!uid) {
      return Response.json({ error: "Missing uid" }, { status: 400 });
    }

    if (!amount || !currency) {
      return Response.json({ error: "Missing amount or currency" }, { status: 400 });
    }

    const razorpay = new Razorpay({
      key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    const order = await razorpay.orders.create({
      amount: amount, // Amount in smallest subunit (paise/cents)
      currency: currency,
      notes: {
        uid,
      },
    });

    return Response.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
    });
  } catch (error) {
    console.error("Order creation error:", error);
    return Response.json(
      { error: "Failed to create order" },
      { status: 500 }
    );
  }
}
