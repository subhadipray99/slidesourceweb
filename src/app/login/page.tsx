"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const [error, setError] = useState("");
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, loading, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleGoogle = async () => {
    setError("");
    setIsGoogleLoading(true);
    try {
      await loginWithGoogle();
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code !== "auth/popup-closed-by-user") {
        setError(firebaseError.message || "Google sign-in failed. Please try again.");
      }
    } finally {
      setIsGoogleLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#000000]">
        <div className={styles.spinner} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden grid-pattern px-6">
      <Link
        href="/"
        className="fixed top-8 left-8 z-50 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.3em] text-[#555555] hover:text-[#FFD700] transition-colors"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Go Home
      </Link>

      <div className={`${styles.authCard} glass-card-strong opacity-0 animate-[fade-in-up_0.5s_ease-out_forwards]`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-12">
          <div className="w-20 h-20 rounded-2xl bg-[#FFD700] flex items-center justify-center text-black font-black text-3xl mb-6 shadow-2xl shadow-[#FFD700]/10">
            S
          </div>
          <h1 className="text-3xl font-black tracking-tighter uppercase italic text-center">SlideSource</h1>
          <p className="text-[#555555] text-[10px] font-bold uppercase tracking-widest mt-3 text-center leading-relaxed">
            Authentication Required<br />Manage your Android Pro sessions.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={isGoogleLoading}
          className={styles.googleBtn}
          id="google-signin-btn"
        >
          {isGoogleLoading ? (
            <div className={styles.spinnerSmall} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          <span>{isGoogleLoading ? "PROCESSSING..." : "CONTINUE WITH GOOGLE"}</span>
        </button>

        <p className={styles.termsText}>
          Your unified account for web and mobile.<br />
          Syncs with SlideSource Android Pro.
        </p>
      </div>
    </div>
  );
}
