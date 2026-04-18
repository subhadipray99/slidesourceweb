"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RazorpayButton from "@/components/RazorpayButton";
import styles from "./page.module.css";

const TRIAL_DURATION_MS = 86400000; // 24 hours

function formatCountdown(ms: number): string {
  if (ms <= 0) return "00:00:00";
  const totalSeconds = Math.floor(ms / 1000);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);
  const s = totalSeconds % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export default function DashboardPage() {
  const { user, isPro, trialStartedAt, proExpiresAt, loading, logout, refreshProStatus } = useAuth();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">("USD");

  // Pricing configuration
  const prices = {
    USD: { amount: 100, symbol: "$", value: "1" },
    INR: { amount: 1900, symbol: "₹", value: "19" },
  };

  const currentPrice = prices[selectedCurrency];

  // Format expiration date
  const expirationDate = proExpiresAt ? new Date(proExpiresAt).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }) : '';

  // Compute trial state
  const trialActive =
    !isPro && trialStartedAt !== null && Date.now() - trialStartedAt < TRIAL_DURATION_MS;
  const trialExpired =
    !isPro && trialStartedAt !== null && Date.now() - trialStartedAt >= TRIAL_DURATION_MS;

  const computeTimeLeft = useCallback(() => {
    if (!trialStartedAt) return 0;
    return Math.max(0, trialStartedAt + TRIAL_DURATION_MS - Date.now());
  }, [trialStartedAt]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Live countdown
  useEffect(() => {
    if (!trialActive) return;
    setTimeLeft(computeTimeLeft());
    const interval = setInterval(() => {
      const left = computeTimeLeft();
      setTimeLeft(left);
      if (left <= 0) clearInterval(interval);
    }, 1000);
    return () => clearInterval(interval);
  }, [trialActive, computeTimeLeft]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#06060E]">
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden grid-pattern">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />
      <div className="orb orb-3" />

      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-sm">
            S
          </div>
          <span className="text-lg font-bold tracking-tight">SlideSource</span>
        </div>

        <div className="flex items-center gap-4">
          <span className="hidden sm:inline text-sm text-[#8A8F98] truncate max-w-[200px]">
            {user.email}
          </span>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-[#8A8F98] hover:text-white transition-colors px-4 py-2 rounded-xl border border-white/[0.06] hover:border-white/[0.12] hover:bg-white/[0.03]"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            Log Out
          </button>
        </div>
      </header>

      {/* Trial banner */}
      {trialActive && (
        <div className={styles.trialBanner}>
          <span className={styles.trialBannerIcon}>⏳</span>
          <div>
            <span className={styles.trialBannerText}>
              You are on your 24-hour free trial!
            </span>
            <span className={styles.trialBannerSub}>
              {" "}Upgrade before it expires.
            </span>
          </div>
          <div className={styles.trialCountdown}>
            {formatCountdown(timeLeft)}
          </div>
        </div>
      )}

      {trialExpired && !isPro && (
        <div className={styles.expiredBanner}>
          <span>🔒</span>
          <span>Your free trial has expired. Upgrade to continue using all Pro features.</span>
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 max-w-5xl mx-auto px-6 py-12">
        {/* Status Card */}
        <div className="glass-card-strong p-8 mb-10 opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <p className="text-sm text-[#8A8F98] mb-1">Your Plan</p>
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-bold">
                  {isPro ? (
                    <span className="gradient-text-static">SlideSource Pro</span>
                  ) : trialActive ? (
                    <span>Free Trial</span>
                  ) : (
                    "Free Plan"
                  )}
                </h2>
                <span
                  className={`${styles.badge} ${
                    isPro ? styles.badgePro : trialActive ? styles.badgeTrial : styles.badgeFree
                  }`}
                >
                  {isPro ? "✦ PRO" : trialActive ? "⏳ TRIAL" : "FREE"}
                </span>
              </div>
            </div>
            {isPro && (
              <div className="flex items-center gap-2 text-[#22C55E] text-sm">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
                All features unlocked
              </div>
            )}
          </div>
        </div>

        {isPro ? (
          /* Pro celebration card */
          <div className={`${styles.proCard} glass-card p-10 text-center opacity-0 animate-[fade-in-up_0.6s_ease-out_0.2s_forwards]`}>
            <div className={styles.proIconWrapper}>
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6C63FF" />
                    <stop offset="100%" stopColor="#00D4AA" />
                  </linearGradient>
                </defs>
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold mt-6 mb-3">
              You&apos;re a <span className="gradient-text-static">Pro</span>!
            </h3>
            <p className="text-[#8A8F98] max-w-md mx-auto leading-relaxed mb-6">
              You have full access to all SlideSource features. Enjoy mirror mode, camera overlay,
              custom speed controls, and a watermark-free experience on your Android device.
            </p>
            {proExpiresAt && (
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.06] text-sm text-[#8A8F98]">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Pro access expires on: <span className="text-white font-medium ml-1">{expirationDate}</span>
              </div>
            )}
          </div>
        ) : (
          /* Pricing section for free/trial/expired users */
          <>
            <h3 className="text-2xl font-bold mb-2 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.15s_forwards]">
              Upgrade to <span className="gradient-text-static">Pro</span>
            </h3>
            <p className="text-[#8A8F98] mb-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.25s_forwards]">
              {trialExpired
                ? "Your trial has ended. Get 30 days of full access with a simple monthly payment."
                : "Unlock every feature. Monthly subscription for unlimited creativity."}
            </p>

            {/* Feature comparison */}
            <div className="glass-card overflow-hidden mb-10 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.35s_forwards]">
              <table className={styles.pricingTable}>
                <thead>
                  <tr>
                    <th className="text-left">Feature</th>
                    <th>Free</th>
                    <th>
                      <span className="gradient-text-static font-bold">Pro</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Basic Teleprompter", true, true],
                    ["Custom Speed Control", false, true],
                    ["Mirror Mode", false, true],
                    ["Camera Overlay", false, true],
                    ["No Watermark", false, true],
                    ["Priority Support", false, true],
                  ].map(([feature, free, pro]) => (
                    <tr key={String(feature)}>
                      <td>{feature}</td>
                      <td>
                        <span className={free ? styles.checkIcon : styles.crossIcon}>
                          {free ? "✓" : "✗"}
                        </span>
                      </td>
                      <td>
                        <span className={pro ? styles.checkIcon : styles.crossIcon}>
                          {pro ? "✓" : "✗"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Price Card */}
            <div
              className={`${styles.priceCard} ${trialExpired ? styles.priceCardUrgent : ""} glass-card-strong p-8 text-center opacity-0 animate-[fade-in-up_0.6s_ease-out_0.45s_forwards]`}
            >
              {trialExpired && (
                <p className={styles.urgentLabel}>⚠️ Trial Expired — Upgrade Now</p>
              )}
              
              <div className={styles.currencySwitcher}>
                <button
                  onClick={() => setSelectedCurrency("USD")}
                  className={`${styles.currencyBtn} ${selectedCurrency === "USD" ? styles.currencyBtnActive : ""}`}
                >
                  USD
                </button>
                <button
                  onClick={() => setSelectedCurrency("INR")}
                  className={`${styles.currencyBtn} ${selectedCurrency === "INR" ? styles.currencyBtnActive : ""}`}
                >
                  INR
                </button>
              </div>

              <p className="text-sm text-[#8A8F98] mb-1 uppercase tracking-wider font-medium">Monthly Subscription</p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold gradient-text-static">
                  {currentPrice.symbol}{currentPrice.value}
                </span>
                <span className="text-[#5A5F6B] text-lg">/month</span>
              </div>
              <p className="text-sm text-[#5A5F6B] mb-8">Full access to all features for 30 days.</p>

              <RazorpayButton
                uid={user.uid}
                email={user.email || ""}
                amount={currentPrice.amount}
                currency={selectedCurrency}
                onSuccess={() => refreshProStatus()}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
