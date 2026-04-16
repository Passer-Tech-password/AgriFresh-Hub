"use client";

import * as React from "react";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  CheckCircle2, 
  Thermometer, 
  Package, 
  MessageSquare, 
  Users, 
  ArrowUpRight,
  Plus,
  Search,
  LayoutGrid,
  Zap,
  Star,
  ShieldCheck,
  History,
  Clock,
  ChevronRight,
  Truck,
  ArrowRight
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  getDocs,
  limit,
  orderBy,
  doc,
  updateDoc,
  serverTimestamp
} from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductDoc } from "@/types/product";
import type { BulkInquiryDoc, OrderDoc, OrderStatus } from "@/types/order";
import type { VoteDoc } from "@/types/votes";
import { toast } from "sonner";

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);

  const [stats, setStats] = React.useState({
    todaySales: 0,
    fulfilledOrders: 0,
    avgRating: 4.98,
    coldChainPerf: 92,
    totalVotes: 0
  });

  const [products, setProducts] = React.useState<Array<ProductDoc & { id: string }>>([]);
  const [inquiries, setInquiries] = React.useState<BulkInquiryDoc[]>([]);
  const [orders, setOrders] = React.useState<OrderDoc[]>([]);
  const [votes, setVotes] = React.useState<VoteDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;

    // 1. Fetch Products
    const qProducts = query(collection(db, "products"), where("vendorId", "==", user.uid), limit(5));
    const unsubProducts = onSnapshot(qProducts, (snap) => {
      setProducts(snap.docs.map(d => ({ ...d.data(), id: d.id }) as ProductDoc & { id: string }));
    });

    // 2. Fetch Bulk Inquiries
    const qInquiries = query(collection(db, "bulkInquiries"), where("vendorId", "==", user.uid), limit(5));
    const unsubInquiries = onSnapshot(qInquiries, (snap) => {
      setInquiries(snap.docs.map(d => ({ ...d.data(), id: d.id }) as BulkInquiryDoc));
    });

    // 3. Fetch Orders (Incoming sales)
    const qOrders = query(
      collection(db, "orders"), 
      where("items", "array-contains-any", [{ vendorId: user.uid }]), // Simplification for MVP
      orderBy("createdAt", "desc"),
      limit(10)
    );
    // In a real app, you'd filter orders containing items from this vendor on the server or use a subcollection.
    // For MVP, we'll fetch orders where the vendor is involved.
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }) as OrderDoc));
    });

    // 4. Fetch Votes (My community impact)
    const qVotes = query(collection(db, "votes"), where("vendorUid", "==", user.uid));
    const unsubVotes = onSnapshot(qVotes, (snap) => {
      const voteData = snap.docs.map(d => ({ ...d.data(), id: d.id }) as VoteDoc);
      setVotes(voteData);
      setStats(prev => ({ ...prev, totalVotes: voteData.length }));
    });

    setLoading(false);

    return () => {
      unsubProducts();
      unsubInquiries();
      unsubOrders();
      unsubVotes();
    };
  }, [user]);

  async function updateOrderStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Order status updated to ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  async function updateInquiryStatus(inqId: string, status: BulkInquiryDoc["status"]) {
    setBusyId(inqId);
    try {
      await updateDoc(doc(db, "bulkInquiries", inqId), { 
        status, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Inquiry marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  const OVERVIEW_CARDS = [
    { label: "Today's Sales", value: "₦142,500", icon: TrendingUp, color: "text-leaf", bg: "bg-leaf/10" },
    { label: "Orders Fulfilled", value: "84", icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Average Rating", value: stats.avgRating.toFixed(2), icon: Star, color: "text-gold", bg: "bg-gold/10", badge: "TOP 1%" },
    { label: "Cold-Chain Perf.", value: `${stats.coldChainPerf}%`, icon: Thermometer, color: "text-rose-400", bg: "bg-rose-400/10" },
  ];

  return (
    <RequireAuth requireRole="vendor_approved">
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
        <div className="space-y-10">
          {/* Header */}
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-leaf backdrop-blur">
                <ShieldCheck className="h-3 w-3" />
                Verified Vendor
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                Store <span className="text-leaf">Insights</span>.
              </h1>
              <p className="text-sm text-white/50">
                Welcome back, {userDoc?.displayName}. Here's how your farm business is performing today.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Link href="/vendor/products/new">
                <Button className="rounded-2xl h-12 px-6">
                  <Plus className="mr-2 h-4 w-4" />
                  Add New Product
                </Button>
              </Link>
              <Link href="/profile">
                <Button variant="secondary" className="rounded-2xl h-12 border-white/10 text-white/60">
                  Settings
                </Button>
              </Link>
            </div>
          </header>

          {/* Overview Grid */}
          <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {OVERVIEW_CARDS.map((card, i) => (
              <div key={i} className="group relative overflow-hidden rounded-[32px] border border-forest/20 bg-black/20 p-6 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift">
                <div className="relative z-10 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={cn("p-3 rounded-2xl", card.bg, card.color)}>
                      <card.icon className="h-6 w-6" />
                    </div>
                    {card.badge && (
                      <span className="rounded-full bg-gold/10 px-2 py-0.5 text-[9px] font-black uppercase tracking-widest text-gold border border-gold/20">
                        {card.badge}
                      </span>
                    )}
                  </div>
                  <div className="space-y-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{card.label}</div>
                    <div className="text-3xl font-black text-white">{card.value}</div>
                  </div>
                </div>
                <div className="absolute -right-4 -bottom-4 h-24 w-24 rounded-full bg-white/[0.02] transition-transform group-hover:scale-150" />
              </div>
            ))}
          </section>

          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            {/* Main Content Area */}
            <div className="space-y-8">
              {/* Active Orders Management */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                      <Truck className="h-5 w-5 text-leaf" />
                      Active Orders
                    </h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Manage shipping & status</p>
                  </div>
                  <Link href="/vendor/orders">
                    <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 h-10 rounded-xl">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="divide-y divide-white/5">
                  {orders.length === 0 ? (
                    <div className="p-12 text-center text-sm text-white/30 italic">No active orders found.</div>
                  ) : orders.map((order) => (
                    <div key={order.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center gap-3">
                            <span className="font-bold text-white uppercase tracking-wider text-sm">Order #{order.id?.slice(-6)}</span>
                            <span className={cn(
                              "rounded-full px-2 py-0.5 text-[9px] font-black uppercase",
                              order.status === "paid" ? "bg-blue-500/10 text-blue-300" : "bg-leaf/10 text-leaf"
                            )}>
                              {order.status}
                            </span>
                          </div>
                          <p className="text-xs text-white/40">{order.items.length} items · {formatNairaFromKobo(order.amountKobo)}</p>
                        </div>

                        <div className="flex items-center gap-3">
                          {order.status === "paid" && (
                            <Button 
                              size="sm" 
                              className="rounded-xl h-9"
                              onClick={() => updateOrderStatus(order.id!, "packed")}
                              disabled={busyId === order.id}
                            >
                              Mark Packed
                            </Button>
                          )}
                          {order.status === "packed" && (
                            <Button 
                              size="sm" 
                              className="rounded-xl h-9 bg-blue-500 hover:bg-blue-600"
                              onClick={() => updateOrderStatus(order.id!, "shipped")}
                              disabled={busyId === order.id}
                            >
                              Dispatch Order
                            </Button>
                          )}
                          {order.status === "shipped" && (
                            <Button 
                              size="sm" 
                              variant="secondary"
                              className="rounded-xl h-9"
                              onClick={() => updateOrderStatus(order.id!, "delivered")}
                              disabled={busyId === order.id}
                            >
                              Confirm Delivery
                            </Button>
                          )}
                          <Link href={`/orders/${order.id}/track`}>
                            <Button variant="ghost" size="sm" className="h-9 w-9 p-0 rounded-xl border border-white/5">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Recent Bulk Inquiries */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                      <Users className="h-5 w-5 text-leaf" />
                      Bulk Requests
                    </h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Negotiations & Quotes</p>
                  </div>
                  <Link href="/vendor/inquiries">
                    <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 h-10 rounded-xl">
                      View All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="divide-y divide-white/5">
                  {inquiries.length === 0 ? (
                    <div className="p-12 text-center text-sm text-white/30 italic">No pending requests.</div>
                  ) : inquiries.map((inq) => (
                    <div key={inq.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="text-lg font-bold text-white">{inq.productName}</div>
                          <div className="flex items-center gap-3">
                            <span className="text-sm text-leaf font-black">{inq.requestedQty} Units</span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span className="text-[10px] font-bold text-gold uppercase tracking-widest">{inq.status}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {inq.status === "pending" && (
                            <Button 
                              size="sm" 
                              variant="secondary" 
                              className="rounded-xl h-9"
                              onClick={() => updateInquiryStatus(inq.id!, "negotiating")}
                              disabled={busyId === inq.id}
                            >
                              Negotiate
                            </Button>
                          )}
                          <Link href="/vendor/inquiries">
                            <Button variant="ghost" size="sm" className="h-9 rounded-xl border border-white/5">Details</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              {/* Inventory Summary */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
                <div className="p-8 border-b border-white/5 flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                      <Package className="h-5 w-5 text-leaf" />
                      Inventory
                    </h2>
                    <p className="text-xs text-white/40 uppercase tracking-widest font-bold">Manage listings & bulk limits</p>
                  </div>
                  <Link href="/vendor/products">
                    <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 h-10 rounded-xl">
                      Manage All
                      <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </div>

                <div className="divide-y divide-white/5">
                  {products.map((p) => (
                    <div key={p.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="space-y-1">
                          <div className="font-bold text-white">{p.name}</div>
                          <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-white/30">
                            <span>MOQ: {p.moq} {p.unit}</span>
                            <span className="h-1 w-1 rounded-full bg-white/20" />
                            <span>Stock: {p.stock}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right">
                            <div className="text-sm font-black text-white">{formatNairaFromKobo(p.priceKobo)}</div>
                            <div className="text-[9px] font-bold uppercase text-white/30">per {p.unit}</div>
                          </div>
                          <Link href={`/vendor/products/edit/${p.id}`}>
                            <Button variant="secondary" size="sm" className="h-9 rounded-xl border-white/5">Edit</Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* Sidebar Stats */}
            <aside className="space-y-8">
              {/* Community Trust Section */}
              <section className="rounded-[40px] border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-8 backdrop-blur shadow-2xl space-y-8">
                <div className="space-y-2 text-center">
                  <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-gold/10 text-gold mb-2 shadow-[0_0_30px_rgba(245,195,0,0.2)]">
                    <Star className="h-8 w-8 fill-current" />
                  </div>
                  <h3 className="font-display text-2xl font-bold text-white">Community Trust</h3>
                  <p className="text-xs text-white/40 font-bold uppercase tracking-widest">Your total impact votes</p>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  {[
                    { label: "Reliability", icon: ShieldCheck, color: "text-blue-400", count: votes.filter(v => v.category === "Highest Reliability").length },
                    { label: "Service", icon: MessageSquare, color: "text-leaf", count: votes.filter(v => v.category === "Best Customer Service").length },
                    { label: "Quality", icon: Star, color: "text-gold", count: votes.filter(v => v.category === "Trusted Quality").length },
                  ].map((cat, i) => (
                    <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-black/40 border border-white/5">
                      <div className="flex items-center gap-3">
                        <cat.icon className={cn("h-4 w-4", cat.color)} />
                        <span className="text-sm font-bold text-white/70">{cat.label}</span>
                      </div>
                      <span className="text-lg font-black text-white">{cat.count}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-white/5">
                  <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                    <span>Current Rank</span>
                    <span className="text-gold font-black">#4 Overall</span>
                  </div>
                </div>
              </section>

              {/* Bulk Handling Notice */}
              <section className="rounded-[40px] border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur shadow-lift space-y-6">
                <div className="flex gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/10 text-blue-400">
                    <Zap className="h-6 w-6 fill-current" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white uppercase tracking-wider">Bulk Capacity</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      You are verified to handle orders up to <span className="text-blue-300 font-bold">20 Tons</span>.
                    </p>
                  </div>
                </div>
                <div className="h-2 w-full rounded-full bg-blue-500/10 overflow-hidden">
                  <div className="h-full w-[65%] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                </div>
                <p className="text-[10px] text-white/30 italic text-center uppercase font-bold tracking-widest">
                  Current Capacity Utilization: 65%
                </p>
              </section>

              {/* Support & Docs */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">Vendor Resources</h3>
                <div className="space-y-4">
                  <Link href="/vendor/apply" className="flex items-center justify-between group">
                    <span className="text-sm text-white/60 group-hover:text-leaf transition-colors">Re-verify Documents</span>
                    <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-leaf transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link href="/support" className="flex items-center justify-between group">
                    <span className="text-sm text-white/60 group-hover:text-leaf transition-colors">Contact Agri-Tech Support</span>
                    <ChevronRight className="h-4 w-4 text-white/20 group-hover:text-leaf transition-transform group-hover:translate-x-1" />
                  </Link>
                </div>
              </section>
            </aside>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
