"use client";

import {
  collection,
  doc,
  getDocs,
  increment,
  limit,
  orderBy,
  query,
  runTransaction,
  serverTimestamp,
  where
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { VoteDoc, LeaderboardEntry } from "@/types/voting";

export async function voteForVendor(args: {
  voterId: string;
  vendorId: string;
  credits: number;
}) {
  const userRef = doc(db, "users", args.voterId);
  const vendorStatsRef = doc(db, "vendorStats", args.vendorId);
  const votesRef = collection(db, "votes");

  await runTransaction(db, async (transaction) => {
    const userSnap = await transaction.get(userRef);
    if (!userSnap.exists()) throw new Error("User not found");
    
    const userData = userSnap.data();
    if ((userData.creditsBalance || 0) < args.credits) {
      throw new Error("Insufficient credits");
    }

    // 1. Deduct credits
    transaction.update(userRef, {
      creditsBalance: increment(-args.credits)
    });

    // 2. Update vendor stats
    transaction.set(vendorStatsRef, {
      totalVotes: increment(args.credits),
      lastVotedAt: serverTimestamp()
    }, { merge: true });

    // 3. Record the vote
    const voteRef = doc(votesRef);
    transaction.set(voteRef, {
      voterId: args.voterId,
      vendorId: args.vendorId,
      creditsUsed: args.credits,
      createdAt: serverTimestamp()
    });
  });
}

export async function getLeaderboard(limitCount = 10): Promise<LeaderboardEntry[]> {
  const statsRef = collection(db, "vendorStats");
  const q = query(statsRef, orderBy("totalVotes", "desc"), limit(limitCount));
  const snap = await getDocs(q);
  
  const entries: LeaderboardEntry[] = [];
  
  for (const d of snap.docs) {
    const stats = d.data();
    // Get vendor business name from vendorApplications
    const appRef = doc(db, "vendorApplications", d.id);
    const appSnap = await getDocs(query(collection(db, "vendorApplications"), where("uid", "==", d.id)));
    const businessName = !appSnap.empty ? appSnap.docs[0].data().businessName : "Unknown Vendor";
    
    entries.push({
      vendorId: d.id,
      businessName,
      totalVotes: stats.totalVotes || 0,
      freshnessScore: stats.freshnessScore || 90, // Default for now
      lastVotedAt: stats.lastVotedAt
    });
  }
  
  return entries;
}