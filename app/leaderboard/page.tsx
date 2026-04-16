"use client";

import * as React from "react";
import Link from "next/link";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  getDocs,
  runTransaction,
  serverTimestamp,
  orderBy
} from "firebase/firestore";
import { 
  Trophy, 
  Star, 
  ShieldCheck, 
  MessageSquare, 
  Sparkles, 
  Zap, 
  Crown,
  MapPin,
  TrendingUp,
  History,
  Wallet,
  Loader2,
  X
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { VoteCategory, VendorLeaderboardStats } from "@/types/votes";
import type { UserDoc } from "@/types/user";

const VOTE_COST = 50;
const VOTE_CATEGORIES: { id: VoteCategory; icon: any; label: string; description: string }[] = [
  { 
    id: "Best Customer Service", 
    icon: MessageSquare, 
    label: "Customer Service",
    description: "Responsive, helpful, and professional communication." 
  },
  { 
    id: "Highest Reliability", 
    icon: ShieldCheck, 
    label: "Reliability",
    description: "Consistent delivery times and MOQ compliance." 
  },
  { 
    id: "Trusted Quality", 
    icon: Star, 
    label: "Produce Quality",
    description: "Freshness, taste, and premium cold-chain handling." 
  },
];

export default function LeaderboardPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  
  const [vendors, setVendors] = React.useState<VendorLeaderboardStats[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [votingVendor, setVotingVendor] = React.useState<VendorLeaderboardStats | null>(null);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Get all approved vendors from 'users' collection
    const q = query(collection(db, "users"), where("role", "==", "vendor_approved"));
    
    const unsub = onSnapshot(q, async (userSnap) => {
      const vendorList: VendorLeaderboardStats[] = userSnap.docs.map(d => {
        const data = d.data() as UserDoc;
        return {
          vendorUid: d.id,
          businessName: data.displayName || "Unknown Business",
          location: "Port Harcourt, Rivers",
          totalVotes: 0,
          categoryBreakdown: {
            "Best Customer Service": 0,
            "Highest Reliability": 0,
            "Trusted Quality": 0
          }
        };
      });

      // 2. Fetch votes and aggregate (In a real app, use a Cloud Function for this aggregation)
      const votesSnap = await getDocs(collection(db, "votes"));
      votesSnap.forEach(vDoc => {
        const vData = vDoc.data();
        const vendor = vendorList.find(v => v.vendorUid === vData.vendorUid);
        if (vendor) {
          const cat = vData.category as VoteCategory;
          vendor.categoryBreakdown[cat] = (vendor.categoryBreakdown[cat] || 0) + 1;
          vendor.totalVotes += 1;
        }
      });

      // 3. Sort by total votes
      const sorted = vendorList.sort((a, b) => b.totalVotes - a.totalVotes);
      setVendors(sorted.map((v, i) => ({ ...v, rank: i + 1 })));
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const handleVote = async (vendor: VendorLeaderboardStats, category: VoteCategory) => {
    if (!user || !userDoc) {
      toast.error("Please sign in to vote.");
      return;
    }

    if (userDoc.creditsBalance < VOTE_COST) {
      toast.error("Insufficient credits. Please top up your wallet.");
      return;
    }

    setBusyId(`${vendor.vendorUid}-${category}`);

    try {
      await runTransaction(db, async (transaction) => {
        const userRef = doc(db, "users", user.uid);
        const userSnap = await transaction.get(userRef);
        
        if (!userSnap.exists()) throw "User doc not found";
        const currentBalance = userSnap.data().creditsBalance;
        
        if (currentBalance < VOTE_COST) throw "Insufficient credits";

        // 1. Deduct credits
        transaction.update(userRef, {
          creditsBalance: currentBalance - VOTE_COST
        });

        // 2. Record vote
        const voteRef = doc(collection(db, "votes"));
        transaction.set(voteRef, {
          voterUid: user.uid,
          vendorUid: vendor.vendorUid,
          category,
          creditsSpent: VOTE_COST,
          votingCycle: "2026-04",
          createdAt: serverTimestamp()
        });

        // 3. Record transaction
        const transRef = doc(collection(db, "creditsTransactions"));
        transaction.set(transRef, {
          uid: user.uid,
          type: "vote_spend",
          amount: -VOTE_COST,
          description: `Voted for ${vendor.businessName} (${category})`,
          metadata: {
            vendorId: vendor.vendorUid,
            category
          },
          createdAt: serverTimestamp()
        });
      });

      toast.success(`Vote cast for ${vendor.businessName}!`, {
        icon: <Sparkles className="h-4 w-4 text-gold" />,
        duration: 4000
      });
      setVotingVendor(null);
    } catch (err) {
      console.error("Voting failed:", err);
      toast.error(typeof err === "string" ? err : "Voting failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-12">
        {/* Header Section */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur">
              <Trophy className="h-3 w-3" />
              Community Excellence
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Vote for Nigeria’s <span className="text-gold text-glow">Most Trusted</span> Vendors.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/50">
              Reward consistency, quality, and service. Every vote helps the best producers gain the visibility they deserve.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <Link href="/credits">
              <Button className="group relative h-12 rounded-2xl border-gold/30 bg-gold text-forest hover:bg-gold/90 px-6 shadow-[0_0_30px_rgba(245,195,0,0.2)]">
                <Zap className="mr-2 h-4 w-4 fill-forest" />
                Buy Credits
              </Button>
            </Link>
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 py-3 backdrop-blur-md">
              <Wallet className="h-4 w-4 text-leaf" />
              <div className="text-left">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">Your Balance</div>
                <div className="text-sm font-bold text-white">{(userDoc?.creditsBalance || 0).toLocaleString()} <span className="text-[10px] text-leaf ml-0.5">CR</span></div>
              </div>
            </div>
          </div>
        </header>

        {/* Top 3 Podium */}
        {!loading && vendors.length >= 3 && (
          <section className="grid gap-6 sm:grid-cols-3">
            {[vendors[1], vendors[0], vendors[2]].map((vendor, idx) => (
              <div 
                key={vendor.vendorUid}
                className={cn(
                  "group relative overflow-hidden rounded-[40px] border p-8 transition-all duration-500",
                  vendor.rank === 1 
                    ? "border-gold/40 bg-gradient-to-b from-gold/10 to-transparent order-first sm:order-none sm:-translate-y-6 shadow-[0_20px_50px_rgba(245,195,0,0.1)]" 
                    : "border-forest/20 bg-black/20 mt-4 sm:mt-0"
                )}
              >
                {vendor.rank === 1 && (
                  <div className="absolute -right-4 -top-4 h-32 w-32 rounded-full bg-gold/10 blur-3xl" />
                )}
                
                <div className="relative z-10 flex flex-col items-center text-center space-y-6">
                  <div className="relative">
                    <div className={cn(
                      "flex h-24 w-24 items-center justify-center rounded-full border-2 text-3xl font-bold text-white shadow-lift",
                      vendor.rank === 1 ? "border-gold bg-gold/20" : "border-forest bg-forest/20"
                    )}>
                      {vendor.businessName[0]}
                    </div>
                    <div className={cn(
                      "absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-2xl shadow-xl",
                      vendor.rank === 1 ? "bg-gold text-forest" : "bg-forest text-leaf"
                    )}>
                      {vendor.rank === 1 ? <Crown className="h-6 w-6" /> : <span className="font-black">#{vendor.rank}</span>}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h3 className="font-display text-xl font-bold text-white">{vendor.businessName}</h3>
                    <div className="flex items-center justify-center gap-1 text-[10px] font-bold uppercase tracking-widest text-white/40">
                      <MapPin className="h-3 w-3 text-leaf" />
                      {vendor.location}
                    </div>
                  </div>

                  <div className="space-y-1 w-full">
                    <div className="text-4xl font-black text-white">{vendor.totalVotes.toLocaleString()}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-gold">Total Trust Votes</div>
                  </div>

                  <Button 
                    onClick={() => setVotingVendor(vendor)}
                    variant={vendor.rank === 1 ? "primary" : "secondary"}
                    className="w-full rounded-2xl h-11"
                  >
                    Cast Vote
                  </Button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* Full Leaderboard Table */}
        <div className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <tr>
                  <th className="px-8 py-5">Rank</th>
                  <th className="px-8 py-5">Vendor Business</th>
                  <th className="px-8 py-5">Reliability</th>
                  <th className="px-8 py-5">Quality</th>
                  <th className="px-8 py-5">Service</th>
                  <th className="px-8 py-5 text-right">Total Votes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {loading ? (
                  <tr><td colSpan={6} className="px-8 py-20 text-center text-white/30">Calculating rankings...</td></tr>
                ) : vendors.map((vendor) => (
                  <tr key={vendor.vendorUid} className="group hover:bg-white/[0.02] transition-colors">
                    <td className="px-8 py-6">
                      <div className={cn(
                        "flex h-8 w-8 items-center justify-center rounded-xl text-xs font-black",
                        vendor.rank! <= 3 ? "bg-gold/10 text-gold" : "bg-white/5 text-white/30"
                      )}>
                        #{vendor.rank}
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 rounded-full bg-forest/20 border border-forest/40 flex items-center justify-center font-bold text-white">
                          {vendor.businessName[0]}
                        </div>
                        <div>
                          <div className="font-bold text-white group-hover:text-leaf transition-colors">{vendor.businessName}</div>
                          <div className="text-[10px] text-white/30">{vendor.location}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="h-3 w-3 text-blue-400" />
                        <span className="text-white/60">{vendor.categoryBreakdown["Highest Reliability"]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <Star className="h-3 w-3 text-gold" />
                        <span className="text-white/60">{vendor.categoryBreakdown["Trusted Quality"]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-2">
                        <MessageSquare className="h-3 w-3 text-leaf" />
                        <span className="text-white/60">{vendor.categoryBreakdown["Best Customer Service"]}</span>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <div className="flex items-center justify-end gap-4">
                        <div className="font-black text-white text-lg">{vendor.totalVotes}</div>
                        <Button 
                          size="sm" 
                          variant="secondary" 
                          className="h-9 rounded-xl border-white/5 text-[10px] font-black uppercase"
                          onClick={() => setVotingVendor(vendor)}
                        >
                          Vote
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Voting History Link Section */}
        <section className="rounded-3xl border border-forest/20 bg-black/20 p-8 backdrop-blur text-center space-y-6">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
            <History className="h-7 w-7" />
          </div>
          <div className="space-y-2">
            <h3 className="font-display text-xl font-bold text-white">Your Voting Impact</h3>
            <p className="text-sm text-white/40 max-w-md mx-auto">
              Track your contribution to the community. View your voting history and see which vendors you've supported.
            </p>
          </div>
          <Link href="/profile#voting-history">
            <Button variant="secondary" className="rounded-xl border-white/10">View Voting History</Button>
          </Link>
        </section>
      </div>

      {/* Voting Modal */}
      {votingVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="relative w-full max-w-md rounded-[40px] border border-forest/30 bg-[#071512] p-8 shadow-2xl animate-in zoom-in-95">
            <button 
              onClick={() => setVotingVendor(null)}
              className="absolute right-6 top-6 text-white/30 hover:text-white"
            >
              <X className="h-6 w-6" />
            </button>

            <div className="space-y-8">
              <div className="text-center space-y-4">
                <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold mb-2">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h2 className="font-display text-2xl font-bold text-white">Vote for {votingVendor.businessName}</h2>
                <p className="text-sm text-white/40">Each vote costs <span className="text-gold font-bold">{VOTE_COST} credits</span> and supports vendor growth.</p>
              </div>

              <div className="space-y-3">
                {VOTE_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    disabled={!!busyId}
                    onClick={() => handleVote(votingVendor, cat.id)}
                    className="group w-full flex items-center gap-4 p-4 rounded-3xl border border-white/5 bg-white/[0.02] transition-all hover:border-leaf/50 hover:bg-leaf/5 text-left"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-leaf/10 text-leaf transition-transform group-hover:scale-110">
                      <cat.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <div className="text-sm font-bold text-white group-hover:text-leaf transition-colors">{cat.label}</div>
                      <div className="text-[10px] text-white/40 leading-tight">{cat.description}</div>
                    </div>
                    {busyId === `${votingVendor.vendorUid}-${cat.id}` ? (
                      <Loader2 className="h-5 w-5 animate-spin text-leaf" />
                    ) : (
                      <ChevronDown className="h-4 w-4 text-white/20 -rotate-90 group-hover:text-leaf" />
                    )}
                  </button>
                ))}
              </div>

              <div className="rounded-2xl border border-white/5 bg-black/40 p-4 text-center">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/30 mb-1">Your Wallet</div>
                <div className="text-sm font-bold text-white">{(userDoc?.creditsBalance || 0).toLocaleString()} Credits</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
