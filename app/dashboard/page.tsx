"use client";

import * as React from "react";
import Link from "next/link";
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { formatNairaFromKobo } from "@/lib/money";
import type { OrderDoc } from "@/types/order";

export default function DashboardPage() {
  const user = useAuthStore((s) => s.firebaseUser);
  const userDoc = useAuthStore((s) => s.userDoc);
  const role = useAuthStore((s) => s.role);
  const signOut = useAuthStore((s) => s.signOut);

  const [activeOrders, setActiveOrders] = React.useState<OrderDoc[]>([]);
  const [loadingOrders, setLoadingOrders] = React.useState(true);

  React.useEffect(() => {
    if (!user) return;
    if (role !== "buyer") {
      setLoadingOrders(false);
      return;
    }

    const q = query(
      collection(db, "orders"),
      where("userId", "==", user.uid),
      orderBy("createdAt", "desc"),
      limit(10)
    );
    const unsub = onSnapshot(q, (snap) => {
      setActiveOrders(snap.docs.map(d => ({ ...d.data(), id: d.id } as OrderDoc)));
      setLoadingOrders(false);
    }, (err) => {
      console.error(err);
      setLoadingOrders(false);
    });
    return () => unsub();
  }, [user, role]);

  if (loadingOrders) return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="space-y-10 animate-pulse">
        <div className="h-10 w-64 bg-white/5 rounded-xl" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div className="h-32 bg-white/5 rounded-[32px]" />
          <div className="h-32 bg-white/5 rounded-[32px]" />
          <div className="h-32 bg-white/5 rounded-[32px]" />
        </div>
        <div className="h-[400px] bg-white/5 rounded-[40px]" />
      </div>
    </main>
  );

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
        <div className="space-y-12">
          <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/25 bg-black/25 px-3 py-1 text-xs text-white/80 backdrop-blur">
                <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_20px_rgba(74,222,128,0.65)]" />
                Active Session
              </div>
              <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
                Welcome{userDoc?.displayName ? `, ${userDoc.displayName}` : ""}.
              </h1>
              <p className="text-sm text-white/60">
                {user?.email} {role ? `· ${role.replace("_", " ")}` : ""}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/profile">
                <Button variant="secondary" className="rounded-2xl border border-white/10 text-white/60 hover:text-white hover:bg-white/5">Profile</Button>
              </Link>
              <Link href="/leaderboard">
                <Button variant="secondary" className="rounded-2xl border border-gold/20 text-gold hover:bg-gold/10">Leaderboard</Button>
              </Link>
              <Button variant="ghost" className="text-white/40 hover:text-white rounded-2xl" onClick={() => signOut()}>
                Sign Out
              </Button>
            </div>
          </header>

          <section className="grid gap-8 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-8">
              {!role && (
                <div className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur space-y-4">
                  <div className="font-display text-2xl font-semibold text-white">Profile not ready</div>
                  <p className="text-sm text-white/60">
                    Your account exists, but your profile document is missing. If this is a
                    legacy account, contact support.
                  </p>
                </div>
              )}

              {role === "buyer" && (
                <div className="space-y-8">
                  <div className="rounded-3xl border border-forest/25 bg-gradient-to-br from-[#071512] to-black/20 p-8 backdrop-blur space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl font-semibold text-white">Buyer Hub</h3>
                      <p className="text-sm text-white/60">Browse fresh produce and track your active orders.</p>
                    </div>
                    <Link href="/marketplace">
                      <Button size="lg" className="rounded-2xl h-12 px-8">Open Marketplace</Button>
                    </Link>
                  </div>

                  <div className="space-y-4">
                    <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Recent Orders</h3>
                    {loadingOrders ? (
                      <div className="text-center py-10 text-white/20">Loading orders…</div>
                    ) : activeOrders.length === 0 ? (
                      <div className="rounded-3xl border border-forest/10 bg-black/10 py-16 text-center text-white/30">
                        No orders yet.
                      </div>
                    ) : (
                      <div className="grid gap-3">
                        {activeOrders.map(order => (
                          <div key={order.id} className="flex items-center justify-between p-5 rounded-2xl border border-forest/20 bg-black/20 hover:border-leaf/30 transition-all">
                            <div className="space-y-1">
                              <div className="font-semibold text-white">Order #{order.id?.slice(-6).toUpperCase()}</div>
                              <div className="text-xs text-white/40">{order.items.length} item(s) · {formatNairaFromKobo(order.amountKobo)}</div>
                            </div>
                            <div className="flex items-center gap-4">
                              <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                order.status === "paid" ? "bg-leaf/10 text-leaf" : "bg-white/5 text-white/40"
                              }`}>{order.status}</span>
                              <Link href={`/order/${order.id}/tracking`}>
                                <Button variant="ghost" size="sm" className="text-leaf hover:bg-leaf/10 rounded-xl">Track →</Button>
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {role === "vendor_pending" && (
                <div className="rounded-3xl border border-gold/30 bg-gold/5 p-8 backdrop-blur space-y-4">
                  <div className="font-display text-2xl font-semibold text-white">Vendor Application Pending</div>
                  <p className="text-sm text-white/60">
                    Your application is being reviewed. Please complete the remaining onboarding steps if you haven't.
                  </p>
                  <Link href="/vendor/apply">
                    <Button size="lg" className="rounded-2xl h-12 border border-gold/30 text-gold hover:bg-gold/10">Continue Application</Button>
                  </Link>
                </div>
              )}

              {role === "vendor_approved" && (
                <div className="space-y-6">
                  <div className="rounded-3xl border border-forest/25 bg-gradient-to-br from-[#071512] to-black/20 p-8 backdrop-blur space-y-6">
                    <div className="space-y-2">
                      <h3 className="font-display text-2xl font-semibold text-white">Vendor approved</h3>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Your products are live in the marketplace. You can now manage bulk orders, 
                        set up MOQ, and respond to large quantity inquiries.
                      </p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <Link href="/vendor/products">
                        <Button size="lg" className="w-full rounded-2xl">Manage Products</Button>
                      </Link>
                      <Link href="/vendor/inquiries">
                        <Button variant="secondary" size="lg" className="w-full rounded-2xl relative overflow-hidden group">
                          <span className="relative z-10 flex items-center justify-center gap-2">
                            Bulk Inquiries
                            <span className="flex h-2 w-2 rounded-full bg-leaf shadow-[0_0_10px_rgba(74,222,128,1)] animate-pulse" />
                          </span>
                        </Button>
                      </Link>
                    </div>
                  </div>

                  {/* Pro Plan Prompt */}
                  <div className="rounded-3xl border border-gold/30 bg-gold/10 p-8 backdrop-blur relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-20">
                      <svg className="w-16 h-16 text-gold" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                      </svg>
                    </div>
                    <div className="space-y-3 relative z-10">
                      <div className="text-xs font-bold text-gold uppercase tracking-widest">Growth Plan</div>
                      <div className="font-display text-xl font-semibold text-white">Scale your farm business?</div>
                      <p className="text-sm text-white/60 leading-relaxed">
                        Upgrade to **AgriFresh Pro** for unlimited bulk inquiries, prioritized listing placement, 
                        and advanced cold-chain analytics. First 6 months are free!
                      </p>
                      <Button variant="ghost" className="text-gold hover:text-gold hover:bg-gold/10 p-0 h-auto font-semibold">
                        Learn more about Pro →
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {role === "admin" && (
                <div className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur space-y-4">
                  <div className="font-display text-2xl font-semibold text-white">Admin Hub</div>
                  <p className="text-sm text-white/60">Review vendor applications and manage users.</p>
                  <Link href="/admin">
                    <Button size="lg" className="rounded-2xl h-12">Open Admin Queue</Button>
                  </Link>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur space-y-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Wallet & Credits</h3>
                <div className="p-5 rounded-2xl bg-leaf/5 border border-leaf/20">
                  <div className="text-2xl font-bold text-white">{userDoc?.creditsBalance || 0}</div>
                  <div className="text-xs text-white/40 uppercase tracking-widest font-bold">Credits Available</div>
                </div>
                <Button variant="outline" className="w-full rounded-xl border-white/10 text-white/70 hover:text-white hover:bg-white/5">Buy Credits</Button>
              </section>

              <section className="rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur space-y-4">
                <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest px-1">Profile Summary</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Status</span>
                    <span className="text-leaf font-semibold">Verified</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/40">Member since</span>
                    <span className="text-white">{userDoc?.createdAt?.toDate().toLocaleDateString() || "Today"}</span>
                  </div>
                </div>
              </section>
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}
