"use client";

import * as React from "react";
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
  ChevronRight
} from "lucide-react";
import { useRouter } from "next/navigation";
import { doc, updateDoc, serverTimestamp } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";

const PRO_BENEFITS = [
  { icon: Star, text: "Unlimited trust votes per month", detail: "Support more vendors you love." },
  { icon: Truck, text: "Priority support & faster delivery", detail: "Skip the queue for logistics matching." },
  { icon: TrendingUp, text: "Advanced business analytics", detail: "Deep insights into your sales & impact." },
  { icon: ShieldCheck, text: "Verified Pro Badge", detail: "Stand out as a trusted community member." },
  { icon: Crown, text: "Exclusive subscription boxes", detail: "Early access to curated seasonal produce." },
];

export function ProPlanModal() {
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const [show, setShow] = React.useState(false);

  React.useEffect(() => {
    if (!userDoc || !userDoc.createdAt) return;

    // Logic: 180 days after creation
    const createdDate = userDoc.createdAt.toDate();
    const now = new Date();
    const diffDays = Math.floor((now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
    
    // For testing purposes, we might want to lower this or check a flag
    // The requirement says "exactly 6 months (180 days)"
    const isPro = !!userDoc.proExpiry;
    const hasBeenPromptedRecently = userDoc.lastProPromptDismissed && 
      (now.getTime() - userDoc.lastProPromptDismissed.toDate().getTime()) < (1000 * 60 * 60 * 24 * 7); // Remind every 7 days

    if (diffDays >= 180 && !isPro && !hasBeenPromptedRecently) {
      setShow(true);
    }
  }, [userDoc]);

  const handleDismiss = async () => {
    setShow(false);
    if (user) {
      try {
        await updateDoc(doc(db, "users", user.uid), {
          lastProPromptDismissed: serverTimestamp()
        });
      } catch (err) {
        console.error("Failed to update dismiss timestamp:", err);
      }
    }
  };

  const handleUpgrade = () => {
    setShow(false);
    router.push("/pro");
  };

  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-500">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-[40px] border border-gold/30 bg-[#071512] shadow-[0_0_80px_rgba(245,195,0,0.15)] animate-in zoom-in-95 duration-500">
        {/* Decorative elements */}
        <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-gold/10 blur-3xl" />
        <div className="absolute -left-20 -bottom-20 h-64 w-64 rounded-full bg-leaf/10 blur-3xl" />

        <button 
          onClick={handleDismiss}
          className="absolute right-8 top-8 text-white/30 hover:text-white transition-colors z-20"
        >
          <X className="h-6 w-6" />
        </button>

        <div className="relative z-10 p-8 sm:p-12 space-y-10">
          <header className="text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-gold/10 text-gold mb-2 shadow-[0_0_30px_rgba(245,195,0,0.2)]">
              <Crown className="h-8 w-8" />
            </div>
            <h2 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Elevate to <span className="text-gold">AgriFresh Pro</span>
            </h2>
            <p className="text-white/50 max-w-md mx-auto">
              You've been with us for 6 months! Unlock the full potential of the marketplace with our premium membership.
            </p>
          </header>

          <div className="grid gap-4 sm:grid-cols-1">
            {PRO_BENEFITS.map((benefit, i) => (
              <div key={i} className="flex items-start gap-4 p-4 rounded-2xl border border-white/5 bg-white/[0.02]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold/10 text-gold">
                  <benefit.icon className="h-5 w-5" />
                </div>
                <div>
                  <div className="text-sm font-bold text-white">{benefit.text}</div>
                  <div className="text-[10px] text-white/30 uppercase tracking-widest font-bold">{benefit.detail}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <Button 
              variant="primary" 
              size="lg" 
              className="flex-1 h-14 rounded-2xl bg-gold text-forest hover:bg-gold/90 group relative overflow-hidden"
              onClick={handleUpgrade}
            >
              <span className="relative z-10 flex items-center justify-center gap-2 font-black">
                Upgrade Now
                <Sparkles className="h-5 w-5 transition-transform group-hover:scale-125" />
              </span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/30 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
            </Button>
            <Button 
              variant="secondary" 
              size="lg" 
              className="flex-1 h-14 rounded-2xl border-white/10"
              onClick={handleDismiss}
            >
              Maybe Later
            </Button>
          </div>

          <p className="text-[10px] text-center text-white/20 uppercase tracking-widest font-black">
            Starting from ₦2,500/month · Cancel anytime
          </p>
        </div>
      </div>
    </div>
  );
}
