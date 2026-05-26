"use client";

import * as React from "react";
import Link from "next/link";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { 
  Star, 
  Award, 
  ShieldCheck, 
  MessageSquare, 
  ThumbsUp,
  Trophy,
  Medal,
  ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { VoteDoc } from "@/types/votes";

const VOTE_CATEGORIES = [
  { id: "Trusted Quality", label: "Best Product Quality", icon: ThumbsUp, color: "text-blue-400", bg: "bg-blue-400/10" },
  { id: "Highest Reliability", label: "Most Reliable Delivery", icon: ShieldCheck, color: "text-leaf", bg: "bg-leaf/10" },
  { id: "Best Customer Service", label: "Exceptional Service", icon: MessageSquare, color: "text-gold", bg: "bg-gold/10" },
];

export default function VendorVotesPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const [votes, setVotes] = React.useState<VoteDoc[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "votes"), where("vendorUid", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setVotes(snap.docs.map(d => ({ ...d.data(), id: d.id }) as VoteDoc));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const getCategoryCount = (cat: string) => votes.filter(v => v.category === cat).length;
  
  const sortedCategories = [...VOTE_CATEGORIES].sort((a, b) => 
    getCategoryCount(b.id) - getCategoryCount(a.id)
  );

  const totalVotes = votes.length;

  const Icon1 = sortedCategories[0]?.icon;
  const Icon2 = sortedCategories[1]?.icon;
  const Icon3 = sortedCategories[2]?.icon;

  return (
    <div className="space-y-12 animate-in fade-in duration-700">
      {/* Header */}
      <header className="space-y-1">
        <h1 className="font-display text-4xl font-bold tracking-tight text-white">
          Trust <span className="text-gold">Rankings</span>.
        </h1>
        <p className="text-sm text-white/50">
          How the AgriFresh community sees your farm business.
        </p>
      </header>

      {/* Main Scoreboard */}
      <section className="grid gap-8 lg:grid-cols-3">
        {/* Overall Trust Badge */}
        <div className="relative flex flex-col items-center justify-center rounded-[40px] border border-gold/30 bg-gradient-to-b from-gold/20 to-transparent p-10 text-center backdrop-blur shadow-2xl overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(245,195,0,0.1),transparent)] group-hover:scale-150 transition-transform duration-1000" />
          
          <div className="relative mb-6">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gold/20 blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-[32px] bg-gold/10 text-gold border border-gold/30 shadow-[0_0_50px_rgba(245,195,0,0.3)]">
              <Award className="h-12 w-12" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-leaf text-[#04110D] border-4 border-[#071512] font-black text-xs">
              TOP
            </div>
          </div>
          
          <div className="space-y-1">
            <div className="text-5xl font-black text-white">{totalVotes}</div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gold">Total Impact Votes</div>
          </div>

          <div className="mt-8 rounded-2xl bg-black/40 px-6 py-2 border border-white/5 text-[10px] font-bold text-white/60 uppercase tracking-widest">
            Elite Vendor Status
          </div>
        </div>

        {/* Podium Display */}
        <div className="lg:col-span-2 flex flex-col justify-end gap-4 min-h-[300px] p-8 rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur overflow-hidden relative">
          <div className="absolute top-8 left-8 space-y-1">
            <h3 className="text-xl font-bold text-white">Category Leaders</h3>
            <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Your top performing traits</p>
          </div>

          <div className="flex items-end justify-center gap-4 lg:gap-8 pt-20">
            {/* 2nd Place */}
            <div className="flex flex-col items-center gap-4 group">
              <div className={cn("flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 border border-white/10 text-white/40 group-hover:text-white transition-colors")}>
                {Icon2 ? <Icon2 className="h-6 w-6" /> : <Medal className="h-6 w-6" />}
              </div>
              <div className="w-20 lg:w-24 h-24 bg-gradient-to-t from-white/5 to-white/10 rounded-t-2xl border-x border-t border-white/10 flex flex-col items-center justify-center gap-1">
                <span className="text-2xl font-black text-white/60">{sortedCategories[1] ? getCategoryCount(sortedCategories[1].id) : 0}</span>
                <span className="text-[8px] font-bold uppercase tracking-widest text-white/20">Votes</span>
              </div>
            </div>

            {/* 1st Place */}
            <div className="flex flex-col items-center gap-4 group -mb-2">
              <div className="relative">
                <div className="absolute inset-0 bg-gold/20 blur-lg" />
                <div className="relative flex h-16 w-16 items-center justify-center rounded-3xl bg-gold/20 border border-gold/40 text-gold group-hover:scale-110 transition-transform">
                  {Icon1 ? <Icon1 className="h-8 w-8" /> : <Trophy className="h-8 w-8" />}
                </div>
              </div>
              <div className="w-24 lg:w-32 h-40 bg-gradient-to-t from-gold/5 to-gold/20 rounded-t-3xl border-x border-t border-gold/30 flex flex-col items-center justify-center gap-2 shadow-[0_-20px_40px_rgba(245,195,0,0.1)]">
                <span className="text-4xl font-black text-gold">{sortedCategories[0] ? getCategoryCount(sortedCategories[0].id) : 0}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-gold/40">Votes</span>
              </div>
            </div>

            {/* 3rd Place */}
            <div className="flex flex-col items-center gap-4 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 border border-white/10 text-white/40 group-hover:text-white transition-colors">
                {Icon3 ? <Icon3 className="h-5 w-5" /> : <Medal className="h-5 w-5" />}
              </div>
              <div className="w-16 lg:w-20 h-16 bg-gradient-to-t from-white/5 to-white/10 rounded-t-xl border-x border-t border-white/10 flex flex-col items-center justify-center gap-1">
                <span className="text-xl font-black text-white/40">{sortedCategories[2] ? getCategoryCount(sortedCategories[2].id) : 0}</span>
                <span className="text-[7px] font-bold uppercase tracking-widest text-white/20">Votes</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Breakdown List */}
      <section className="space-y-6">
        <h3 className="text-xs font-black uppercase tracking-widest text-white/30 px-4">Detailed Breakdown</h3>
        <div className="grid gap-4">
          {VOTE_CATEGORIES.map((cat) => {
            const count = getCategoryCount(cat.id);
            const percentage = totalVotes > 0 ? (count / totalVotes) * 100 : 0;
            
            return (
              <div key={cat.id} className="group flex flex-col gap-6 rounded-[32px] border border-forest/20 bg-black/20 p-6 backdrop-blur transition-all hover:border-leaf/30 hover:bg-white/[0.02] sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-5">
                  <div className={cn("flex h-14 w-14 items-center justify-center rounded-2xl border border-white/5", cat.bg, cat.color)}>
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-lg font-bold text-white group-hover:text-leaf transition-colors">{cat.label}</h4>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Community appreciation category</p>
                  </div>
                </div>

                <div className="flex items-center gap-8">
                  <div className="text-right">
                    <div className="text-3xl font-black text-white">{count}</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Votes Received</div>
                  </div>
                  <div className="hidden sm:block h-10 w-[1px] bg-white/5" />
                  <div className="text-right hidden sm:block">
                    <div className="text-xl font-black text-leaf">{percentage.toFixed(1)}%</div>
                    <div className="text-[10px] font-black uppercase tracking-widest text-white/30">Total Weight</div>
                  </div>
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/20">
                    <ChevronRight className="h-5 w-5" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Trust Signaler Card */}
      <section className="rounded-[40px] border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur overflow-hidden relative">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <ShieldCheck className="h-40 w-40 text-blue-400" />
        </div>
        <div className="relative z-10 flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <h3 className="text-2xl font-bold text-white">Trust is Currency</h3>
            <p className="text-sm text-white/50 max-w-lg leading-relaxed">
              Every vote you receive comes from a verified buyer. High trust rankings directly impact 
              your position in the marketplace and eligibility for bulk inquiry priority.
            </p>
          </div>
          <Link href="/leaderboard">
            <Button variant="secondary" className="rounded-2xl h-12 border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
              View Public Leaderboard
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}
