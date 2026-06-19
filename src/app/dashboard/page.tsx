"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import RazorpayButton from "@/components/RazorpayButton";
import styles from "./page.module.css";
import { auth } from "@/lib/firebase";

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
  const { user, isPro, isAdmin, trialStartedAt, proExpiresAt, loading, logout, refreshProStatus } = useAuth();
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [selectedCurrency, setSelectedCurrency] = useState<"USD" | "INR">("USD");
  const [activeTab, setActiveTab] = useState<"subscription" | "account" | "admin">("subscription");

  // Redeem code states
  const [redeemCode, setRedeemCode] = useState("");
  const [redeeming, setRedeeming] = useState(false);
  const [redeemStatus, setRedeemStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Admin codes management states
  const [adminCodes, setAdminCodes] = useState<any[]>([]);
  const [codesLoading, setCodesLoading] = useState(false);
  const [codeName, setCodeName] = useState("");
  const [durationDays, setDurationDays] = useState("30");
  const [maxRedemptions, setMaxRedemptions] = useState("1");
  const [expiresAtDate, setExpiresAtDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30); // Default to 30 days from today
    return d.toISOString().split("T")[0];
  });
  const [creatingCode, setCreatingCode] = useState(false);
  const [createStatus, setCreateStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [expandedCode, setExpandedCode] = useState<string | null>(null);

  const fetchCodes = useCallback(async () => {
    if (!user || !isAdmin) return;
    setCodesLoading(true);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/codes", {
        headers: {
          Authorization: `Bearer ${idToken}`,
        },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminCodes(data.codes || []);
      }
    } catch (err) {
      console.error("Error fetching codes:", err);
    } finally {
      setCodesLoading(false);
    }
  }, [user, isAdmin]);

  useEffect(() => {
    if (activeTab === "admin" && isAdmin) {
      fetchCodes();
    }
  }, [activeTab, isAdmin, fetchCodes]);

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!redeemCode.trim()) return;
    setRedeeming(true);
    setRedeemStatus(null);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/redeem", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code: redeemCode }),
      });
      const data = await res.json();
      if (res.ok) {
        setRedeemStatus({
          type: "success",
          message: `Successfully redeemed! Pro activated for ${data.durationDays} days.`,
        });
        setRedeemCode("");
        await refreshProStatus();
      } else {
        setRedeemStatus({
          type: "error",
          message: data.error || "Failed to redeem code.",
        });
      }
    } catch (err) {
      console.error(err);
      setRedeemStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setRedeeming(false);
    }
  };

  const handleCreateCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCode(true);
    setCreateStatus(null);
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/codes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({
          codeName: codeName.trim() || undefined,
          durationDays,
          maxRedemptions,
          expiresAtDate,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        setCreateStatus({
          type: "success",
          message: `Code created successfully: ${data.code.code}`,
        });
        setCodeName("");
        fetchCodes();
      } else {
        setCreateStatus({
          type: "error",
          message: data.error || "Failed to create code.",
        });
      }
    } catch (err) {
      console.error(err);
      setCreateStatus({ type: "error", message: "An unexpected error occurred." });
    } finally {
      setCreatingCode(false);
    }
  };

  const handleRevokeCode = async (codeToRevoke: string) => {
    if (!confirm(`Are you sure you want to revoke code: ${codeToRevoke}?`)) return;
    try {
      const idToken = await auth?.currentUser?.getIdToken();
      const res = await fetch("/api/admin/codes/revoke", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${idToken}`,
        },
        body: JSON.stringify({ code: codeToRevoke }),
      });
      if (res.ok) {
        fetchCodes();
      } else {
        alert("Failed to revoke code");
      }
    } catch (err) {
      console.error(err);
      alert("Error revoking code");
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className={styles.spinner} />
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="relative min-h-screen overflow-hidden grid-pattern">
      {/* Top bar */}
      <header className="relative z-20 flex items-center justify-between px-4 md:px-12 py-3 md:py-5 border-b border-[#222222] bg-black/50 backdrop-blur-md">
        <div className="flex items-center gap-2 md:gap-4">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-lg bg-[#FFD700] flex items-center justify-center text-black font-black text-lg md:text-xl">
            S
          </div>
          <span className="text-lg md:text-xl font-black tracking-tighter uppercase italic truncate max-w-[120px] sm:max-w-none">SlideSource</span>
        </div>

        <nav className="hidden md:flex items-center gap-1 bg-[#111111] p-1 rounded-xl border border-[#222222]">
          <button
            onClick={() => setActiveTab("subscription")}
            className={`${styles.navItem} ${activeTab === "subscription" ? styles.navItemActive : ""}`}
          >
            My Subscription
          </button>
          <button
            onClick={() => setActiveTab("account")}
            className={`${styles.navItem} ${activeTab === "account" ? styles.navItemActive : ""}`}
          >
            Manage Account
          </button>
          {isAdmin && (
            <button
              onClick={() => setActiveTab("admin")}
              className={`${styles.navItem} ${activeTab === "admin" ? styles.navItemActive : ""}`}
            >
              Admin Panel
            </button>
          )}
        </nav>

        <button
          onClick={logout}
          className="text-xs font-bold text-[#888888] hover:text-[#FFD700] transition-colors tracking-widest"
        >
          LOGOUT
        </button>
      </header>

      {/* Mobile nav */}
      <nav className="md:hidden flex border-b border-[#222222]">
        <button
          onClick={() => setActiveTab("subscription")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest text-center ${activeTab === "subscription" ? "text-[#FFD700] border-b-2 border-[#FFD700]" : "text-[#555555]"}`}
        >
          Subscription
        </button>
        <button
          onClick={() => setActiveTab("account")}
          className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest text-center ${activeTab === "account" ? "text-[#FFD700] border-b-2 border-[#FFD700]" : "text-[#555555]"}`}
        >
          Account
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab("admin")}
            className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest text-center ${activeTab === "admin" ? "text-[#FFD700] border-b-2 border-[#FFD700]" : "text-[#555555]"}`}
          >
            Admin
          </button>
        )}
      </nav>

      {/* Trial banner */}
      {trialActive && (
        <div className={styles.trialBanner}>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FFD700]" />
            <span className="uppercase text-xs font-black tracking-widest">Trial Active</span>
          </div>
          <div className={styles.trialCountdown}>
            {formatCountdown(timeLeft)}
          </div>
        </div>
      )}

      {/* Content */}
      <main className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        {activeTab === "subscription" ? (
          <div className="animate-[fade-in-up_0.4s_ease-out_forwards]">
            {/* Status Section */}
            <div className="mb-12">
              <p className="text-[10px] font-bold text-[#555555] uppercase tracking-[0.2em] mb-3">Membership Status</p>
              <div className="flex items-center gap-4">
                <h2 className="text-4xl font-black uppercase italic italic">
                  {isPro ? "Pro Member" : trialActive ? "Trial Phase" : "Free Tier"}
                </h2>
                {isPro && (
                  <span className="px-3 py-1 bg-[#FFD700] text-black text-[10px] font-black uppercase rounded">Verified</span>
                )}
              </div>
            </div>

            {isPro ? (
              <div className="space-y-6">
                <div className="glass-card-strong p-10 border-l-4 border-l-[#FFD700]">
                  <h3 className="text-2xl font-black mb-4">PREMIUM UNLOCKED</h3>
                  <p className="text-[#888888] leading-relaxed mb-8 max-w-lg">
                    Your account is fully activated. All pro features including 360° Rotation, camera overlay,
                    and custom speeds are now available on your Android device.
                  </p>
                  {proExpiresAt && (
                    <div className="text-xs font-bold text-[#555555] uppercase tracking-widest">
                      Next billing cycle: <span className="text-white ml-2">{expirationDate}</span>
                    </div>
                  )}
                </div>

                {/* Redeem promo section for Pro Users */}
                <div className="glass-card p-6 max-w-lg">
                  <h4 className="text-sm font-black uppercase mb-1">Have a promo or redeem code?</h4>
                  <p className="text-xs text-[#888888] mb-4">Extend your active Pro subscription instantly.</p>
                  <form onSubmit={handleRedeem} className="flex gap-2">
                    <input
                      type="text"
                      placeholder="ENTER REDEEM CODE"
                      value={redeemCode}
                      onChange={(e) => setRedeemCode(e.target.value)}
                      className="input-field font-mono uppercase text-center tracking-widest text-xs"
                      maxLength={20}
                    />
                    <button type="submit" disabled={redeeming} className="btn-primary !py-2.5 !px-5 !text-[10px]">
                      {redeeming ? "REDEEMING..." : "REDEEM"}
                    </button>
                  </form>
                  {redeemStatus && (
                    <p className={`text-xs font-bold mt-3 ${redeemStatus.type === "success" ? "text-[#FFD700]" : "text-[#FF4444]"}`}>
                      {redeemStatus.message}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-xl font-black uppercase mb-6">Pro Privileges</h3>
                  <ul className="space-y-4">
                    {[
                      "Custom Speed Control",
                      "360° Rotation",
                      "Camera Overlay",
                      "No Watermark",
                      "Priority Support"
                    ].map((f) => (
                      <li key={f} className="flex items-center gap-3 text-sm font-medium text-[#888888]">
                        <svg className="w-4 h-4 text-[#FFD700]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="space-y-6">
                  <div className={`glass-card-strong p-8 ${trialExpired ? "border-[#FF4444]" : ""}`}>
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

                    <div className="mb-6">
                      <p className="text-[10px] font-bold text-[#555555] uppercase tracking-[0.2em] mb-1">Standard Plan</p>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-black text-[#FFD700]">{currentPrice.symbol}{currentPrice.value}</span>
                        <span className="text-[#555555] font-bold">/MO</span>
                      </div>
                    </div>

                    <RazorpayButton
                      uid={user.uid}
                      email={user.email || ""}
                      amount={currentPrice.amount}
                      currency={selectedCurrency}
                      onSuccess={() => refreshProStatus()}
                    />
                  </div>

                  {/* Redeem Code section for Free Users */}
                  <div className="glass-card p-6">
                    <h4 className="text-xs font-black uppercase mb-1">Have a redeem code?</h4>
                    <p className="text-[10px] text-[#888888] mb-4">Redeem below to unlock SlideSource Pro instantly.</p>
                    <form onSubmit={handleRedeem} className="flex gap-2">
                      <input
                        type="text"
                        placeholder="ENTER CODE"
                        value={redeemCode}
                        onChange={(e) => setRedeemCode(e.target.value)}
                        className="input-field font-mono uppercase text-center tracking-widest text-xs"
                        maxLength={20}
                      />
                      <button type="submit" disabled={redeeming} className="btn-primary !py-2.5 !px-5 !text-[10px]">
                        {redeeming ? "REDEEMING..." : "REDEEM"}
                      </button>
                    </form>
                    {redeemStatus && (
                      <p className={`text-[10px] font-bold mt-2.5 ${redeemStatus.type === "success" ? "text-[#FFD700]" : "text-[#FF4444]"}`}>
                        {redeemStatus.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : activeTab === "account" ? (
          /* Manage Account Section */
          <div className="animate-[fade-in-up_0.4s_ease-out_forwards]">
            <div className="mb-12">
              <p className="text-[10px] font-bold text-[#555555] uppercase tracking-[0.2em] mb-3">Account Overiew</p>
              <h2 className="text-4xl font-black uppercase italic">Manage Account</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-2 space-y-6">
                <div className="glass-card p-6">
                  <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-4">Login Information</p>
                  <div className="space-y-4">
                    <div>
                      <span className="text-xs text-[#555555] block mb-1">Email Address</span>
                      <span className="text-lg font-bold">{user.email}</span>
                    </div>
                    <div>
                      <span className="text-xs text-[#555555] block mb-1">Internal UID</span>
                      <span className="text-xs font-mono text-[#888888] bg-[#111111] px-2 py-1 rounded select-all">{user.uid}</span>
                    </div>
                  </div>
                </div>

                <div className="glass-card p-6">
                  <p className="text-[10px] font-bold text-[#555555] uppercase tracking-widest mb-4">Status & Billing</p>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center border-b border-[#222222] pb-3">
                      <span className="text-sm font-bold text-[#888888]">Current Plan</span>
                      <span className="text-sm font-black uppercase text-[#FFD700]">{isPro ? "PRO Monthly" : "Free Tier"}</span>
                    </div>
                    {isPro && proExpiresAt && (
                      <div className="flex justify-between items-center border-b border-[#222222] pb-3">
                        <span className="text-sm font-bold text-[#888888]">Renewal Date</span>
                        <span className="text-sm font-bold">{expirationDate}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-[#888888]">Preferred Currency</span>
                      <span className="text-sm font-bold uppercase">{selectedCurrency}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div className="glass-card p-6 bg-[#FFD700]/5 border-[#FFD700]/10">
                  <p className="text-[10px] font-bold text-[#FFD700] uppercase tracking-widest mb-4">Need Help?</p>
                  <p className="text-xs text-[#888888] mb-6">Having issues with your subscription or the Android app?</p>
                  <a
                    href="mailto:shuvodipray99@gmail.com"
                    className="btn-primary w-full !py-3 !text-xs"
                  >
                    Contact Support
                  </a>
                </div>

                <button
                  onClick={logout}
                  className="w-full py-4 text-xs font-black uppercase tracking-[0.2em] border border-[#FF4444] text-[#FF4444] rounded-lg hover:bg-[#FF4444] hover:text-white transition-all"
                >
                  Terminate Session
                </button>
              </div>
            </div>
          </div>
        ) : activeTab === "admin" && isAdmin ? (
          /* Admin Panel Section */
          <div className="animate-[fade-in-up_0.4s_ease-out_forwards] space-y-12">
            <div className="mb-12">
              <p className="text-[10px] font-bold text-[#555555] uppercase tracking-[0.2em] mb-3">Admin Console</p>
              <h2 className="text-4xl font-black uppercase italic">Admin Panel</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Generate Form */}
              <div className="lg:col-span-1 glass-card p-6 h-fit">
                <h3 className="text-lg font-black uppercase mb-4 text-[#FFD700]">Generate Code</h3>
                <form onSubmit={handleCreateCode} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">Custom Code Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. SUMMER30"
                      value={codeName}
                      onChange={(e) => setCodeName(e.target.value)}
                      className="input-field uppercase font-mono tracking-wider"
                    />
                  </div>
                  
                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">Duration</label>
                    <select
                      value={durationDays}
                      onChange={(e) => setDurationDays(e.target.value)}
                      className="input-field"
                    >
                      <option value="7">7 Days</option>
                      <option value="30">30 Days (1 Month)</option>
                      <option value="90">90 Days (3 Months)</option>
                      <option value="365">365 Days (1 Year)</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">Max Redemptions</label>
                    <input
                      type="number"
                      min="1"
                      value={maxRedemptions}
                      onChange={(e) => setMaxRedemptions(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold uppercase text-[#555555] block mb-1">Code Expiration Date</label>
                    <input
                      type="date"
                      value={expiresAtDate}
                      onChange={(e) => setExpiresAtDate(e.target.value)}
                      className="input-field"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={creatingCode}
                    className="btn-primary w-full !py-3 !text-xs !rounded-lg"
                  >
                    {creatingCode ? "GENERATING..." : "GENERATE CODE"}
                  </button>
                </form>

                {createStatus && (
                  <p className={`text-xs font-bold mt-4 ${createStatus.type === "success" ? "text-[#FFD700]" : "text-[#FF4444]"}`}>
                    {createStatus.message}
                  </p>
                )}
              </div>

              {/* Codes List */}
              <div className="lg:col-span-2 space-y-4">
                <h3 className="text-lg font-black uppercase text-[#FFD700]">Redeem Codes Logs</h3>
                
                {codesLoading ? (
                  <div className="flex justify-center py-12">
                    <div className={styles.spinner} />
                  </div>
                ) : adminCodes.length === 0 ? (
                  <div className="glass-card p-12 text-center text-sm text-[#555555]">
                    No redeem codes generated yet.
                  </div>
                ) : (
                  <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
                    {adminCodes.map((c) => {
                      const isExpired = Date.now() > c.expiresAt;
                      const isExhausted = c.redemptionCount >= c.maxRedemptions;
                      const isExpanded = expandedCode === c.code;

                      let statusText = "Active";
                      let statusClass = "text-[#FFD700] bg-[#FFD700]/10 border-[#FFD700]/20";
                      if (isExpired) {
                        statusText = "Expired";
                        statusClass = "text-[#555555] bg-[#111111] border-[#222222]";
                      } else if (isExhausted) {
                        statusText = "Exhausted";
                        statusClass = "text-[#FF4444] bg-[#FF4444]/10 border-[#FF4444]/20";
                      }

                      return (
                        <div key={c.code} className="glass-card p-5 border border-[#222222]">
                          <div className="flex flex-wrap items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-3">
                                <span className="font-mono text-lg font-black text-white tracking-wider">{c.code}</span>
                                <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border rounded ${statusClass}`}>
                                  {statusText}
                                </span>
                              </div>
                              <div className="text-xs text-[#888888] mt-1 space-x-4">
                                <span>Duration: <strong className="text-white">{c.durationDays} Days</strong></span>
                                <span>Usage: <strong className="text-white">{c.redemptionCount} / {c.maxRedemptions}</strong></span>
                                <span>Expires: <strong className="text-white">{new Date(c.expiresAt).toLocaleDateString()}</strong></span>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              {c.redemptions && c.redemptions.length > 0 && (
                                <button
                                  onClick={() => setExpandedCode(isExpanded ? null : c.code)}
                                  className="text-xs font-bold text-[#888888] hover:text-white transition-colors"
                                >
                                  {isExpanded ? "Hide Logs" : `Show Logs (${c.redemptions.length})`}
                                </button>
                              )}
                              <button
                                onClick={() => handleRevokeCode(c.code)}
                                className="text-xs font-bold text-[#FF4444] hover:text-white transition-colors"
                              >
                                Revoke
                              </button>
                            </div>
                          </div>

                          {/* Expandable Redemptions log */}
                          {isExpanded && c.redemptions && (
                            <div className="mt-4 pt-4 border-t border-[#222222] space-y-2">
                              <p className="text-[9px] font-bold text-[#555555] uppercase tracking-widest mb-2">Redemption History</p>
                              {c.redemptions.map((r: any, idx: number) => (
                                <div key={idx} className="flex justify-between text-xs text-[#888888]">
                                  <span>{r.email}</span>
                                  <span>{new Date(r.redeemedAt).toLocaleString()}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
