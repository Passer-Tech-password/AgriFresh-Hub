"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Zap, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Truck, 
  Star, 
  X,
  Crown,
  CheckCircle2,
  ChevronRight,
  ArrowLeft,
  Building2,
  User,
  Loader2
} from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp, Timestamp } from "firebase/firestore";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const TIERS = [
  {
    id: "individual",
    name: "Individual Pro",
    price: 2500,
    period: "month",
    icon: User,
    color: "leaf",
    benefits: [
      "Unlimited trust votes",
      "Priority delivery matching",
      "Priority customer support",
      "Ad-free experience",
      "Exclusive subscription boxes"
    ]
  },
  {
    id: "business",
    name: "Vendor Business",
    price: 9999,
    period: "month",
    icon: Building2,
    color: "gold",
    isPopular: true,
    benefits: [
      "All Individual features",
      "Featured product listings",
      "Advanced sales analytics",
      "Bulk order priority badge",
      "Cold-chain performance report",
      "Verified Business seal"
    ]
  }
];

export default function ProPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  const handleSubscribe = async (tierId: string) => {
    if (!user) {
      toast.error("Please sign in to subscribe.");
      return;
    }

    setBusyId(tierId);
    
    try {
      // Simulate Paystack recurring payment
      await new Promise(r => setTimeout(r, 2000));

      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 1);

      await updateDoc(doc(db, "users", user.uid), {
        proExpiry: Timestamp.fromDate(expiry),
        updatedAt: serverTimestamp()
      });

      toast.success("Welcome to AgriFresh Pro!", {
        icon: <Crown className="h-4 w-4 text-gold" />,
        duration: 5000
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Subscription failed:", err);
      toast.error("Payment failed. Please try again.");
    } finally {
      setBusyId(null);
    }
  };

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-12">
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4 text-center lg:text-left">
            <Link href="/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-leaf">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Link>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-6xl">
              AgriFresh <span className="text-gold">Pro</span>.
            </h1>
            <p className="max-w-2xl text-lg leading-relaxed text-white/50 mx-auto lg:mx-0">
              Unlock powerful tools, priority services, and premium insights to scale your experience 
              on Nigeria's leading agri-tech marketplace.
            </p>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-2 max-w-5xl mx-auto">
          {TIERS.map((tier) => (
            <div 
              key={tier.id}
              className={cn(
                "group relative flex flex-col overflow-hidden rounded-[40px] border p-8 sm:p-12 transition-all duration-500",
                tier.isPopular 
                  ? "border-gold/40 bg-gradient-to-b from-gold/10 to-transparent shadow-[0_30px_80px_rgba(245,195,0,0.1)] scale-105 z-10" 
                  : "border-forest/20 bg-black/20"
              )}
            >
              {tier.isPopular && (
                <div className="absolute right-10 top-10 rounded-full bg-gold px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-forest">
                  Best Value
                </div>
              )}

              <div className="mb-auto space-y-8">
                <div className="space-y-2">
                  <div className={cn(
                    "inline-flex h-14 w-14 items-center justify-center rounded-2xl mb-4",
                    tier.color === "gold" ? "bg-gold/10 text-gold" : "bg-leaf/10 text-leaf"
                  )}>
                    <tier.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">{tier.name}</h3>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-black text-white">₦{tier.price.toLocaleString()}</span>
                    <span className="text-sm font-bold text-white/30 uppercase tracking-widest">/{tier.period}</span>
                  </div>
                </div>

                <div className="h-px w-full bg-white/5" />

                <ul className="space-y-4">
                  {tier.benefits.map((benefit, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-white/60">
                      <CheckCircle2 className={cn("h-5 w-5 shrink-0 mt-0.5", tier.color === "gold" ? "text-gold" : "text-leaf")} />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-12 space-y-6">
                <Button 
                  onClick={() => handleSubscribe(tier.id)}
                  disabled={!!busyId}
                  variant={tier.isPopular ? "primary" : "secondary"}
                  className={cn(
                    "group relative w-full overflow-hidden rounded-[24px] h-16 text-lg font-bold",
                    tier.isPopular && "bg-gold text-forest hover:bg-gold/90"
                  )}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {busyId === tier.id ? <Loader2 className="h-6 w-6 animate-spin" /> : (
                      <>
                        Subscribe Now
                        <Sparkles className="h-5 w-5 transition-transform group-hover:scale-125" />
                      </>
                    )}
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </Button>
                <p className="text-[10px] text-center text-white/20 uppercase tracking-widest font-bold">
                  Secure recurring billing via Paystack
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Comparison or FAQ link */}
        <section className="text-center py-10">
          <p className="text-sm text-white/40">
            Need a custom enterprise plan for large farms? 
            <Link href="/contact" className="ml-2 text-leaf font-bold hover:underline">Contact Sales →</Link>
          </p>
        </section>
      </div>
    </main>
  );
}
