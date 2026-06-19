"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  onAuthStateChanged,
  signInWithPopup,
  GoogleAuthProvider,
  signOut,
  type User,
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AuthContextType {
  user: User | null;
  isPro: boolean;
  isAdmin: boolean;
  trialStartedAt: number | null;
  proExpiresAt: number | null;
  loading: boolean;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  refreshProStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isPro, setIsPro] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [proExpiresAt, setProExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProStatus = async (uid: string, email?: string | null) => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const hasExpired = data?.proExpiresAt && Date.now() > data.proExpiresAt;
        const isProActive = data?.isPro === true && !hasExpired;
        setIsPro(isProActive);
        setIsAdmin(data?.isAdmin === true || data?.email === "shuvodipray99@gmail.com" || email === "shuvodipray99@gmail.com");
        setTrialStartedAt(data?.trialStartedAt ?? null);
        setProExpiresAt(data?.proExpiresAt ?? null);

        if (data?.isPro === true && hasExpired) {
          try {
            await setDoc(doc(db, "users", uid), { isPro: false }, { merge: true });
          } catch (updateErr) {
            console.error("Failed to auto-update expired Pro status in Firestore:", updateErr);
          }
        }
      } else {
        const now = Date.now();
        await setDoc(doc(db, "users", uid), {
          isPro: false,
          createdAt: new Date().toISOString(),
          trialStartedAt: now,
        });
        setIsPro(false);
        setIsAdmin(email === "shuvodipray99@gmail.com");
        setTrialStartedAt(now);
        setProExpiresAt(null);
      }
    } catch (error) {
      console.error("Error fetching pro status:", error);
      setIsPro(false);
      setIsAdmin(false);
    }
  };

  useEffect(() => {
    if (!auth) {
      setLoading(false);
      return;
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        await fetchProStatus(firebaseUser.uid, firebaseUser.email);
      } else {
        setIsPro(false);
        setIsAdmin(false);
        setTrialStartedAt(null);
        setProExpiresAt(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const loginWithGoogle = async () => {
    if (!auth || !db) throw new Error("Firebase not initialized");
    const provider = new GoogleAuthProvider();
    const credential = await signInWithPopup(auth, provider);
    const firebaseUser = credential.user;

    const userRef = doc(db, "users", firebaseUser.uid);
    const existing = await getDoc(userRef);
    if (!existing.exists()) {
      const now = Date.now();
      await setDoc(userRef, {
        email: firebaseUser.email,
        isPro: false,
        trialStartedAt: now,
      });
      setTrialStartedAt(now);
      setProExpiresAt(null);
      setIsAdmin(firebaseUser.email === "shuvodipray99@gmail.com");
    } else {
      const data = existing.data();
      const hasExpired = data?.proExpiresAt && Date.now() > data.proExpiresAt;
      const isProActive = data?.isPro === true && !hasExpired;
      setIsPro(isProActive);
      setIsAdmin(data?.isAdmin === true || data?.email === "shuvodipray99@gmail.com" || firebaseUser.email === "shuvodipray99@gmail.com");
      setTrialStartedAt(data?.trialStartedAt ?? null);
      setProExpiresAt(data?.proExpiresAt ?? null);

      if (data?.isPro === true && hasExpired) {
        try {
          await setDoc(userRef, { isPro: false }, { merge: true });
        } catch (updateErr) {
          console.error("Failed to auto-update expired Pro status in Firestore:", updateErr);
        }
      }
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setIsPro(false);
    setIsAdmin(false);
    setTrialStartedAt(null);
    setProExpiresAt(null);
  };

  const refreshProStatus = async () => {
    if (user) await fetchProStatus(user.uid, user.email);
  };

  return (
    <AuthContext.Provider
      value={{ user, isPro, isAdmin, trialStartedAt, proExpiresAt, loading, loginWithGoogle, logout, refreshProStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
