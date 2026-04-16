"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  Leaf,
  ArrowUpRight
} from "lucide-react";

const FOOTER_LINKS = [
  {
    title: "Marketplace",
    links: [
      { label: "All Products", href: "/marketplace" },
      { label: "Vegetables", href: "/marketplace?category=vegetables" },
      { label: "Livestock", href: "/marketplace?category=livestock" },
      { label: "Frozen Foods", href: "/marketplace?category=frozen%20foods" },
    ]
  },
  {
    title: "Community",
    links: [
      { label: "Vendor Leaderboard", href: "/leaderboard" },
      { label: "Buy Credits", href: "/credits" },
      { label: "Become a Vendor", href: "/vendor/apply" },
      { label: "AgriFresh Pro", href: "/pro" },
    ]
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/support" },
      { label: "Cold-Chain Policy", href: "/policy/cold-chain" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Privacy Policy", href: "/privacy" },
    ]
  }
];

export function Footer() {
  return (
    <footer className="mt-20 border-t border-forest/20 bg-[#071512] pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-24">
          {/* Brand Section */}
          <div className="space-y-8">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/10 text-leaf shadow-[0_0_20px_rgba(74,222,128,0.1)]">
                <Leaf className="h-6 w-6" />
              </div>
              <div>
                <span className="font-display text-2xl font-black tracking-tighter text-white">AgriFresh Hub</span>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">Rivers State Ecosystem</div>
              </div>
            </div>
            
            <p className="max-w-md text-sm leading-relaxed text-white/50">
              Nigeria's premium agri-tech marketplace. Empowering Rivers State farmers with 
              real-time cold-chain tracking and direct-to-buyer logistics.
            </p>

            <div className="flex items-center gap-4">
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-leaf/10 hover:text-leaf">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-leaf/10 hover:text-leaf">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-white/40 transition-all hover:bg-leaf/10 hover:text-leaf">
                <Instagram className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid gap-8 sm:grid-cols-3">
            {FOOTER_LINKS.map((group) => (
              <div key={group.title} className="space-y-6">
                <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">{group.title}</h4>
                <ul className="space-y-4">
                  {group.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="group flex items-center text-sm text-white/60 transition-colors hover:text-leaf">
                        {link.label}
                        <ArrowUpRight className="ml-1 h-3 w-3 opacity-0 transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:opacity-100" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-20 border-t border-white/5 pt-10">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <MapPin className="h-3.5 w-3.5 text-leaf" />
                Port Harcourt, Nigeria
              </div>
              <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-white/30">
                <ShieldCheck className="h-3.5 w-3.5 text-blue-400" />
                Cold-Chain Verified
              </div>
            </div>
            
            <p className="text-[10px] font-bold uppercase tracking-widest text-white/20">
              AgriFresh Hub © 2026 – Port Harcourt, Nigeria
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
