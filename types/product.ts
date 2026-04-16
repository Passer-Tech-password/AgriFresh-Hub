import type { Timestamp } from "firebase/firestore";

export type BulkPricingTier = {
  minQty: number;
  pricePerUnitKobo: number;
};

export type ProductDoc = {
  id?: string;
  vendorId: string;
  name: string;
  description?: string | null;
  category: string;
  unit: "kg" | "ton" | "bag" | "crate" | "liter" | "pack";
  priceKobo: number;
  stock: number;
  active: boolean;
  imageUrl?: string | null;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  
  // Bulk Order Features
  moq: number; // Minimum Order Quantity
  bulkPricing?: BulkPricingTier[];
  isPerishable: boolean;
  requiresColdChain: boolean;
  maxVolumeTons?: number; // Optional max capacity the vendor can handle
};

