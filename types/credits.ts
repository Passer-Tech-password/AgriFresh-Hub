import type { Timestamp } from "firebase/firestore";

export type CreditTransactionType = "purchase" | "vote_spend" | "reward";

export type CreditTransactionDoc = {
  id?: string;
  uid: string;
  type: CreditTransactionType;
  amount: number; // Positive for additions, negative for deductions
  description: string;
  metadata?: {
    paystackRef?: string;
    voteId?: string;
    category?: string;
    vendorId?: string;
  };
  createdAt: Timestamp;
};

export type CreditBundle = {
  id: string;
  name: string;
  priceNaira: number;
  credits: number;
  bonusLabel?: string;
  isPopular?: boolean;
};

export const CREDIT_BUNDLES: CreditBundle[] = [
  { id: "starter", name: "Starter Pack", priceNaira: 1000, credits: 1000 },
  { id: "plus", name: "AgriPlus Pack", priceNaira: 2500, credits: 2600, bonusLabel: "100 Bonus" },
  { id: "premium", name: "Premium Pack", priceNaira: 5000, credits: 5500, bonusLabel: "500 Bonus", isPopular: true },
  { id: "bulk", name: "Bulk Pack", priceNaira: 10000, credits: 12000, bonusLabel: "2000 Bonus" },
];
