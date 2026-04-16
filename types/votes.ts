import type { Timestamp } from "firebase/firestore";

export type VoteCategory = 
  | "Best Customer Service" 
  | "Highest Reliability" 
  | "Trusted Quality";

export type VoteDoc = {
  id?: string;
  voterUid: string;
  vendorUid: string;
  category: VoteCategory;
  creditsSpent: number;
  votingCycle: string; // e.g., "2026-04" for monthly
  createdAt: Timestamp;
};

export type VendorLeaderboardStats = {
  vendorUid: string;
  businessName: string;
  imageUrl?: string;
  location: string;
  totalVotes: number;
  categoryBreakdown: Record<VoteCategory, number>;
  rank?: number;
};
