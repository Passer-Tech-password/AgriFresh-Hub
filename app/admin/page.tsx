"use client";

import * as React from "react";
import Link from "next/link";
import { collection, doc, onSnapshot, query, where, writeBatch } from "firebase/firestore";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import type { VendorApplicationDoc } from "@/types/vendor-application";

export default function AdminPage() {
  const [apps, setApps] = React.useState<VendorApplicationDoc[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busyId, setBusyId] = React.useState<string | null>(null);

  React.useEffect(() => {
    const q = query(collection(db, "vendorApplications"), where("status", "==", "pending"));
    const unsub = onSnapshot(q, (snap) => {
      const data = snap.docs.map((d) => ({ ...d.data(), id: d.id }) as VendorApplicationDoc);
      setApps(data);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  async function handleApproval(app: VendorApplicationDoc, approved: boolean) {
    if (busyId) return;
    setBusyId(app.uid);

    try {
      const batch = writeBatch(db);
      
      // 1. Update application status
      const appRef = doc(db, "vendorApplications", app.uid);
      batch.update(appRef, { status: approved ? "approved" : "rejected" });

      // 2. If approved, update user role
      if (approved) {
        const userRef = doc(db, "users", app.uid);
        batch.update(userRef, { role: "vendor_approved" });
      }

      await batch.commit();
      toast.success(approved ? `${app.businessName} approved.` : `${app.businessName} rejected.`);
    } catch (err) {
      toast.error("Action failed.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <RequireAuth requireRole="admin">
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold backdrop-blur">
              Admin
            </div>
            <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
              Vendor approval queue
            </h1>
            <p className="text-sm text-white/60">
              Review and approve new vendors joining the platform.
            </p>
          </header>

          <div className="space-y-4">
            {loading ? (
              <div className="py-10 text-center text-white/40">Loading applications…</div>
            ) : apps.length === 0 ? (
              <div className="rounded-3xl border border-forest/20 bg-black/10 py-20 text-center text-white/40">
                No pending applications.
              </div>
            ) : (
              <div className="grid gap-4">
                {apps.map((app) => (
                  <div
                    key={app.uid}
                    className="flex flex-col gap-4 rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur sm:flex-row sm:items-center sm:justify-between"
                  >
                    <div className="space-y-1">
                      <h3 className="font-display text-lg font-semibold text-white">
                        {app.businessName}
                      </h3>
                      <div className="text-sm text-white/60">
                        {app.location} · {app.phoneNumber}
                      </div>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {app.categories.map((c) => (
                          <span
                            key={c}
                            className="rounded-full bg-forest/30 px-2 py-0.5 text-[10px] uppercase tracking-wider text-leaf"
                          >
                            {c}
                          </span>
                        ))}
                        {app.hasColdChain && (
                          <span className="rounded-full bg-blue-500/20 px-2 py-0.5 text-[10px] uppercase tracking-wider text-blue-300">
                            Cold-Chain
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        disabled={!!busyId}
                        onClick={() => handleApproval(app, false)}
                      >
                        Reject
                      </Button>
                      <Button
                        size="sm"
                        disabled={!!busyId}
                        onClick={() => handleApproval(app, true)}
                      >
                        {busyId === app.uid ? "Approving…" : "Approve"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link href="/dashboard">
            <Button variant="ghost">Back to dashboard</Button>
          </Link>
        </div>
      </main>
    </RequireAuth>
  );
}

