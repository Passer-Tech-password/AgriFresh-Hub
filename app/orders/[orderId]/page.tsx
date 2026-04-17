"use client";

import * as React from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, Package, CheckCircle2 } from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";

import { Button } from "@/components/ui/button";
import { RequireAuth } from "@/components/require-auth";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import type { OrderDoc } from "@/types/order";

export default function OrderDetailsPage() {
  const params = useParams<{ orderId: string }>();
  const [order, setOrder] = React.useState<OrderDoc | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!params?.orderId) return;
    const unsub = onSnapshot(doc(db, "orders", params.orderId), (snap) => {
      if (snap.exists()) {
        setOrder({ ...snap.data(), id: snap.id } as OrderDoc);
      }
      setLoading(false);
    });
    return () => unsub();
  }, [params?.orderId]);

  if (loading) return <div className="p-20 text-center text-white/40">Loading order details…</div>;
  if (!order) return <div className="p-20 text-center text-white/40">Order not found.</div>;

  return (
    <RequireAuth>
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="space-y-4">
            <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-leaf transition-colors">
              <ArrowLeft className="h-4 w-4" />
              Back to Orders
            </Link>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="font-display text-4xl font-bold text-white">Order Details</h1>
              <div className="px-4 py-1.5 rounded-full bg-leaf/10 text-leaf text-xs font-black uppercase tracking-widest border border-leaf/20">
                {order.status}
              </div>
            </div>
          </header>

          <div className="grid gap-6 md:grid-cols-2">
            <section className="rounded-3xl border border-forest/20 bg-black/20 p-8 space-y-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Order Info</h3>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm text-white/40">Order ID</span>
                  <span className="text-sm text-white font-mono">{order.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/40">Date</span>
                  <span className="text-sm text-white">{order.createdAt.toDate().toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-white/40">Total Amount</span>
                  <span className="text-lg font-bold text-leaf">{formatNairaFromKobo(order.amountKobo)}</span>
                </div>
              </div>
            </section>

            <section className="rounded-3xl border border-forest/20 bg-black/20 p-8 space-y-6">
              <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest">Items</h3>
              <div className="space-y-4">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between items-center">
                    <div className="space-y-0.5">
                      <div className="text-sm font-bold text-white">{item.name}</div>
                      <div className="text-xs text-white/40">{item.quantity} {item.unit} @ {formatNairaFromKobo(item.priceKobo)}</div>
                    </div>
                    <div className="text-sm font-bold text-white">{formatNairaFromKobo(item.priceKobo * item.quantity)}</div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
