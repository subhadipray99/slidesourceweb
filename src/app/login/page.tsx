"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import styles from "./page.module.css";

export default function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const { user, loading, login, signup, loginWithGoogle } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && user) {
      router.push("/dashboard");
    }
  }, [user, loading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (isSignUp) {
        await signup(email, password);
      } else {
        await login(email, password);
      }
      router.push("/dashboard");
    } catch (err: unknown) {
      const firebaseError = err as { code?: string; message?: string };
      switch (firebaseError.code) {
        case "auth/user-not-found":
          setError("No account found with this email.");
          break;
        case "auth/wrong-password":
        case "auth/invalid-credential":
          setError("Incorrect password. Please try again.");
          break;
        case "auth/email-already-in-use":
          setError("An account with this email already exists.");
          break;
        case "auth/weak-password":
          setError("Password must be at least 6 characters.");
          break;
        case "auth/invalid-email":
          setError("Please enter a valid email address.");
          break;
        default:
          setError(firebaseError.message || "Something went wrong. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

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
      <div className="min-h-screen flex items-center justify-center bg-[#06060E]">
        <div className={styles.spinner} />
      </div>
    );
  }

  if (user) return null;

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden grid-pattern px-6">
      {/* Background orbs */}
      <div className="orb orb-1" />
      <div className="orb orb-2" />

      {/* Back to home */}
      <Link
        href="/"
        className="fixed top-6 left-6 z-50 flex items-center gap-2 text-sm text-[#8A8F98] hover:text-white transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        Back
      </Link>

      {/* Auth Card */}
      <div className={`${styles.authCard} glass-card-strong opacity-0 animate-[fade-in-up_0.6s_ease-out_forwards]`}>
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4AA] flex items-center justify-center text-white font-bold text-xl mb-4 shadow-lg shadow-[#6C63FF]/20">
            S
          </div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isSignUp ? "Create Account" : "Welcome Back"}
          </h1>
          <p className="text-[#8A8F98] text-sm mt-1">
            {isSignUp
              ? "Sign up to unlock SlideSource Pro"
              : "Sign in to your SlideSource account"}
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className={styles.errorBanner}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="15" y1="9" x2="9" y2="15" />
              <line x1="9" y1="9" x2="15" y2="15" />
            </svg>
            {error}
          </div>
        )}

        {/* Google Sign-In */}
        <button
          onClick={handleGoogle}
          disabled={isGoogleLoading || isSubmitting}
          className={styles.googleBtn}
          id="google-signin-btn"
        >
          {isGoogleLoading ? (
            <div className={styles.spinnerSmall} style={{ borderTopColor: "#4285F4" }} />
          ) : (
            <svg width="20" height="20" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
              <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
              <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
              <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
              <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
              <path fill="none" d="M0 0h48v48H0z"/>
            </svg>
          )}
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>or</span>
          <span className={styles.dividerLine} />
        </div>

        {/* Email/Password Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-[#8A8F98] mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-field"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-[#8A8F98] mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field"
              required
              minLength={6}
              autoComplete={isSignUp ? "new-password" : "current-password"}
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting || isGoogleLoading}
            className={`btn-primary !w-full !mt-2 !py-3.5 !rounded-xl ${isSubmitting ? "opacity-60 pointer-events-none" : ""}`}
          >
            {isSubmitting ? (
              <div className={styles.spinnerSmall} />
            ) : isSignUp ? (
              "Create Account"
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Toggle */}
        <div className="text-center mt-6 text-sm text-[#8A8F98]">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            onClick={() => {
              setIsSignUp(!isSignUp);
              setError("");
            }}
            className="text-[#6C63FF] hover:text-[#8B83FF] font-medium transition-colors"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </div>
      </div>
    </div>
  );
}
