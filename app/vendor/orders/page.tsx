"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/require-auth";

export default function VendorOrdersPage() {
  return (
    <RequireAuth requireRole="vendor_approved">
      <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <Link href="/vendor/dashboard" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-leaf transition-colors">
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
              <h1 className="font-display text-4xl font-bold text-white">Manage Orders</h1>
            </div>
          </header>

          <div className="rounded-[40px] border border-forest/20 bg-black/20 p-20 text-center space-y-4">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/20">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="text-xl font-bold text-white">No orders yet</h2>
            <p className="text-sm text-white/40 max-w-sm mx-auto">When customers purchase your products, they will appear here for processing.</p>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
