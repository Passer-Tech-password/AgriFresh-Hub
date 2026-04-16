"use client";

import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  where,
  type FieldValue
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { ProductDoc } from "@/types/product";

type ProductWrite = Omit<ProductDoc, "createdAt" | "updatedAt"> & {
  createdAt: FieldValue;
  updatedAt: FieldValue;
};

export async function listMarketplaceProducts(limitCount = 24) {
  const ref = collection(db, "products");
  const q = query(ref, where("active", "==", true), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.slice(0, limitCount).map((d) => ({ id: d.id, ...(d.data() as ProductDoc) }));
}

export async function listVendorProducts(vendorId: string) {
  const ref = collection(db, "products");
  const q = query(ref, where("vendorId", "==", vendorId), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...(d.data() as ProductDoc) }));
}

export async function getProductById(productId: string) {
  const ref = doc(db, "products", productId);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...(snap.data() as ProductDoc) };
}

export async function createProduct(input: {
  vendorId: string;
  name: string;
  description?: string | null;
  category: string;
  unit: "kg" | "ton" | "bag" | "crate" | "liter" | "pack";
  priceKobo: number;
  stock: number;
  active?: boolean;
  imageUrl?: string | null;
  moq: number;
  bulkPricing?: { minQty: number; pricePerUnitKobo: number }[];
  isPerishable: boolean;
  requiresColdChain: boolean;
  maxVolumeTons?: number;
}) {
  const ref = collection(db, "products");

  const payload: ProductWrite = {
    vendorId: input.vendorId,
    name: input.name.trim(),
    description: input.description?.trim() ? input.description.trim() : null,
    category: input.category.trim(),
    unit: input.unit,
    priceKobo: input.priceKobo,
    stock: input.stock,
    active: input.active ?? true,
    imageUrl: input.imageUrl?.trim() ? input.imageUrl.trim() : null,
    moq: input.moq,
    bulkPricing: input.bulkPricing || [],
    isPerishable: input.isPerishable,
    requiresColdChain: input.requiresColdChain,
    maxVolumeTons: input.maxVolumeTons || null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp()
  };

  const created = await addDoc(ref, payload);
  return created.id;
}

export async function updateProduct(productId: string, patch: Partial<ProductDoc>) {
  const ref = doc(db, "products", productId);
  await updateDoc(ref, { ...patch, updatedAt: serverTimestamp() });
}

