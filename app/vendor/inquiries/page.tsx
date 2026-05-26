"use client";

import * as React from "react";
import { collection, doc, onSnapshot, query, where, updateDoc, serverTimestamp } from "firebase/firestore";
import { toast } from "sonner";
import { 
  MessageSquare, 
  Calendar, 
  User, 
  Package, 
  CheckCircle2, 
  XCircle, 
  MessageCircle,
  Filter,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { BulkInquiryDoc } from "@/types/order";

const FILTERS: Array<{ label: string, value: BulkInquiryDoc["status"] | "all" }> = [
  { label: "All Requests", value: "all" },
  { label: "Pending", value: "pending" },
  { label: "Negotiating", value: "negotiating" },
  { label: "Accepted", value: "accepted" },
  { label: "Fulfilled", value: "fulfilled" },
];

export default function VendorInquiriesPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const [inquiries, setInquiries] = React.useState<BulkInquiryDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeFilter, setActiveFilter] = React.useState<BulkInquiryDoc["status"] | "all">("all");
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "bulkInquiries"), where("vendorId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as BulkInquiryDoc);
      setInquiries(data.sort((a, b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  async function updateStatus(inquiryId: string, status: BulkInquiryDoc["status"]) {
    setBusyId(inquiryId);
    try {
      const ref = doc(db, "bulkInquiries", inquiryId);
      await updateDoc(ref, { status, updatedAt: serverTimestamp() });
      toast.success(`Inquiry marked as ${status}`);
    } catch (err) {
      toast.error("Failed to update status.");
    } finally {
      setBusyId(null);
    }
  }

  const filteredInquiries = inquiries.filter(inq => 
    activeFilter === "all" ? true : inq.status === activeFilter
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Bulk <span className="text-leaf">Inquiries</span>.
          </h1>
          <p className="text-sm text-white/50">
            Manage large quantity requests and B2B negotiations.
          </p>
        </div>
      </header>

      {/* Filter Tabs */}
      <section className="flex flex-wrap gap-2 p-1 rounded-2xl border border-forest/20 bg-black/20 backdrop-blur w-fit">
        {FILTERS.map((f) => (
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
      </section>

      {/* Inquiry List */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-48 animate-pulse rounded-[32px] bg-white/5 border border-forest/10" />
          ))}
        </div>
      ) : filteredInquiries.length === 0 ? (
        <div className="rounded-[40px] border border-forest/20 bg-black/20 p-20 text-center space-y-6 backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/5 text-white/20">
            <MessageSquare className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No inquiries found</h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              {activeFilter === "all" ? "You don't have any bulk requests yet." : `No ${activeFilter} inquiries found.`}
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-6">
          {filteredInquiries.map((inq) => (
            <div
              key={inq.id}
              className="group relative flex flex-col gap-8 rounded-[40px] border border-forest/25 bg-black/20 p-8 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift lg:flex-row lg:items-start lg:justify-between"
            >
              <div className="flex-1 space-y-6">
                {/* Meta Info */}
                <div className="flex flex-wrap items-center gap-4">
                  <span className={cn(
                    "rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest border",
                    inq.status === "pending" ? "bg-gold/10 text-gold border-gold/20" :
                    inq.status === "negotiating" ? "bg-blue-500/10 text-blue-400 border-blue-500/20" :
                    inq.status === "accepted" ? "bg-leaf/10 text-leaf border-leaf/20" : "bg-white/5 text-white/40 border-white/10"
                  )}>
                    {inq.status}
                  </span>
                  <div className="flex items-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                    <Calendar className="h-3 w-3" />
                    {inq.createdAt.toDate().toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </div>
                </div>
                
                {/* Product & Qty */}
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl bg-leaf/10 text-leaf">
                      <Package className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-2xl font-bold text-white">{inq.productName}</h3>
                  </div>
                  <div className="text-3xl font-black text-leaf">
                    {inq.requestedQty} <span className="text-sm font-bold uppercase tracking-widest text-white/30">Requested Units</span>
                  </div>
                </div>

                {/* Buyer Info Placeholder (Real data would come from buyer profile) */}
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-white/5 border border-white/5 w-fit">
                  <div className="h-8 w-8 rounded-lg bg-forest/20 flex items-center justify-center text-white/40">
                    <User className="h-4 w-4" />
                  </div>
                  <div className="text-xs font-bold text-white/70">Verified Business Buyer</div>
                </div>

                {inq.notes && (
                  <div className="relative rounded-3xl bg-black/40 p-6 border border-forest/20 group-hover:border-leaf/20 transition-colors">
                    <div className="absolute -top-3 left-6 px-3 bg-[#071512] text-[9px] font-black uppercase tracking-widest text-white/30 border border-forest/20 rounded-full">
                      Buyer Notes
                    </div>
                    <p className="text-sm text-white/70 italic leading-relaxed">"{inq.notes}"</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3 min-w-[200px]">
                {inq.status === "pending" && (
                  <>
                    <Button 
                      className="w-full h-12 rounded-2xl" 
                      onClick={() => updateStatus(inq.id!, "accepted")}
                      disabled={!!busyId}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Accept Quote
                    </Button>
                    <Button 
                      variant="secondary" 
                      className="w-full h-12 rounded-2xl"
                      onClick={() => updateStatus(inq.id!, "negotiating")}
                      disabled={!!busyId}
                    >
                      <MessageCircle className="mr-2 h-4 w-4" />
                      Negotiate
                    </Button>
                    <Button 
                      variant="ghost" 
                      className="w-full h-12 rounded-2xl text-rose-400 hover:text-rose-300 hover:bg-rose-400/10"
                      onClick={() => updateStatus(inq.id!, "rejected")}
                      disabled={!!busyId}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </>
                )}
                
                {inq.status === "negotiating" && (
                  <Button 
                    className="w-full h-12 rounded-2xl" 
                    onClick={() => updateStatus(inq.id!, "accepted")}
                    disabled={!!busyId}
                  >
                    Accept Final Quote
                  </Button>
                )}

                {inq.status === "accepted" && (
                  <div className="p-6 rounded-3xl bg-leaf/5 border border-leaf/20 text-center space-y-3">
                    <div className="text-[10px] font-black uppercase tracking-widest text-leaf">Status: Accepted</div>
                    <p className="text-xs text-white/50 leading-relaxed">Awaiting buyer to complete payment.</p>
                    <Button 
                      size="sm" 
                      variant="secondary" 
                      className="w-full h-10 rounded-xl"
                      onClick={() => updateStatus(inq.id!, "fulfilled")}
                    >
                      Mark Fulfilled
                    </Button>
                  </div>
                )}

                {inq.status === "fulfilled" && (
                  <div className="p-6 rounded-3xl bg-blue-500/5 border border-blue-500/20 text-center">
                    <div className="text-[10px] font-black uppercase tracking-widest text-blue-400">Order Completed</div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
