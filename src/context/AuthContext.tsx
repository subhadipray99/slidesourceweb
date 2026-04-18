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
  const [trialStartedAt, setTrialStartedAt] = useState<number | null>(null);
  const [proExpiresAt, setProExpiresAt] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchProStatus = async (uid: string) => {
    if (!db) return;
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setIsPro(data?.isPro === true);
        setTrialStartedAt(data?.trialStartedAt ?? null);
        setProExpiresAt(data?.proExpiresAt ?? null);
      } else {
        const now = Date.now();
        await setDoc(doc(db, "users", uid), {
          isPro: false,
          createdAt: new Date().toISOString(),
          trialStartedAt: now,
        });
        setIsPro(false);
        setTrialStartedAt(now);
        setProExpiresAt(null);
      }
    } catch (error) {
      console.error("Error fetching pro status:", error);
      setIsPro(false);
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
        await fetchProStatus(firebaseUser.uid);
      } else {
        setIsPro(false);
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
    } else {
      const data = existing.data();
      setIsPro(data?.isPro === true);
      setTrialStartedAt(data?.trialStartedAt ?? null);
      setProExpiresAt(data?.proExpiresAt ?? null);
    }
  };

  const logout = async () => {
    if (!auth) return;
    await signOut(auth);
    setIsPro(false);
    setTrialStartedAt(null);
    setProExpiresAt(null);
  };

  const refreshProStatus = async () => {
    if (user) await fetchProStatus(user.uid);
  };

  return (
    <AuthContext.Provider
      value={{ user, isPro, trialStartedAt, proExpiresAt, loading, loginWithGoogle, logout, refreshProStatus }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
