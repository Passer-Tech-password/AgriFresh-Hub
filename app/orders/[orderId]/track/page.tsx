"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { 
  MapPin, 
  Thermometer, 
  Snowflake, 
  Truck, 
  Clock, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  MessageSquare,
  Zap,
  Phone,
  History,
  AlertCircle
} from "lucide-react";
import { doc, onSnapshot } from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { OrderDoc, OrderStatus } from "@/types/order";

const TRACKING_STEPS: { status: OrderStatus; label: string; icon: any }[] = [
  { status: "paid", label: "Paid & Verified", icon: Zap },
  { status: "packed", label: "Packed at Farm", icon: CheckCircle2 },
  { status: "shipped", label: "In Transit", icon: Truck },
  { status: "delivered", label: "Delivered", icon: MapPin },
];

export default function TrackingPage() {
  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";
  const [order, setOrder] = React.useState<OrderDoc | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    if (!orderId) return;
    const unsub = onSnapshot(doc(db, "orders", orderId), (snap) => {
      if (snap.exists()) setOrder({ ...snap.data(), id: snap.id } as OrderDoc);
      setLoading(false);
    });
    return () => unsub();
  }, [orderId]);

  if (loading) return (
    <div className="flex min-h-[70vh] items-center justify-center">
      <div className="flex flex-col items-center gap-4 text-white/30">
        <div className="h-12 w-12 animate-spin rounded-full border-2 border-leaf/20 border-t-leaf" />
        <span className="text-xs font-bold uppercase tracking-widest text-glow">Connecting to Cold-Chain Log...</span>
      </div>
    </div>
  );

  if (!order) return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-forest/20 p-6 text-leaf">
        <AlertCircle className="h-12 w-12" />
      </div>
      <h1 className="font-display text-2xl font-bold text-white">Order not found</h1>
      <Link href="/orders"><Button variant="secondary">Back to Orders</Button></Link>
    </div>
  );

  const currentStatusIdx = TRACKING_STEPS.findIndex(s => s.status === order.status);
  const temp = order.currentTemp || 3.8;
  const isOptimal = temp <= 5;

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
        <div className="space-y-12">
          {/* Header */}
          <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-4">
              <Link href="/orders" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-leaf">
                <ArrowLeft className="h-4 w-4" />
                Back to History
              </Link>
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Live <span className="text-leaf">Tracking</span>.
              </h1>
              <p className="max-w-xl text-sm leading-relaxed text-white/50">
                Order #{order.id?.slice(-8).toUpperCase()} · Real-time status from Port Harcourt logistics hub.
              </p>
            </div>
            
            <div className="rounded-2xl border border-leaf/20 bg-leaf/5 px-6 py-4 backdrop-blur-md">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-leaf" />
                <div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guaranteed Fresh</div>
                  <div className="text-sm font-bold text-white">Full Refund if Temp {">"} 7°C</div>
                </div>
              </div>
            </div>
          </header>

          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            <div className="space-y-8">
              {/* Map Placeholder */}
              <section className="relative aspect-video w-full overflow-hidden rounded-[40px] border border-forest/20 bg-[#071512] shadow-2xl">
                <div className="absolute inset-0 opacity-40">
                  <img 
                    src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&q=80&w=1600" 
                    className="h-full w-full object-cover grayscale" 
                    alt="Map"
                  />
                </div>
                {/* Animated Pulse for Location */}
                <div className="absolute left-[60%] top-[40%]">
                  <div className="relative flex h-10 w-10 items-center justify-center">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-40" />
                    <div className="relative h-4 w-4 rounded-full bg-leaf shadow-[0_0_20px_rgba(74,222,128,1)]" />
                  </div>
                </div>
                <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between rounded-2xl bg-black/60 p-4 backdrop-blur-md border border-white/5">
                  <div className="flex items-center gap-3">
                    <MapPin className="h-5 w-5 text-leaf" />
                    <div className="text-xs font-bold text-white uppercase tracking-widest">En route: Aba Road, PH</div>
                  </div>
                  <div className="text-[10px] font-black text-leaf">EST: 24 MINS</div>
                </div>
              </section>

              {/* Status Timeline */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 p-10 backdrop-blur shadow-lift">
                <div className="relative flex flex-col gap-10 sm:flex-row sm:justify-between">
                  {/* Progress Line */}
                  <div className="absolute left-4 top-4 h-[calc(100%-32px)] w-px bg-white/5 sm:left-4 sm:top-4 sm:h-px sm:w-[calc(100%-32px)]" />
                  <div 
                    className="absolute left-4 top-4 w-px bg-leaf transition-all duration-1000 sm:left-4 sm:top-4 sm:h-px" 
                    style={{ 
                      height: typeof window !== 'undefined' && window.innerWidth < 640 ? `${(currentStatusIdx / (TRACKING_STEPS.length - 1)) * 100}%` : '1px',
                      width: typeof window !== 'undefined' && window.innerWidth >= 640 ? `${(currentStatusIdx / (TRACKING_STEPS.length - 1)) * 100}%` : '1px'
                    }} 
                  />

                  {TRACKING_STEPS.map((step, idx) => {
                    const isDone = idx <= currentStatusIdx;
                    const isCurrent = idx === currentStatusIdx;
                    return (
                      <div key={step.status} className="relative z-10 flex items-center gap-4 sm:flex-col sm:gap-4 sm:text-center">
                        <div className={cn(
                          "flex h-9 w-9 items-center justify-center rounded-xl border transition-all duration-500",
                          isDone ? "border-leaf bg-leaf text-forest shadow-[0_0_15px_rgba(74,222,128,0.4)]" : "border-white/5 bg-black/40 text-white/20",
                          isCurrent && "animate-pulse"
                        )}>
                          <step.icon className="h-4 w-4" />
                        </div>
                        <div className="space-y-1">
                          <div className={cn("text-[10px] font-black uppercase tracking-widest", isDone ? "text-white" : "text-white/20")}>{step.label}</div>
                          {isCurrent && <div className="text-[9px] font-bold text-leaf animate-pulse uppercase">Active</div>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            </div>

            {/* Live Data Sidebar */}
            <aside className="space-y-8">
              {/* Circular Temp Gauge */}
              <section className="rounded-[40px] border border-forest/20 bg-gradient-to-b from-blue-500/10 to-transparent p-10 backdrop-blur shadow-2xl text-center space-y-8">
                <div className="relative mx-auto flex h-48 w-48 items-center justify-center rounded-full border-8 border-white/5 shadow-inner">
                  {/* Gauge Progress SVG */}
                  <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
                    <circle
                      cx="96" cy="96" r="88"
                      stroke="currentColor" strokeWidth="8"
                      fill="transparent"
                      className="text-blue-500/20"
                    />
                    <circle
                      cx="96" cy="96" r="88"
                      stroke="currentColor" strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={552}
                      strokeDashoffset={552 - (552 * (temp / 10))}
                      strokeLinecap="round"
                      className={cn("transition-all duration-1000", isOptimal ? "text-blue-400" : "text-orange-400")}
                    />
                  </svg>
                  <div className="relative z-10 space-y-1">
                    <div className="text-5xl font-black text-white tracking-tighter">{temp}°C</div>
                    <div className={cn("text-[10px] font-black uppercase tracking-widest", isOptimal ? "text-blue-400" : "text-orange-400")}>
                      {isOptimal ? "Optimal Zone" : "Warning Zone"}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-white/30">
                      <span>Temp Stability</span>
                      <span className="text-blue-400">99.2%</span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
                      <div className="h-full w-[99%] bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-3 p-4 rounded-2xl bg-black/40 border border-white/5">
                    <Snowflake className="h-5 w-5 text-blue-400" />
                    <span className="text-xs font-bold text-white/70">Cold-Chain Verified</span>
                  </div>
                </div>
              </section>

              {/* Driver Card */}
              <section className="rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur shadow-lift space-y-6">
                <h3 className="text-xs font-bold uppercase tracking-widest text-white/30 flex items-center gap-2">
                  <Truck className="h-4 w-4" />
                  Your Courier
                </h3>
                <div className="flex items-center gap-4">
                  <div className="relative h-14 w-14 overflow-hidden rounded-2xl border border-white/10">
                    <img 
                      src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200" 
                      className="h-full w-full object-cover" 
                      alt="Driver"
                    />
                  </div>
                  <div className="flex-1 space-y-0.5">
                    <div className="text-sm font-bold text-white">Chidi Azubuike</div>
                    <div className="text-[10px] font-bold text-leaf uppercase tracking-widest">Verified Courier</div>
                  </div>
                  <Button variant="secondary" size="sm" className="h-10 w-10 p-0 rounded-xl border-white/5">
                    <Phone className="h-4 w-4 text-white/40" />
                  </Button>
                </div>
                <Button className="w-full h-12 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-bold gap-2">
                  <MessageSquare className="h-4 w-4" />
                  Chat with Driver
                </Button>
              </section>
            </div>
          </div>
        </div>
      </main>
    </RequireAuth>
  );
}
