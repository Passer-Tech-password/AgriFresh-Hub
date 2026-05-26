"use client";

import * as React from "react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot, 
  orderBy, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from "firebase/firestore";
import { 
  ShoppingBag, 
  Truck, 
  CheckCircle2, 
  Package, 
  Calendar, 
  User, 
  ArrowRight,
  Filter,
  Search,
  Clock,
  ArrowLeft
} from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { OrderDoc, OrderStatus } from "@/types/order";

const STATUS_FILTERS: Array<{ label: string, value: OrderStatus | "all" }> = [
  { label: "All Orders", value: "all" },
  { label: "Paid", value: "paid" },
  { label: "Packed", value: "packed" },
  { label: "Shipped", value: "shipped" },
  { label: "Delivered", value: "delivered" },
];

export default function VendorOrdersPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const [orders, setOrders] = React.useState<OrderDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<OrderStatus | "all">("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    
    // In a real app, you'd use a more specific query for vendor-related orders
    const q = query(
      collection(db, "orders"), 
      where("items", "array-contains-any", [{ vendorId: user.uid }]),
      orderBy("createdAt", "desc")
    );
    
    const unsub = onSnapshot(q, (snap) => {
      setOrders(snap.docs.map(d => ({ ...d.data(), id: d.id }) as OrderDoc));
      setLoading(false);
    });
    
    return () => unsub();
  }, [user]);

  async function updateStatus(orderId: string, status: OrderStatus) {
    setBusyId(orderId);
    try {
      await updateDoc(doc(db, "orders", orderId), { 
        status, 
        updatedAt: serverTimestamp() 
      });
      toast.success(`Order #${orderId.slice(-6)} marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredOrders = orders.filter(order => {
    const matchesStatus = activeFilter === "all" ? true : order.status === activeFilter;
    const matchesSearch = order.id?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Order <span className="text-leaf">Management</span>.
          </h1>
          <p className="text-sm text-white/50">
            Process sales and track fulfillment status.
          </p>
        </div>
      </header>

      {/* Filters & Search */}
      <section className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2 p-1 rounded-2xl border border-forest/20 bg-black/20 backdrop-blur w-fit">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setActiveFilter(f.value)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all",
                activeFilter === f.value ? "bg-leaf text-[#04110D] shadow-lift" : "text-white/40 hover:text-white"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="relative w-full lg:w-72">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search Order ID..." 
            className="h-12 pl-12 rounded-2xl border-forest/20 bg-black/20 focus:ring-leaf/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Orders List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 animate-pulse rounded-[32px] bg-white/5 border border-forest/10" />
          ))}
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="rounded-[40px] border border-forest/20 bg-black/20 p-20 text-center space-y-6 backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/5 text-white/20">
            <ShoppingBag className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No orders found</h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              {activeFilter === "all" ? "You haven't received any orders yet." : `No ${activeFilter} orders found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="group relative flex flex-col gap-6 rounded-[32px] border border-forest/25 bg-black/20 p-6 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift lg:flex-row lg:items-center lg:justify-between"
            >
              <div className="flex flex-wrap items-center gap-8">
                {/* Order ID & Status */}
                <div className="space-y-1 min-w-[140px]">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-white uppercase tracking-wider">#{order.id?.slice(-6)}</span>
                  </div>
                  <span className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                    order.status === "paid" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : 
                    order.status === "delivered" ? "bg-leaf/10 text-leaf border-leaf/20" : "bg-white/5 text-white/40 border-white/10"
                  )}>
                    {order.status}
                  </span>
                </div>

                {/* Date & Buyer */}
                <div className="space-y-1 min-w-[160px]">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    {order.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short' })}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-bold text-white/70">
                    <User className="h-4 w-4" />
                    Verified Buyer
                  </div>
                </div>

                {/* Items & Total */}
                <div className="space-y-1 min-w-[120px]">
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <Package className="h-3 w-3" />
                    {order.items.length} Items
                  </div>
                  <div className="text-lg font-black text-white">{formatNairaFromKobo(order.amountKobo)}</div>
                </div>
              </div>

              {/* Action Area */}
              <div className="flex items-center gap-3">
                <div className="flex flex-wrap gap-2">
                  {order.status === "paid" && (
                    <Button 
                      size="sm" 
                      className="rounded-xl h-10 px-6"
                      onClick={() => updateStatus(order.id!, "packed")}
                      disabled={busyId === order.id}
                    >
                      Mark Packed
                    </Button>
                  )}
                  {order.status === "packed" && (
                    <Button 
                      size="sm" 
                      className="rounded-xl h-10 px-6 bg-blue-500 hover:bg-blue-600"
                      onClick={() => updateStatus(order.id!, "shipped")}
                      disabled={busyId === order.id}
                    >
                      <Truck className="mr-2 h-4 w-4" />
                      Dispatch
                    </Button>
                  )}
                  {order.status === "shipped" && (
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="rounded-xl h-10 px-6"
                      onClick={() => updateStatus(order.id!, "delivered")}
                      disabled={busyId === order.id}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Mark Delivered
                    </Button>
                  )}
                </div>
                
                <Link href={`/orders/${order.id}/track`}>
                  <Button variant="ghost" size="sm" className="h-10 w-10 p-0 rounded-xl border border-white/5 hover:border-leaf/30 group">
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
