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
  Zap,
  Star,
  ShieldCheck,
  ChevronRight,
  Truck,
  ArrowRight,
  Info,
  BarChart3
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  limit, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";

import { useAuthStore, useIsPro } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ProductDoc } from "@/types/product";
import type { BulkInquiryDoc, OrderDoc, OrderStatus } from "@/types/order";
import type { VoteDoc } from "@/types/votes";
import { toast } from "sonner";

export default function VendorDashboardPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const isPro = useIsPro();

  const [stats, setStats] = React.useState({
    todaySales: "₦0",
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
    const qInquiries = query(collection(db, "bulkInquiries"), where("vendorId", "==", user.uid), limit(3));
    const unsubInquiries = onSnapshot(qInquiries, (snap) => {
      setInquiries(snap.docs.map(d => ({ ...d.data(), id: d.id }) as BulkInquiryDoc));
    });

    // 3. Fetch Orders
    const qOrders = query(
      collection(db, "orders"), 
      where("items", "array-contains-any", [{ vendorId: user.uid }]),
      orderBy("createdAt", "desc"),
      limit(5)
    );
    const unsubOrders = onSnapshot(qOrders, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }) as OrderDoc));
    });

    // 4. Fetch Votes
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

  const OVERVIEW_CARDS = [
    { label: "Today's Sales", value: "₦142,500", icon: TrendingUp, color: "text-leaf", bg: "bg-leaf/10" },
    { label: "Orders Fulfilled", value: "84", icon: CheckCircle2, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Average Rating", value: stats.avgRating.toFixed(2), icon: Star, color: "text-gold", bg: "bg-gold/10", badge: "TOP 1%" },
    { label: "Cold-Chain Perf.", value: `${stats.coldChainPerf}%`, icon: Thermometer, color: "text-rose-400", bg: "bg-rose-400/10" },
  ];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Welcome Section */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Store <span className="text-leaf">Overview</span>.
          </h1>
          <p className="text-sm text-white/50">
            Welcome back, {userDoc?.displayName}. Your farm business is growing!
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/vendor/products/new">
            <Button className="group rounded-2xl h-12 px-6 shadow-[0_10px_30px_rgba(74,222,128,0.2)]">
              <Plus className="mr-2 h-4 w-4 transition-transform group-hover:rotate-90" />
              Add Product Listing
            </Button>
          </Link>
          {!isPro && (
            <Link href="/vendor/pro">
              <Button variant="secondary" className="rounded-2xl h-12 border-gold/30 text-gold bg-gold/5 hover:bg-gold/10">
                <Zap className="mr-2 h-4 w-4 fill-gold" />
                Go Pro
              </Button>
            </Link>
          )}
        </div>
      </header>

      {/* KPI Cards */}
      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {OVERVIEW_CARDS.map((card, i) => (
          <div key={i} className="group relative overflow-hidden rounded-[32px] border border-forest/20 bg-black/20 p-6 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift hover:-translate-y-1">
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
        {/* Main Feed */}
        <div className="space-y-8">
          {/* Recent Orders */}
          <section className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <Truck className="h-5 w-5 text-leaf" />
                  Recent Sales
                </h2>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Latest retail orders</p>
              </div>
              <Link href="/vendor/orders">
                <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 h-10 rounded-xl">
                  View All
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="divide-y divide-white/5">
              {loading ? (
                <div className="p-12 text-center text-sm text-white/30 animate-pulse">Loading orders...</div>
              ) : orders.length === 0 ? (
                <div className="p-12 text-center text-sm text-white/30 italic">No recent sales.</div>
              ) : orders.map((order) => (
                <div key={order.id} className="p-6 transition-colors hover:bg-white/[0.02] group">
                  <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-white uppercase tracking-wider text-sm">#{order.id?.slice(-6)}</span>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                          order.status === "paid" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-leaf/10 text-leaf border-leaf/20"
                        )}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-xs text-white/40">{order.items.length} items · {formatNairaFromKobo(order.amountKobo)}</p>
                    </div>

                    <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
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
                      <Link href={`/orders/${order.id}/track`}>
                        <Button variant="secondary" size="sm" className="h-9 w-9 p-0 rounded-xl border border-white/5">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Pending Inquiries */}
          <section className="rounded-[40px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="space-y-1">
                <h2 className="font-display text-2xl font-bold text-white flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-gold" />
                  Bulk Inquiries
                </h2>
                <p className="text-[10px] text-white/30 uppercase tracking-widest font-black">Negotiations & Quotes</p>
              </div>
              <Link href="/vendor/inquiries">
                <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 h-10 rounded-xl">
                  Manage Inquiries
                  <ArrowUpRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>
            
            <div className="divide-y divide-white/5">
              {inquiries.length === 0 ? (
                <div className="p-12 text-center text-sm text-white/30 italic">No pending bulk requests.</div>
              ) : inquiries.map((inq) => (
                <div key={inq.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="space-y-1">
                      <div className="text-lg font-bold text-white">{inq.productName}</div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm text-leaf font-black">{inq.requestedQty} Units</span>
                        <span className="h-1 w-1 rounded-full bg-white/20" />
                        <span className="text-[10px] font-bold text-gold uppercase tracking-widest border border-gold/20 bg-gold/5 px-2 py-0.5 rounded-full">{inq.status}</span>
                      </div>
                    </div>
                    <Link href="/vendor/inquiries">
                      <Button variant="secondary" size="sm" className="h-9 rounded-xl border border-white/5 group">
                        Review Quote
                        <ChevronRight className="ml-2 h-3 w-3 transition-transform group-hover:translate-x-1" />
                      </Button>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar Widgets */}
        <aside className="space-y-8">
          {/* Trust Score Card */}
          <section className="rounded-[40px] border border-gold/20 bg-gradient-to-b from-gold/10 to-transparent p-8 backdrop-blur shadow-2xl space-y-8">
            <div className="space-y-2 text-center">
              <div className="relative mx-auto inline-flex h-20 w-20 items-center justify-center rounded-[28px] bg-gold/10 text-gold mb-2">
                <div className="absolute inset-0 animate-pulse rounded-[28px] bg-gold/20 blur-xl" />
                <Star className="relative h-10 w-10 fill-current" />
              </div>
              <h3 className="font-display text-2xl font-bold text-white">Trust Ranking</h3>
              <p className="text-[10px] text-white/30 font-black uppercase tracking-widest">Community impact score</p>
            </div>

            <div className="space-y-3">
              {[
                { label: "Reliability", count: votes.filter(v => v.category === "Highest Reliability").length, color: "bg-blue-400" },
                { label: "Quality", count: votes.filter(v => v.category === "Trusted Quality").length, color: "bg-gold" },
                { label: "Service", count: votes.filter(v => v.category === "Best Customer Service").length, color: "bg-leaf" },
              ].map((cat, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-widest">
                    <span className="text-white/50">{cat.label}</span>
                    <span className="text-white">{cat.count} Votes</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={cn("h-full transition-all duration-1000", cat.color)} 
                      style={{ width: `${Math.min((cat.count / 20) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <Link href="/vendor/votes" className="block">
              <Button variant="ghost" className="w-full h-10 rounded-xl border border-white/5 text-[10px] font-black uppercase tracking-widest">
                View All Votes
              </Button>
            </Link>
          </section>

          {/* Quick Analytics Mini-Card */}
          <section className="rounded-[32px] border border-forest/20 bg-black/40 p-6 space-y-4">
            <div className="flex items-center gap-2 text-leaf">
              <BarChart3 className="h-4 w-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Sales Trend</span>
            </div>
            <div className="flex items-end gap-1 h-12">
              {[30, 45, 25, 60, 40, 75, 50, 90, 65, 80].map((h, i) => (
                <div 
                  key={i} 
                  className="flex-1 bg-leaf/20 rounded-t-sm transition-all hover:bg-leaf" 
                  style={{ height: `${h}%` }}
                />
              ))}
            </div>
            <div className="flex items-center justify-between text-[10px] font-bold text-white/30">
              <span>Last 10 Days</span>
              <span className="text-leaf">+12.5%</span>
            </div>
          </section>

          {/* Support Widget */}
          <section className="rounded-[32px] border border-forest/20 bg-black/20 p-6 space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-forest/20 text-leaf">
                <Info className="h-5 w-5" />
              </div>
              <div className="space-y-0.5">
                <div className="text-xs font-bold text-white">Need help?</div>
                <div className="text-[10px] text-white/40">Agri-Tech Support is online</div>
              </div>
            </div>
            <Button variant="secondary" size="sm" className="w-full h-9 rounded-xl border-white/5 text-[10px] font-black uppercase tracking-widest">
              Open Support Chat
            </Button>
          </section>
        </aside>
      </div>
    </div>
  );
}
