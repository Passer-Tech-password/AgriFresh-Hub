"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  ArrowRight, 
  Trash2, 
  Plus, 
  Minus, 
  AlertCircle, 
  Truck, 
  ShieldCheck, 
  Info,
  Sparkles,
  ChevronLeft
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore, selectCartTotalKobo, getEffectivePrice } from "@/features/cart/cart-store";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const setQuantity = useCartStore((s) => s.setQuantity);
  const clear = useCartStore((s) => s.clear);

  const [loading, setLoading] = React.useState(true);
  
  React.useEffect(() => {
    // Simulate loading to show skeletons
    const timer = setTimeout(() => setLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const totalKobo = selectCartTotalKobo(items);
  const hasMoqIssues = items.some(i => i.quantity < i.moq);

  if (loading) return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="space-y-12 animate-pulse">
        <div className="space-y-4">
          <div className="h-4 w-32 bg-white/5 rounded-lg" />
          <div className="h-10 w-64 bg-white/5 rounded-xl" />
        </div>
        <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
          <div className="h-[400px] bg-white/5 rounded-[32px]" />
          <div className="h-[300px] bg-white/5 rounded-[40px]" />
        </div>
      </div>
    </main>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="space-y-12">
        {/* Header */}
        <header className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-leaf">
              <ChevronLeft className="h-4 w-4" />
              Back to Marketplace
            </Link>
            <div className="space-y-2">
              <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Your <span className="text-leaf">Order Basket</span>
              </h1>
              <p className="text-sm text-white/40">
                {items.length === 0 ? "Your basket is currently empty." : `You have ${items.length} unique produce item(s) in your basket.`}
              </p>
            </div>
          </div>
          {items.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-10 rounded-xl text-orange-400 hover:bg-orange-400/10 hover:text-orange-300"
              onClick={() => {
                if (confirm("Are you sure you want to clear your entire basket?")) clear();
              }}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Clear Entire Basket
            </Button>
          )}
        </header>

        {items.length === 0 ? (
          <section className="flex flex-col items-center justify-center py-32 text-center space-y-8 rounded-[40px] border border-dashed border-forest/20 bg-black/10">
            <div className="relative">
              <div className="absolute inset-0 animate-pulse rounded-full bg-leaf/10 blur-2xl" />
              <div className="relative p-8 rounded-full bg-forest/20 text-leaf">
                <ShoppingBag className="h-16 w-16" />
              </div>
            </div>
            <div className="space-y-3 max-w-md">
              <h2 className="font-display text-2xl font-bold text-white">Your basket is feeling light</h2>
              <p className="text-sm text-white/40 leading-relaxed">
                Explore our marketplace for the freshest Nigerian produce, from Rivers State farms directly to your door.
              </p>
            </div>
            <Link href="/marketplace">
              <Button size="lg" className="group h-14 rounded-2xl px-10 shadow-xl shadow-leaf/10">
                Browse Marketplace
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
          </section>
        ) : (
          <div className="grid gap-10 lg:grid-cols-[1fr_380px]">
            {/* Cart Items List */}
            <div className="space-y-6">
              <div className="rounded-[32px] border border-forest/20 bg-black/20 backdrop-blur shadow-lift overflow-hidden">
                <div className="divide-y divide-white/5">
                  {items.map((item) => {
                    const effectivePrice = getEffectivePrice(item);
                    const hasBulkDiscount = effectivePrice < item.priceKobo;
                    const isBelowMoq = item.quantity < item.moq;
                    
                    return (
                      <div key={item.productId} className="p-6 transition-colors hover:bg-white/[0.02]">
                        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
                          {/* Item Info */}
                          <div className="flex-1 space-y-3">
                            <div className="space-y-1">
                              <Link href={`/product/${item.productId}`} className="font-display text-xl font-bold text-white transition-colors hover:text-leaf">
                                {item.name}
                              </Link>
                              <div className="flex items-center gap-3">
                                <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{item.unit} Unit</span>
                                {isBelowMoq && (
                                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-widest text-orange-400">
                                    <AlertCircle className="h-3 w-3" />
                                    Below MOQ ({item.moq})
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-4 pt-1">
                              <div className="space-y-0.5">
                                <div className={cn("text-lg font-black", hasBulkDiscount ? "text-leaf" : "text-white")}>
                                  {formatNairaFromKobo(effectivePrice)}
                                </div>
                                {hasBulkDiscount && (
                                  <div className="text-[10px] font-bold text-white/30 line-through">
                                    {formatNairaFromKobo(item.priceKobo)} Base
                                  </div>
                                )}
                              </div>
                              {hasBulkDiscount && (
                                <div className="rounded-lg bg-leaf/10 px-2 py-1 text-[10px] font-black uppercase text-leaf">
                                  Bulk Pricing Applied
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Controls */}
                          <div className="flex items-center justify-between sm:justify-end gap-6">
                            <div className="flex h-12 items-center rounded-2xl border border-white/10 bg-black/40 p-1">
                              <button
                                onClick={() => setQuantity(item.productId, item.quantity - 1)}
                                className="flex h-full w-10 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <input
                                className="w-14 bg-transparent text-center text-sm font-bold text-white outline-none"
                                value={item.quantity}
                                readOnly
                              />
                              <button
                                onClick={() => setQuantity(item.productId, item.quantity + 1)}
                                className="flex h-full w-10 items-center justify-center rounded-xl text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-12 w-12 rounded-2xl text-white/20 hover:bg-red-500/10 hover:text-red-400 transition-all"
                              onClick={() => removeItem(item.productId)}
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Delivery Note */}
              <div className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-6 backdrop-blur">
                <div className="flex gap-4">
                  <div className="p-3 rounded-2xl bg-blue-500/20 text-blue-400">
                    <Truck className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-white">Cold-Chain Delivery Note</h4>
                    <p className="text-xs text-white/50 leading-relaxed">
                      All perishables and frozen items in your basket will be delivered in 
                      temperature-controlled smart containers maintained at 4°C.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Checkout Sidebar */}
            <aside className="space-y-6">
              <section className="sticky top-6 rounded-[40px] border border-forest/20 bg-gradient-to-b from-[#0A3D33]/40 to-black/40 p-8 backdrop-blur shadow-2xl">
                <h3 className="font-display text-2xl font-bold text-white mb-8">Summary</h3>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40 font-semibold uppercase tracking-widest text-[10px]">Produce Subtotal</span>
                      <span className="text-white font-bold">{formatNairaFromKobo(totalKobo)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-white/40 font-semibold uppercase tracking-widest text-[10px]">Cold-Chain Logistics</span>
                      <span className="text-leaf font-bold uppercase text-[10px]">Calculated Next</span>
                    </div>
                  </div>

                  <div className="pt-6 border-t border-white/5">
                    <div className="flex items-end justify-between">
                      <div className="space-y-1">
                        <span className="text-white/40 font-semibold uppercase tracking-widest text-[10px]">Estimated Total</span>
                        <div className="text-4xl font-black text-white tracking-tighter">{formatNairaFromKobo(totalKobo)}</div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-8 space-y-4">
                    <Link href="/checkout" className={cn(hasMoqIssues && "pointer-events-none")}>
                      <Button 
                        size="lg" 
                        className="group relative h-14 w-full overflow-hidden rounded-2xl font-bold shadow-xl shadow-leaf/10"
                        disabled={hasMoqIssues}
                      >
                        <span className="relative z-10 flex items-center gap-2">
                          Proceed to Checkout
                          <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125" />
                        </span>
                        <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                      </Button>
                    </Link>
                    
                    {hasMoqIssues ? (
                      <div className="flex gap-2 rounded-xl bg-orange-500/10 p-3 border border-orange-500/20">
                        <AlertCircle className="h-4 w-4 text-orange-400 shrink-0 mt-0.5" />
                        <p className="text-[10px] font-bold text-orange-400 leading-tight uppercase tracking-widest">
                          Please adjust quantities to meet Minimum Order requirements.
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-[10px] font-bold text-white/30 uppercase tracking-widest">
                        <ShieldCheck className="h-3 w-3 text-leaf" />
                        Secure Checkout with Paystack
                      </div>
                    )}
                  </div>
                </div>
              </section>

              <div className="rounded-3xl border border-forest/20 bg-black/20 p-6 backdrop-blur">
                <div className="flex gap-3">
                  <Info className="h-4 w-4 text-white/30 shrink-0 mt-0.5" />
                  <p className="text-[10px] text-white/40 leading-relaxed">
                    By proceeding, you agree to the AgriFresh Hub terms of service regarding 
                    perishable goods and bulk delivery logistics.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
}
