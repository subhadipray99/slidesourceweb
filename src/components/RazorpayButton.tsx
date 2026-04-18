"use client";

import { useState, useCallback } from "react";

interface RazorpayButtonProps {
  uid: string;
  email: string;
  amount: number;
  currency: string;
  onSuccess: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => RazorpayInstance;
  }
}

interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id: string;
  prefill: { email: string };
  notes: { uid: string };
  theme: { color: string };
  handler: (response: RazorpayResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
}

interface RazorpayResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]')) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function RazorpayButton({ uid, email, amount, currency, onSuccess }: RazorpayButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");

  const handlePayment = useCallback(async () => {
    setIsProcessing(true);
    setStatus("idle");

    try {
      // Load Razorpay script
      const loaded = await loadRazorpayScript();
      if (!loaded) {
        throw new Error("Failed to load Razorpay SDK");
      }

      // Create order
      const res = await fetch("/api/razorpay/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ uid, amount, currency }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const { orderId, amount: resAmount, currency: resCurrency } = await res.json();

      // Open Razorpay checkout
      const options: RazorpayOptions = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: resAmount,
        currency: resCurrency,
        name: "SlideSource",
        description: "SlideSource Pro — Monthly Access",
        order_id: orderId,
        prefill: { email },
        notes: { uid },
        theme: { color: "#6C63FF" },
        handler: () => {
          setStatus("success");
          // Give webhook a moment to process, then refresh
          setTimeout(() => {
            onSuccess();
          }, 3000);
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
          },
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (error) {
      console.error("Payment error:", error);
      setStatus("error");
      setIsProcessing(false);
    }
  }, [uid, email, amount, currency, onSuccess]);

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-14 h-14 rounded-full bg-[#22C55E]/10 flex items-center justify-center">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="text-[#22C55E] font-semibold">Payment Successful!</p>
        <p className="text-sm text-[#8A8F98]">Activating Pro... Please wait.</p>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex flex-col items-center gap-3">
        <button
          onClick={() => {
            setStatus("idle");
            handlePayment();
          }}
          className="btn-primary !px-10 !py-4 !text-base !rounded-2xl"
        >
          Retry Payment
        </button>
        <p className="text-sm text-[#EF4444]">Something went wrong. Please try again.</p>
      </div>
    );
  }

  const currencySymbol = currency === "USD" ? "$" : "₹";
  const displayAmount = currency === "USD" ? amount / 100 : amount / 100;

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className={`btn-primary !w-full !py-4 !text-xs !rounded-lg ${isProcessing ? "opacity-60 pointer-events-none" : ""}`}
    >
      {isProcessing ? (
        <span className="flex items-center gap-2">
          <span className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
          AUTHENTICATING...
        </span>
      ) : (
        <>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          UPGRADE FOR {currencySymbol}{displayAmount} / MONTH
        </>
      )}
    </button>
  );
}
