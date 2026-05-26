"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Zap, 
  Check, 
  Star, 
  TrendingUp, 
  ShieldCheck, 
  Users, 
  ArrowRight,
  Sparkles,
  Award,
  Crown
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const BENEFITS = [
  { 
    title: "Featured Listings", 
    desc: "Your products appear at the top of search results and the home page featured section.",
    icon: Star,
    color: "text-gold"
  },
  { 
    title: "Priority Bulk Inquiries", 
    desc: "Get first access to large-scale B2B inquiries before regular vendors.",
    icon: TrendingUp,
    color: "text-leaf"
  },
  { 
    title: "Advanced Analytics", 
    desc: "Deep insights into buyer behavior, price trends, and local demand forecasting.",
    icon: Zap,
    color: "text-blue-400"
  },
  { 
    title: "Pro Badge & Trust", 
    desc: "A gold 'Pro' badge on your profile increases buyer trust and conversion rates by 40%.",
    icon: ShieldCheck,
    color: "text-gold"
  },
  { 
    title: "Unlimited Votes", 
    desc: "No limit on receiving community impact votes to climb the leaderboards.",
    icon: Award,
    color: "text-leaf"
  },
  { 
    title: "Direct Marketing", 
    desc: "Include your farm's promotional flyers in our weekly buyer newsletter.",
    icon: Users,
    color: "text-rose-400"
  },
];

export default function VendorProPage() {
  return (
    <div className="space-y-16 animate-in fade-in duration-1000">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-[48px] border border-gold/30 bg-[#071512] p-10 lg:p-20 text-center space-y-8">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(245,195,0,0.15),transparent)] pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-gold/50 to-transparent" />
        
        {/* Content */}
        <div className="relative z-10 space-y-6 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.2em] text-gold backdrop-blur-md">
            <Crown className="h-4 w-4 fill-gold" />
            Vendor Business Tier
          </div>
          <h1 className="font-display text-5xl font-bold tracking-tight text-white sm:text-7xl leading-[1.1]">
            Build an <span className="text-gold">Agri-Empire</span>.
          </h1>
          <p className="text-lg text-white/50 leading-relaxed">
            Upgrade to the AgriFresh Pro Business Plan and unlock the tools used by Rivers State's most successful producers.
          </p>
        </div>

        <div className="relative z-10 flex flex-col items-center gap-6">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-black text-white">₦9,999<span className="text-lg text-white/30 font-bold tracking-normal">/month</span></div>
            <div className="text-[10px] font-black uppercase tracking-widest text-gold mt-1">Limited Time Launch Pricing</div>
          </div>
          
          <Button className="h-16 px-12 rounded-[24px] bg-gold text-[#04110D] text-lg font-black shadow-[0_20px_50px_rgba(245,195,0,0.3)] hover:bg-gold/90 border-none group transition-all hover:scale-105 active:scale-95">
            <Sparkles className="mr-3 h-5 w-5 fill-current animate-pulse" />
            Upgrade My Store Now
            <ArrowRight className="ml-3 h-5 w-5 transition-transform group-hover:translate-x-2" />
          </Button>
          
          <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Cancel or switch plans anytime · No hidden fees</p>
        </div>

        {/* Floating Icons for Visual Interest */}
        <div className="hidden lg:block absolute top-20 left-20 animate-bounce duration-[3s]">
          <Star className="h-10 w-10 text-gold/20 fill-gold/10" />
        </div>
        <div className="hidden lg:block absolute bottom-20 right-20 animate-bounce duration-[4s]">
          <Zap className="h-12 w-12 text-gold/20 fill-gold/10" />
        </div>
      </section>

      {/* Benefits Grid */}
      <section className="space-y-12">
        <div className="text-center space-y-2">
          <h2 className="font-display text-3xl font-bold text-white">Why Go Pro?</h2>
          <p className="text-sm text-white/40 uppercase tracking-widest font-black">Exclusive features for growth-minded farmers</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {BENEFITS.map((benefit, i) => (
            <div key={i} className="group p-8 rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur transition-all hover:border-gold/30 hover:bg-gold/5">
              <div className={cn("mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/5 border border-white/5 transition-all group-hover:scale-110", benefit.color)}>
                <benefit.icon className="h-7 w-7" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3 group-hover:text-gold transition-colors">{benefit.title}</h3>
              <p className="text-sm text-white/50 leading-relaxed">{benefit.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Trust Signal / Comparison */}
      <section className="rounded-[48px] border border-forest/20 bg-black/20 p-10 lg:p-16 overflow-hidden">
        <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
          <div className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-3xl font-bold text-white leading-tight">Join 500+ Verified Pro Vendors in PH</h3>
              <p className="text-white/50 leading-relaxed">
                AgriFresh Hub is more than a marketplace. It's an ecosystem built for professional growth. Pro vendors see an average 250% increase in inquiry volume within their first 30 days.
              </p>
            </div>
            
            <div className="space-y-4">
              {[
                "Priority Cold-Chain Verification",
                "Dedicated Account Manager",
                "Featured in Monthly Market Reports",
                "Advanced Inventory Forecasting"
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-leaf/20 text-leaf">
                    <Check className="h-3.5 w-3.5" />
                  </div>
                  <span className="text-sm font-bold text-white/70">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="relative aspect-video rounded-3xl overflow-hidden border border-gold/20 shadow-2xl">
            <img 
              src="https://images.unsplash.com/photo-1592982537447-7440770cbfc9?auto=format&fit=crop&q=80&w=1200" 
              alt="Professional Farmer" 
              className="h-full w-full object-cover opacity-60"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#04110D] via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8 right-8 p-6 rounded-2xl bg-black/60 backdrop-blur-xl border border-white/10">
              <p className="text-sm italic text-white/80 mb-4">
                "Since upgrading to Pro, my farm's visibility in the marketplace has tripled. The bulk inquiry feature alone paid for the subscription in one week."
              </p>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gold/20 flex items-center justify-center text-gold font-black">EE</div>
                <div className="text-left">
                  <div className="text-xs font-bold text-white">Ebiere Emmanuel</div>
                  <div className="text-[10px] text-white/40 uppercase tracking-widest font-black">Founder, Rivers Green Produce</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
