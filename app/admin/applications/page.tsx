"use client";

import * as React from "react";
import Link from "next/link";
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  where, 
  writeBatch,
  orderBy,
  Timestamp 
} from "firebase/firestore";
import { toast } from "sonner";
import { 
  CheckCircle2, 
  XCircle, 
  Eye, 
  ExternalLink, 
  Calendar, 
  Building2, 
  MapPin, 
  Phone, 
  Mail,
  FileText,
  ShieldCheck,
  AlertCircle,
  X,
  Loader2
} from "lucide-react";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { VendorApplicationDoc, BusinessDocument } from "@/types/vendor-application";

export default function AdminApplicationsPage() {
  const [apps, setApps] = React.useState<VendorApplicationDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);
  const [selectedApp, setSelectedApp] = React.useState<VendorApplicationDoc | null>(null);
  const [rejectionReason, setRejectionReason] = React.useState("");
  const [showRejectInput, setShowRejectInput] = React.useState(false);

  React.useEffect(() => {
    const q = query(
      collection(db, "vendorApplications"), 
      orderBy("createdAt", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as VendorApplicationDoc);
      setApps(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleAction(app: VendorApplicationDoc, approved: boolean) {
    if (busyId) return;
    setBusyId(app.id!);

    try {
      const batch = writeBatch(db);
      
      // 1. Update application status
      const appRef = doc(db, "vendorApplications", app.id!);
      const updateData: any = { 
        status: approved ? "approved" : "rejected",
        updatedAt: Timestamp.now()
      };
      if (!approved && rejectionReason) {
        updateData.rejectionReason = rejectionReason;
      }
      batch.update(appRef, updateData);

      // 2. If approved, update user role
      if (approved) {
        const userRef = doc(db, "users", app.uid);
        batch.update(userRef, { role: "vendor_approved" });
      }

      await batch.commit();
      toast.success(approved 
        ? `Congratulations! ${app.businessName} has been approved.` 
        : `${app.businessName} application rejected.`
      );
      setSelectedApp(null);
      setRejectionReason("");
      setShowRejectInput(false);
    } catch (err) {
      console.error("Action failed:", err);
      toast.error("Action failed. Please check permissions.");
    } finally {
      setBusyId(null);
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved": return "bg-leaf/10 text-leaf border-leaf/20";
      case "rejected": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gold/10 text-gold border-gold/20";
    }
  };

  return (
    <RequireAuth requireRole="admin">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gold backdrop-blur">
                Admin Control
              </div>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white">
                Vendor Applications
              </h1>
              <p className="text-sm text-white/60">
                Review and verify farm businesses joining the AgriFresh Hub.
              </p>
            </div>
            <Link href="/dashboard">
              <Button variant="secondary" className="rounded-2xl border-white/10 text-white/60 hover:text-white">Back to dashboard</Button>
            </Link>
          </header>

          <div className="rounded-3xl border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-white/70">
                <thead className="bg-white/5 text-[10px] font-bold uppercase tracking-widest text-white/40">
                  <tr>
                    <th className="px-6 py-4">Business</th>
                    <th className="px-6 py-4">Applicant</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {loading ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center">Loading applications...</td></tr>
                  ) : apps.length === 0 ? (
                    <tr><td colSpan={5} className="px-6 py-20 text-center">No applications found.</td></tr>
                  ) : apps.map((app) => (
                    <tr key={app.id} className="hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-white">{app.businessName}</div>
                        <div className="text-xs text-white/40">{app.location.city}, {app.location.state}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div>{app.fullName}</div>
                        <div className="text-xs text-white/40">{app.email}</div>
                      </td>
                      <td className="px-6 py-4 text-xs">
                        {app.createdAt?.toDate().toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={cn("inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-bold uppercase", getStatusBadge(app.status))}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-leaf hover:bg-leaf/10"
                          onClick={() => setSelectedApp(app)}
                        >
                          <Eye className="mr-2 h-4 w-4" />
                          Review
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Details Modal */}
        {selectedApp && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border border-forest/30 bg-[#071512] p-8 shadow-2xl animate-in zoom-in-95 duration-300">
              <button 
                onClick={() => {
                  setSelectedApp(null);
                  setShowRejectInput(false);
                }}
                className="absolute right-6 top-6 text-white/30 hover:text-white transition-colors"
              >
                <X className="h-6 w-6" />
              </button>

              <div className="space-y-10">
                <header className="space-y-4">
                  <div className={cn("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest", getStatusBadge(selectedApp.status))}>
                    {selectedApp.status} Application
                  </div>
                  <h2 className="font-display text-3xl font-bold text-white">{selectedApp.businessName}</h2>
                </header>

                <div className="grid gap-10 lg:grid-cols-2">
                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                        <Building2 className="h-4 w-4" />
                        Business Info
                      </h3>
                      <div className="grid gap-4 text-sm">
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">Full Name</span>
                          <span className="text-white">{selectedApp.fullName}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">RC Number</span>
                          <span className="text-white">{selectedApp.rcNumber || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">TIN</span>
                          <span className="text-white">{selectedApp.tin || "N/A"}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">Phone</span>
                          <span className="text-white">{selectedApp.phoneNumber}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">Email</span>
                          <span className="text-white">{selectedApp.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-white/5 pb-2">
                          <span className="text-white/40">Location</span>
                          <span className="text-white text-right">{selectedApp.location.address}, {selectedApp.location.city}, {selectedApp.location.state}</span>
                        </div>
                      </div>
                    </section>

                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        About Business
                      </h3>
                      <p className="text-sm text-white/70 leading-relaxed bg-black/20 p-4 rounded-2xl border border-white/5">
                        {selectedApp.businessDescription}
                      </p>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {selectedApp.productCategories.map(c => (
                          <span key={c} className="rounded-lg bg-forest/30 px-2 py-0.5 text-[10px] font-bold text-leaf uppercase">{c}</span>
                        ))}
                      </div>
                    </section>
                  </div>

                  <div className="space-y-8">
                    <section className="space-y-4">
                      <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                        <ShieldCheck className="h-4 w-4" />
                        Verification Documents
                      </h3>
                      <div className="space-y-3">
                        {Object.entries(selectedApp.documents).map(([key, doc]) => {
                          if (!doc || key === 'farmPhotos') return null;
                          const businessDoc = doc as BusinessDocument;
                          return (
                            <a 
                              key={key}
                              href={businessDoc.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="flex items-center justify-between p-4 rounded-2xl border border-white/10 bg-black/20 hover:border-leaf/50 hover:bg-black/40 transition-all group"
                            >
                              <div className="flex items-center gap-3">
                                <div className="p-2 rounded-xl bg-leaf/10 text-leaf">
                                  <FileText className="h-4 w-4" />
                                </div>
                                <div className="space-y-0.5">
                                  <div className="text-xs font-bold text-white uppercase tracking-wider">
                                    {key.replace(/([A-Z])/g, ' $1')}
                                  </div>
                                  <div className="text-[10px] text-white/40 truncate max-w-[150px]">{businessDoc.name}</div>
                                </div>
                              </div>
                              <ExternalLink className="h-4 w-4 text-white/20 group-hover:text-leaf transition-colors" />
                            </a>
                          );
                        })}
                      </div>
                    </section>

                    {selectedApp.documents.farmPhotos && selectedApp.documents.farmPhotos.length > 0 && (
                      <section className="space-y-4">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                          Farm/Product Photos
                        </h3>
                        <div className="grid grid-cols-2 gap-3">
                          {selectedApp.documents.farmPhotos.map((photo, i) => (
                            <a key={i} href={photo.url} target="_blank" rel="noopener noreferrer" className="relative aspect-video rounded-xl overflow-hidden border border-white/10 hover:border-leaf/50 transition-all">
                              <img src={photo.url} className="h-full w-full object-cover" alt="Farm proof" />
                            </a>
                          ))}
                        </div>
                      </section>
                    )}
                  </div>
                </div>

                {selectedApp.status === "pending" && (
                  <div className="pt-10 border-t border-white/5 space-y-6">
                    {showRejectInput ? (
                      <div className="space-y-4 animate-in slide-in-from-top-2">
                        <Label className="text-xs font-bold uppercase tracking-widest text-red-400">Rejection Reason</Label>
                        <textarea 
                          className="w-full min-h-[100px] rounded-2xl border border-red-500/20 bg-red-500/5 p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20"
                          placeholder="Explain why the application was rejected..."
                          value={rejectionReason}
                          onChange={e => setRejectionReason(e.target.value)}
                        />
                        <div className="flex gap-3">
                          <Button 
                            variant="secondary" 
                            className="flex-1"
                            onClick={() => {
                              setShowRejectInput(false);
                              setRejectionReason("");
                            }}
                          >
                            Cancel
                          </Button>
                          <Button 
                            className="flex-1 bg-red-500 hover:bg-red-600 text-white"
                            disabled={!!busyId || !rejectionReason}
                            onClick={() => handleAction(selectedApp, false)}
                          >
                            Confirm Rejection
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex flex-col sm:flex-row gap-4">
                        <Button 
                          variant="secondary" 
                          className="flex-1 h-14 rounded-2xl text-red-400 border-red-500/10 hover:bg-red-500/5"
                          disabled={!!busyId}
                          onClick={() => setShowRejectInput(true)}
                        >
                          <XCircle className="mr-2 h-5 w-5" />
                          Reject Application
                        </Button>
                        <Button 
                          variant="primary" 
                          className="flex-1 h-14 rounded-2xl shadow-xl shadow-leaf/20"
                          disabled={!!busyId}
                          onClick={() => handleAction(selectedApp, true)}
                        >
                          {busyId === selectedApp.id ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                            <>
                              <CheckCircle2 className="mr-2 h-5 w-5" />
                              Approve Vendor
                            </>
                          )}
                        </Button>
                      </div>
                    )}
                  </div>
                )}

                {selectedApp.status === "rejected" && selectedApp.rejectionReason && (
                  <div className="pt-6 border-t border-white/5">
                    <div className="rounded-2xl bg-red-500/5 border border-red-500/20 p-4 space-y-2">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-red-400 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" />
                        Rejection Reason
                      </div>
                      <p className="text-sm text-white/60">{selectedApp.rejectionReason}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
    </RequireAuth>
  );
}
