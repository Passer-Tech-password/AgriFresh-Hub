"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { doc, onSnapshot } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import type { OrderDoc } from "@/types/order";

export default function OrderTrackingPage() {
  const params = useParams<{ id: string }>();
  const [order, setOrder] = React.useState<OrderDoc | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!params?.id) return;
    const unsub = onSnapshot(doc(db, "orders", params.id), (snap) => {
      if (snap.exists()) {
        setOrder({ ...snap.data(), id: snap.id } as OrderDoc);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [params?.id]);

  if (loading) return <div className="p-20 text-center text-white/40">Connecting to tracking server…</div>;
  if (!order) return <div className="p-20 text-center text-white/40">Order not found.</div>;

  const temp = order.currentTemp ?? 4.2; // Mock if not set

  return (
    <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="space-y-8">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs text-leaf backdrop-blur">
              Live Tracking
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
              Order #{order.id?.slice(-6).toUpperCase()}
            </h1>
          </div>
          <div className={`px-4 py-2 rounded-2xl text-sm font-bold uppercase tracking-widest ${
            order.status === "shipped" ? "bg-blue-500/20 text-blue-300" :
            order.status === "delivered" ? "bg-leaf/20 text-leaf" : "bg-white/10 text-white/40"
          }`}>
            {order.status}
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-2">
          {/* Temperature Gauge */}
          <section className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur flex flex-col items-center justify-center text-center">
            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest mb-8">Cold-Chain Monitor</h3>
            <div className="relative h-48 w-48 flex items-center justify-center">
              {/* Glowing ring */}
              <div className={`absolute inset-0 rounded-full border-4 border-dashed animate-[spin_10s_linear_infinite] ${
                temp < 8 ? "border-blue-400/30" : "border-orange-400/30"
              }`} />
              <div className={`absolute inset-4 rounded-full border-2 ${
                temp < 8 ? "border-blue-400 shadow-[0_0_30px_rgba(96,165,250,0.4)]" : "border-orange-400 shadow-[0_0_30px_rgba(251,146,60,0.4)]"
              }`} />
              
              <div className="relative">
                <div className="text-5xl font-bold text-white">{temp}°C</div>
                <div className="text-[10px] text-white/40 font-bold uppercase mt-1">Optimal Range</div>
              </div>
            </div>
            <p className="mt-8 text-sm text-white/60">
              Sensor: <span className="text-white font-medium">IoT-PH-402</span> · Active
            </p>
          </section>

          {/* Logistics & Location */}
          <section className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur space-y-6">
            <div className="space-y-4">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Route Progress</h3>
              <div className="relative pl-8 space-y-8 before:absolute before:left-3 before:top-2 before:bottom-2 before:w-px before:bg-forest/40">
                <div className="relative">
                  <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-leaf shadow-[0_0_10px_rgba(74,222,128,1)]" />
                  <div className="font-semibold text-white">In Transit</div>
                  <div className="text-xs text-white/40">Port Harcourt - Aba Expressway</div>
                </div>
                <div className="relative opacity-40">
                  <div className="absolute -left-6 top-1.5 h-3 w-3 rounded-full bg-white/20" />
                  <div className="font-semibold text-white">Out for Delivery</div>
                  <div className="text-xs text-white/40">Destination Hub</div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-forest/20">
              <div className="text-xs text-white/40 uppercase tracking-widest mb-2">Logistics Note</div>
              <p className="text-sm text-white/70 italic">
                "{order.logisticsNotes || "Standard handle with care."}"
              </p>
            </div>
          </section>
        </div>

        <div className="flex justify-center pt-8">
          <Link href="/dashboard">
            <Button variant="ghost" className="text-white/40 hover:text-white">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}