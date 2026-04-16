"use client";

import * as React from "react";
import Link from "next/link";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Settings, 
  CheckCircle2, 
  Clock,
  History,
  Zap,
  Sparkles
} from "lucide-react";
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { VoteDoc } from "@/types/votes";

export default function ProfilePage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const role = useAuthStore((s) => s.role);
  const signOut = useAuthStore((s) => s.signOut);

  const [votes, setVotes] = React.useState<VoteDoc[]>([]);
  const [loadingVotes, setLoadingVotes] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    const fetchVotes = async () => {
      try {
        const q = query(
          collection(db, "votes"), 
          where("voterUid", "==", user.uid),
          orderBy("createdAt", "desc"),
          limit(10)
        );
        const snap = await getDocs(q);
        setVotes(snap.docs.map(d => ({ ...d.data(), id: d.id }) as VoteDoc));
      } catch (err) {
        console.error("Failed to fetch votes:", err);
      } finally {
        setLoadingVotes(false);
      }
    };
    fetchVotes();
  }, [user]);

  const roleLabels: Record<string, { label: string; color: string; icon: any }> = {
    buyer: { label: "Buyer", color: "text-leaf bg-leaf/10 border-leaf/20", icon: CheckCircle2 },
    vendor_pending: { label: "Pending Vendor", color: "text-gold bg-gold/10 border-gold/20", icon: Clock },
    vendor_approved: { label: "Verified Vendor", color: "text-blue-400 bg-blue-400/10 border-blue-400/20", icon: Shield },
    admin: { label: "Administrator", color: "text-purple-400 bg-purple-400/10 border-purple-400/20", icon: Shield },
  };

  const currentRole = role ? roleLabels[role] || { label: role, color: "text-white/40 bg-white/5 border-white/10", icon: User } : null;

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="space-y-10">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-4">
              <Link href="/dashboard" className="text-xs font-bold uppercase tracking-widest text-white/30 hover:text-leaf transition-colors">
                ← Back to Dashboard
              </Link>
              <div className="flex items-center gap-6">
                <div className="relative group">
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-tr from-leaf to-gold opacity-25 blur transition duration-500 group-hover:opacity-50" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-forest/30 bg-[#071512] text-3xl font-bold text-white shadow-lift">
                    {userDoc?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || "U"}
                  </div>
                </div>
                <div className="space-y-1">
                  <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
                    {userDoc?.displayName || "User Profile"}
                  </h1>
                  <div className="flex flex-wrap items-center gap-3">
                    {currentRole && (
                      <div className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider", currentRole.color)}>
                        <currentRole.icon className="h-3 w-3" />
                        {currentRole.label}
                      </div>
                    )}
                    <span className="text-sm text-white/40">{user?.email}</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="secondary" size="sm" className="rounded-xl border-white/10 text-white/60 hover:text-white" onClick={() => signOut()}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <section className="rounded-3xl border border-forest/20 bg-black/20 p-8 backdrop-blur shadow-lift space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
                  <Settings className="h-4 w-4" />
                  Account Details
                </h3>
                
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/25">Display Name</label>
                    <div className="flex h-11 items-center rounded-xl border border-forest/10 bg-black/20 px-4 text-sm text-white/80">
                      {userDoc?.displayName || "Not set"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/25">Email Address</label>
                    <div className="flex h-11 items-center rounded-xl border border-forest/10 bg-black/20 px-4 text-sm text-white/80">
                      {user?.email}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/25">Phone Number</label>
                    <div className="flex h-11 items-center rounded-xl border border-forest/10 bg-black/20 px-4 text-sm text-white/80 italic text-white/40">
                      {userDoc?.phoneNumber || "Not connected"}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold uppercase tracking-widest text-white/25">Member Since</label>
                    <div className="flex h-11 items-center rounded-xl border border-forest/10 bg-black/20 px-4 text-sm text-white/80">
                      {userDoc?.createdAt?.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' }) || "N/A"}
                    </div>
                  </div>
                </div>

                <div className="pt-4">
                  <Button variant="outline" className="rounded-xl border-white/10 text-white/60 hover:text-white hover:bg-white/5">
                    Edit Profile Details
                  </Button>
                </div>
              </section>

              <section className="rounded-3xl border border-forest/20 bg-black/20 p-8 backdrop-blur shadow-lift space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
                  <Shield className="h-4 w-4" />
                  Security & Privacy
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-forest/10 bg-black/10">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">Password</div>
                      <div className="text-xs text-white/40">Change your login password</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10">Update</Button>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-2xl border border-forest/10 bg-black/10">
                    <div className="space-y-0.5">
                      <div className="text-sm font-semibold text-white">Two-Factor Auth</div>
                      <div className="text-xs text-white/40">Add extra security to your account</div>
                    </div>
                    <Button variant="ghost" size="sm" className="text-white/30 hover:bg-white/5">Enable</Button>
                  </div>
                </div>
              </section>

              <section id="voting-history" className="rounded-3xl border border-forest/20 bg-black/20 p-8 backdrop-blur shadow-lift space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
                  <History className="h-4 w-4" />
                  Voting History
                </h3>
                
                {loadingVotes ? (
                  <div className="py-10 text-center text-xs text-white/20 uppercase tracking-widest">Loading history...</div>
                ) : votes.length === 0 ? (
                  <div className="py-10 text-center space-y-4">
                    <p className="text-sm text-white/40">You haven't cast any trust votes yet.</p>
                    <Link href="/leaderboard">
                      <Button variant="secondary" size="sm" className="rounded-xl border-white/10">Go to Leaderboard</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {votes.map((vote) => (
                      <div key={vote.id} className="flex items-center justify-between p-4 rounded-2xl border border-white/5 bg-black/10">
                        <div className="space-y-1">
                          <div className="text-sm font-bold text-white">{vote.category}</div>
                          <div className="text-[10px] text-white/30 uppercase tracking-widest">
                            {vote.createdAt?.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="flex items-center gap-2 text-gold">
                          <Sparkles className="h-3 w-3" />
                          <span className="text-xs font-black">-{vote.creditsSpent} CR</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-leaf/20 bg-gradient-to-b from-leaf/10 to-transparent p-6 backdrop-blur shadow-lift space-y-6">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-leaf/60">
                  <CreditCard className="h-4 w-4" />
                  Wallet Status
                </h3>
                <div className="space-y-4 text-center">
                  <div className="space-y-1">
                    <div className="text-4xl font-bold text-white tracking-tight">{(userDoc?.creditsBalance || 0).toLocaleString()}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">Available Credits</div>
                  </div>
                  <Link href="/credits" className="block">
                    <Button variant="primary" className="w-full rounded-xl shadow-lg">
                      Top Up Credits
                    </Button>
                  </Link>
                  <p className="text-[10px] text-white/30 leading-relaxed px-4">
                    Credits can be used to vote for vendors and support community trust.
                  </p>
                </div>
              </section>

              <section className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur shadow-lift space-y-4">
                <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
                  <Shield className="h-4 w-4" />
                  Role Benefits
                </h3>
                <div className="space-y-3">
                  {role === "buyer" && (
                    <ul className="space-y-2 text-xs text-white/60">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Access to farm-direct produce
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Real-time cold-chain tracking
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Buyer protection for perishables
                      </li>
                    </ul>
                  )}
                  {role?.includes("vendor") && (
                    <ul className="space-y-2 text-xs text-white/60">
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Unlimited product listings
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Bulk inquiry management
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-leaf shrink-0 mt-0.5" />
                        Vendor freshness analytics
                      </li>
                    </ul>
                  )}
                </div>
              </section>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
