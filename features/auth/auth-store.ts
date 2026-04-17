"use client";

import { onAuthStateChanged, signOut as firebaseSignOut, type User } from "firebase/auth";
import { doc, onSnapshot } from "firebase/firestore";
import { create } from "zustand";

import { auth, db } from "@/lib/firebase";
import type { UserRole } from "@/types/roles";
import type { UserDoc } from "@/types/user";

export type AuthStatus = "loading" | "signedOut" | "signedIn";

type AuthState = {
  status: AuthStatus;
  firebaseUser: User | null;
  userDoc: UserDoc | null;
  role: UserRole | null;
  initAuthListener: () => () => void;
  signOut: () => Promise<void>;
};

export const useAuthStore = create<AuthState>((set) => {
  let userDocUnsub: null | (() => void) = null;

  return {
    status: "loading",
    firebaseUser: null,
    userDoc: null,
    role: null,
    initAuthListener: () => {
      set({ status: "loading" });
      if (!auth || !auth.app) {
        set({ status: "signedOut", firebaseUser: null, userDoc: null, role: null });
        return () => {};
      }
      const authUnsub = onAuthStateChanged(auth, (user) => {
        if (userDocUnsub) {
          userDocUnsub();
          userDocUnsub = null;
        }

        if (!user) {
          set({ status: "signedOut", firebaseUser: null, userDoc: null, role: null });
          return;
        }

        set({ firebaseUser: user, status: "signedIn" });

        const userRef = doc(db, "users", user.uid);
        userDocUnsub = onSnapshot(
          userRef,
          (snap) => {
            const nextUserDoc = snap.exists() ? (snap.data() as UserDoc) : null;
            set({ userDoc: nextUserDoc, role: nextUserDoc?.role ?? null });
          },
          () => {
            set({ userDoc: null, role: null });
          }
        );
      });

      return () => {
        if (userDocUnsub) {
          userDocUnsub();
          userDocUnsub = null;
        }
        authUnsub();
      };
    },
    signOut: async () => {
      if (userDocUnsub) {
        userDocUnsub();
        userDocUnsub = null;
      }
      if (auth && auth.app) {
        await firebaseSignOut(auth);
      }
      set({ status: "signedOut", firebaseUser: null, userDoc: null, role: null });
    }
  };
});

export const useAuthReady = () => useAuthStore((s) => s.status !== "loading");

export const useRole = () => useAuthStore((s) => s.role);

export const useIsSignedIn = () => useAuthStore((s) => s.status === "signedIn");

export const useIsAdmin = () => useAuthStore((s) => s.role === "admin");
