import type { Timestamp } from "firebase/firestore";

export type VoteDoc = {
  id?: string;
  voterId: string;
  vendorId: string;
  creditsUsed: number;
  createdAt: Timestamp;
};

export type LeaderboardEntry = {
  vendorId: string;
  businessName: string;
  totalVotes: number;
  freshnessScore: number; // 0-100
  lastVotedAt: Timestamp;
};