"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RazorpayButton from "@/components/RazorpayButton";
import styles from "./page.module.css";

export default function DashboardPage() {
  const { user, isPro, loading, logout, refreshProStatus } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

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
                  ) : (
                    "Free Plan"
                  )}
                </h2>
                <span
                  className={`${styles.badge} ${
                    isPro ? styles.badgePro : styles.badgeFree
                  }`}
                >
                  {isPro ? "✦ PRO" : "FREE"}
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
            <p className="text-[#8A8F98] max-w-md mx-auto leading-relaxed">
              You have full access to all SlideSource features. Enjoy mirror mode, camera overlay,
              custom speed controls, and a watermark-free experience on your Android device.
            </p>
          </div>
        ) : (
          /* Pricing section for free users */
          <>
            <h3 className="text-2xl font-bold mb-2 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.15s_forwards]">
              Upgrade to <span className="gradient-text-static">Pro</span>
            </h3>
            <p className="text-[#8A8F98] mb-8 opacity-0 animate-[fade-in-up_0.6s_ease-out_0.25s_forwards]">
              Unlock every feature with a one-time payment. No subscriptions.
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
                  <tr>
                    <td>Basic Teleprompter</td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Custom Speed Control</td>
                    <td>
                      <span className={styles.crossIcon}>✗</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Mirror Mode</td>
                    <td>
                      <span className={styles.crossIcon}>✗</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Camera Overlay</td>
                    <td>
                      <span className={styles.crossIcon}>✗</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td>No Watermark</td>
                    <td>
                      <span className={styles.crossIcon}>✗</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                  <tr>
                    <td>Priority Support</td>
                    <td>
                      <span className={styles.crossIcon}>✗</span>
                    </td>
                    <td>
                      <span className={styles.checkIcon}>✓</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Price Card */}
            <div className={`${styles.priceCard} glass-card-strong p-8 text-center opacity-0 animate-[fade-in-up_0.6s_ease-out_0.45s_forwards]`}>
              <p className="text-sm text-[#8A8F98] mb-1 uppercase tracking-wider font-medium">One-time payment</p>
              <div className="flex items-baseline justify-center gap-1 mb-2">
                <span className="text-5xl font-extrabold gradient-text-static">₹299</span>
              </div>
              <p className="text-sm text-[#5A5F6B] mb-8">Pay once, own forever. No subscriptions.</p>

              <RazorpayButton
                uid={user.uid}
                email={user.email || ""}
                onSuccess={() => refreshProStatus()}
              />
            </div>
          </>
        )}
      </main>
    </div>
  );
}
