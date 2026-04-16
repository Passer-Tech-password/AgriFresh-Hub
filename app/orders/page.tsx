"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowRight, 
  Clock, 
  Truck, 
  CheckCircle2, 
  Package, 
  ChevronRight,
  MapPin,
  Thermometer,
  Zap,
  Search,
  Filter,
  AlertCircle
} from "lucide-react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OrderDoc, OrderStatus } from "@/types/order";

const STATUS_CONFIG: Record<OrderStatus, { label: string; icon: any; color: string; bg: string }> = {
  pending: { label: "Pending Payment", icon: Clock, color: "text-gold", bg: "bg-gold/10 border-gold/20" },
  paid: { label: "Paid & Verified", icon: Zap, color: "text-blue-400", bg: "bg-blue-400/10 border-blue-400/20" },
  packed: { label: "Packed & Ready", icon: Package, color: "text-leaf", bg: "bg-leaf/10 border-leaf/20" },
  shipped: { label: "In Transit", icon: Truck, color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/20" },
  delivered: { label: "Delivered", icon: CheckCircle2, color: "text-leaf", bg: "bg-leaf/10 border-leaf/20" },
  cancelled: { label: "Cancelled", icon: AlertCircle, color: "text-white/30", bg: "bg-white/5 border-white/10" },
};

export default function OrdersPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const [orders, setOrders] = React.useState<OrderDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<"all" | "retail" | "bulk">("all");

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "orders"), 
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }) as OrderDoc));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  const filteredOrders = orders.filter(o => activeTab === "all" || o.type === activeTab);

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
        <div className="space-y-12">
          {/* Header */}
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf/25 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-leaf backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
                Purchase History
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                My <span className="text-leaf">Orders</span>.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/50">
                Track your retail and bulk purchases from farm to door with real-time cold-chain monitoring.
              </p>
            </div>
            
            <div className="flex bg-white/5 p-1 rounded-2xl border border-white/5">
              {(["all", "retail", "bulk"] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    activeTab === tab ? "bg-leaf text-forest shadow-xl" : "text-white/40 hover:text-white"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>
          </header>

          {loading ? (
            <div className="grid gap-6">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex flex-col gap-4 animate-pulse p-8 rounded-[32px] border border-white/5 bg-white/5">
                  <div className="flex items-center justify-between">
                    <div className="h-6 w-32 bg-white/5 rounded-lg" />
                    <div className="h-8 w-24 bg-white/5 rounded-full" />
                  </div>
                  <div className="h-10 w-3/4 bg-white/5 rounded-xl" />
                  <div className="flex items-center gap-4">
                    <div className="h-4 w-24 bg-white/5 rounded-lg" />
                    <div className="h-4 w-24 bg-white/5 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <section className="flex flex-col items-center justify-center py-32 text-center space-y-8 rounded-[40px] border border-dashed border-forest/20 bg-black/10">
              <div className="p-8 rounded-full bg-forest/20 text-leaf">
                <ShoppingBag className="h-16 w-16" />
              </div>
              <div className="space-y-3">
                <h2 className="font-display text-2xl font-bold text-white">No orders yet</h2>
                <p className="text-sm text-white/40 max-w-sm mx-auto">
                  You haven't placed any {activeTab !== "all" ? activeTab : ""} orders yet. Visit the marketplace to explore fresh produce.
                </p>
              </div>
              <Link href="/marketplace">
                <Button size="lg" className="rounded-2xl px-10">Start Shopping</Button>
              </Link>
            </section>
          ) : (
            <div className="grid gap-6">
              {filteredOrders.map((order) => {
                const config = STATUS_CONFIG[order.status];
                return (
                  <div 
                    key={order.id}
                    className="group relative flex flex-col overflow-hidden rounded-[32px] border border-forest/20 bg-black/20 backdrop-blur transition-all hover:border-leaf/30"
                  >
                    <div className="p-8">
                      <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
                        {/* Status & ID */}
                        <div className="flex-1 space-y-4">
                          <div className="flex items-center gap-4">
                            <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-widest", config.bg, config.color)}>
                              <config.icon className="h-3 w-3" />
                              {config.label}
                            </div>
                            {order.type === "bulk" && (
                              <div className="rounded-full bg-blue-500/10 border border-blue-500/20 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-blue-300">
                                Bulk Order
                              </div>
                            )}
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-display text-xl font-bold text-white">Order #{order.id?.slice(-8).toUpperCase()}</h3>
                            <p className="text-xs text-white/30 font-bold uppercase tracking-widest">Placed on {order.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                          </div>
                        </div>

                        {/* Items Preview */}
                        <div className="flex flex-1 items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-forest/20 border border-white/5">
                              <span className="text-xs font-black text-leaf">{item.quantity}{item.unit[0]}</span>
                            </div>
                          ))}
                        </div>

                        {/* Pricing & Actions */}
                        <div className="flex flex-col items-end gap-4 lg:min-w-[200px]">
                          <div className="text-right">
                            <div className="text-2xl font-black text-white">{formatNairaFromKobo(order.amountKobo)}</div>
                            <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{order.items.length} items</div>
                          </div>
                          <div className="flex gap-2">
                            {order.status !== "pending" && order.status !== "cancelled" && (
                              <Link href={`/orders/${order.id}/track`}>
                                <Button variant="primary" size="sm" className="rounded-xl px-6 shadow-xl shadow-leaf/10">
                                  Track Live
                                  <MapPin className="ml-2 h-4 w-4" />
                                </Button>
                              </Link>
                            )}
                            <Link href={`/orders/${order.id}`}>
                              <Button variant="secondary" size="sm" className="rounded-xl border-white/10 text-white/60">Details</Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                    {/* Traceability Indicator */}
                    {order.requiresColdChain && (
                      <div className="bg-blue-500/5 px-8 py-3 flex items-center justify-between border-t border-white/5">
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400">
                          <Thermometer className="h-3 w-3" />
                          Cold-Chain Monitoring Active
                        </div>
                        {order.currentTemp && (
                          <div className="text-[10px] font-black text-white">{order.currentTemp}°C</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}
