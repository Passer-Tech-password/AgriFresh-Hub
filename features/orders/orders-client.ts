"use client";

import { collection, doc, serverTimestamp, setDoc, updateDoc, type FieldValue } from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { OrderDoc, OrderItem, OrderStatus } from "@/types/order";

type OrderWrite = Omit<OrderDoc, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export async function createOrder(args: {
  userId: string;
  email?: string | null;
  amountKobo: number;
  items: OrderItem[];
  paystackReference?: string;
  type: "retail" | "bulk";
  requiresColdChain: boolean;
  isUpfrontPayment: boolean;
  logisticsNotes?: string;
}) {
  const ref = doc(collection(db, "orders"));
  const payload: OrderWrite = {
    userId: args.userId,
    email: args.email ?? null,
    status: "pending",
    type: args.type,
    currency: "NGN",
    amountKobo: args.amountKobo,
    items: args.items,
    paystackReference: args.paystackReference || undefined,
    requiresColdChain: args.requiresColdChain,
    isUpfrontPayment: args.isUpfrontPayment,
    logisticsNotes: args.logisticsNotes || undefined,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };
  await setDoc(ref, payload);
  return ref.id;
}

export async function updateOrderTracking(orderId: string, data: {
  currentTemp?: number;
  currentLocation?: { lat: number; lng: number; address: string };
}) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() });
}

export async function setOrderStatus(orderId: string, status: OrderStatus) {
  const ref = doc(db, "orders", orderId);
  await updateDoc(ref, { status, updatedAt: serverTimestamp() });
}

