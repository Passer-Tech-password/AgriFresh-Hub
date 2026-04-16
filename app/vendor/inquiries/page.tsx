"use client";

import * as React from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, query, where, updateDoc, serverTimestamp, addDoc } from "firebase/firestore";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import type { BulkInquiryDoc } from "@/types/order";

export default function VendorInquiriesPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const [inquiries, setInquiries] = React.useState<BulkInquiryDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
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

  return (
    <RequireAuth requireRole="vendor_approved">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs text-leaf backdrop-blur">
              Vendor Dashboard
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
              Bulk Inquiries & Large Orders
            </h1>
            <p className="text-sm text-white/60">
              Manage large quantity requests and B2B negotiations.
            </p>
          </header>

          {loading ? (
            <div className="py-20 text-center text-white/40">Loading inquiries…</div>
          ) : inquiries.length === 0 ? (
            <div className="rounded-3xl border border-forest/20 bg-black/10 py-20 text-center text-white/40">
              No bulk inquiries yet.
            </div>
          ) : (
            <div className="grid gap-6">
              {inquiries.map((inq) => (
                <div
                  key={inq.id}
                  className="flex flex-col gap-6 rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur lg:flex-row lg:items-center lg:justify-between"
                >
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-widest ${
                        inq.status === "pending" ? "bg-gold/20 text-gold" :
                        inq.status === "negotiating" ? "bg-blue-500/20 text-blue-300" :
                        inq.status === "accepted" ? "bg-leaf/20 text-leaf" : "bg-white/10 text-white/40"
                      }`}>
                        {inq.status}
                      </span>
                      <span className="text-xs text-white/30">{inq.createdAt.toDate().toLocaleDateString()}</span>
                    </div>
                    
                    <div className="space-y-1">
                      <h3 className="font-display text-2xl font-semibold text-white">{inq.productName}</h3>
                      <p className="text-lg text-leaf font-medium">Requested: {inq.requestedQty} units</p>
                    </div>

                    {inq.notes && (
                      <div className="rounded-2xl bg-black/40 p-4 border border-forest/20">
                        <p className="text-xs text-white/40 uppercase tracking-wider mb-1">Buyer Notes</p>
                        <p className="text-sm text-white/70 italic">"{inq.notes}"</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap items-center gap-3 lg:flex-col lg:items-stretch">
                    {inq.status === "pending" && (
                      <>
                        <Button 
                          className="flex-1 lg:w-40" 
                          onClick={() => updateStatus(inq.id!, "accepted")}
                          disabled={!!busyId}
                        >
                          Accept
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 lg:w-40 border border-white/10"
                          onClick={() => updateStatus(inq.id!, "negotiating")}
                          disabled={!!busyId}
                        >
                          Negotiate
                        </Button>
                        <Button 
                          variant="ghost" 
                          className="flex-1 lg:w-40 text-orange-400 hover:text-orange-300"
                          onClick={() => updateStatus(inq.id!, "rejected")}
                          disabled={!!busyId}
                        >
                          Reject
                        </Button>
                      </>
                    )}
                    {inq.status === "accepted" && (
                      <div className="text-sm text-leaf font-semibold flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-leaf" />
                        Awaiting Payment
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="pt-4">
            <Link href="/dashboard">
              <Button variant="ghost" className="text-white/40 hover:text-white">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}