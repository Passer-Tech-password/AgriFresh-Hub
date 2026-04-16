"use client";

import * as React from "react";
import Link from "next/link";
import { 
  CreditCard, 
  Sparkles, 
  ChevronRight, 
  Zap, 
  ShieldCheck, 
  ArrowLeft,
  Wallet,
  CheckCircle2,
  Loader2,
  Trophy
} from "lucide-react";
import { toast } from "sonner";
import { doc, updateDoc, increment, collection, addDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { CREDIT_BUNDLES, type CreditBundle } from "@/types/credits";

export default function CreditsPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const handlePurchase = async (bundle: CreditBundle) => {
    if (!user) {
      toast.error("Please sign in to buy credits.");
      return;
    }

    setBusyId(bundle.id);
    
    try {
      // In a real app, you'd use Paystack Inline here.
      // Since we're in a sandbox, we'll simulate a successful Paystack callback.
      
      // Simulate network delay
      await new Promise(r => setTimeout(r, 1500));

      const userRef = doc(db, "users", user.uid);
      
      // 1. Update balance
      await updateDoc(userRef, {
        creditsBalance: increment(bundle.credits)
      });

      // 2. Record transaction
      await addDoc(collection(db, "creditsTransactions"), {
        uid: user.uid,
        type: "purchase",
        amount: bundle.credits,
        description: `Purchased ${bundle.name}`,
        metadata: {
          bundleId: bundle.id,
          priceNaira: bundle.priceNaira,
          paystackRef: `SIM_${Math.random().toString(36).substring(7).toUpperCase()}`
        },
        createdAt: serverTimestamp()
      });

      toast.success(`Successfully added ${bundle.credits.toLocaleString()} credits to your wallet!`, {
        icon: <Sparkles className="h-4 w-4 text-leaf" />,
        duration: 5000
      });
    } catch (err) {
      console.error("Purchase failed:", err);
      toast.error("Transaction failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-12">
        {/* Header */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link href="/leaderboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-leaf">
              <ArrowLeft className="h-4 w-4" />
              Back to Leaderboard
            </Link>
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Fuel the <span className="text-leaf">Trust</span>.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/50">
                Purchase credits to vote for your favorite vendors and help them rise to the top of the AgriFresh Leaderboard.
              </p>
            </div>
          </div>

          {/* Current Wallet Status */}
          <div className="group relative overflow-hidden rounded-[32px] border border-leaf/20 bg-leaf/5 p-6 backdrop-blur-md transition-all hover:border-leaf/40">
            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-leaf/10 blur-2xl transition-transform group-hover:scale-150" />
            <div className="relative z-10 flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
                <Wallet className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Your Credits Wallet</div>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-black text-white">{(userDoc?.creditsBalance || 0).toLocaleString()}</div>
                  <div className="text-xs font-bold text-leaf uppercase">Credits</div>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Bundles Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {CREDIT_BUNDLES.map((bundle) => (
            <div 
              key={bundle.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[32px] border p-8 transition-all duration-500 hover:-translate-y-2",
                bundle.isPopular 
                  ? "border-leaf/40 bg-gradient-to-b from-leaf/10 to-transparent shadow-[0_20px_50px_rgba(74,222,128,0.1)]" 
                  : "border-forest/20 bg-black/20 hover:border-leaf/20"
              )}
            >
              {bundle.isPopular && (
                <div className="absolute right-6 top-6 rounded-full bg-leaf px-3 py-1 text-[9px] font-black uppercase tracking-widest text-forest">
                  Most Popular
                </div>
              )}

              <div className="mb-auto space-y-6">
                <div className="space-y-1">
                  <h3 className="font-display text-lg font-bold text-white/60">{bundle.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-white">{bundle.credits.toLocaleString()}</span>
                    <span className="text-xs font-bold text-leaf uppercase">Credits</span>
                  </div>
                  {bundle.bonusLabel && (
                    <div className="inline-flex items-center gap-1.5 text-[10px] font-bold text-gold uppercase tracking-widest">
                      <Sparkles className="h-3 w-3" />
                      {bundle.bonusLabel}
                    </div>
                  )}
                </div>

                <ul className="space-y-3">
                  <li className="flex items-center gap-2 text-xs text-white/50">
                    <CheckCircle2 className="h-4 w-4 text-leaf" />
                    Instant delivery to wallet
                  </li>
                  <li className="flex items-center gap-2 text-xs text-white/50">
                    <CheckCircle2 className="h-4 w-4 text-leaf" />
                    Vote in any category
                  </li>
                  <li className="flex items-center gap-2 text-xs text-white/50">
                    <CheckCircle2 className="h-4 w-4 text-leaf" />
                    No expiry date
                  </li>
                </ul>
              </div>

              <div className="mt-10 space-y-4">
                <div className="text-center">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">Total Price</span>
                  <div className="text-xl font-bold text-white">₦{bundle.priceNaira.toLocaleString()}</div>
                </div>
                <Button 
                  onClick={() => handlePurchase(bundle)}
                  disabled={!!busyId}
                  variant={bundle.isPopular ? "primary" : "secondary"}
                  className="group relative w-full overflow-hidden rounded-2xl h-12"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {busyId === bundle.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                      <>
                        Buy Now
                        <Zap className="h-4 w-4 transition-transform group-hover:scale-125 group-hover:fill-current" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Footer */}
        <section className="grid gap-6 sm:grid-cols-3">
          <div className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur-md">
            <div className="flex gap-4">
              <div className="p-3 rounded-2xl bg-leaf/10 text-leaf">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Secure Payments</h4>
                <p className="text-xs text-white/40 leading-relaxed">Processed securely via Paystack. Your financial data is never stored on our servers.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur-md">
            <div className="flex gap-4">
              <div className="p-3 rounded-2xl bg-gold/10 text-gold">
                <Trophy className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Reward Quality</h4>
                <p className="text-xs text-white/40 leading-relaxed">Help top-tier farmers and vendors gain visibility through community recognition.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur-md">
            <div className="flex gap-4">
              <div className="p-3 rounded-2xl bg-leaf/10 text-leaf">
                <Zap className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white">Instant Activation</h4>
                <p className="text-xs text-white/40 leading-relaxed">Credits are applied to your balance immediately after successful payment verification.</p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
