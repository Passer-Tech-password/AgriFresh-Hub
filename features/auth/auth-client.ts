"use client";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult
} from "firebase/auth";
import { doc, getDoc, serverTimestamp, setDoc, type FieldValue } from "firebase/firestore";

import { auth, db } from "@/lib/firebase";
import type { UserRole } from "@/types/roles";
import type { UserDoc } from "@/types/user";

declare global {
  interface Window {
    recaptchaVerifier: RecaptchaVerifier;
  }
}

type CreateUserDocInput = {
  uid: string;
  email?: string | null;
  displayName?: string | null;
  phoneNumber?: string | null;
  role: UserRole;
};

type UserDocCreate = Omit<UserDoc, "createdAt" | "proExpiry"> & {
  createdAt: FieldValue;
  proExpiry: null;
};

async function ensureUserDoc(input: CreateUserDocInput) {
  const ref = doc(db, "users", input.uid);
  const snap = await getDoc(ref);
  if (snap.exists()) return;

  const nextUserDoc: UserDocCreate = {
    uid: input.uid,
    email: input.email ?? null,
    displayName: input.displayName ?? null,
    phoneNumber: input.phoneNumber ?? null,
    role: input.role,
    createdAt: serverTimestamp(),
    proExpiry: null,
    creditsBalance: 0
  };

  await setDoc(ref, nextUserDoc);
}

export async function registerWithEmail(args: {
  fullName: string;
  email: string;
  password: string;
  role: UserRole;
}) {
  const cred = await createUserWithEmailAndPassword(auth, args.email, args.password);
  await updateProfile(cred.user, { displayName: args.fullName });
  await ensureUserDoc({
    uid: cred.user.uid,
    email: cred.user.email,
    displayName: args.fullName,
    role: args.role
  });
}

export async function loginWithEmail(args: { email: string; password: string }) {
  await signInWithEmailAndPassword(auth, args.email, args.password);
}

export async function setupRecaptcha(containerId: string) {
  if (!window.recaptchaVerifier) {
    window.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
      size: "invisible"
    });
  }
}

export async function sendOtp(phoneNumber: string): Promise<ConfirmationResult> {
  return signInWithPhoneNumber(auth, phoneNumber, window.recaptchaVerifier);
}

export async function verifyOtpAndCreateUser(args: {
  confirmationResult: ConfirmationResult;
  otp: string;
  fullName: string;
  role: UserRole;
}) {
  const cred = await args.confirmationResult.confirm(args.otp);
  if (cred.user) {
    await updateProfile(cred.user, { displayName: args.fullName });
    await ensureUserDoc({
      uid: cred.user.uid,
      phoneNumber: cred.user.phoneNumber,
      displayName: args.fullName,
      role: args.role
    });
  }
}

