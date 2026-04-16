"use client";

import * as React from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc 
} from "firebase/firestore";
import { 
  ShoppingBag, 
  Thermometer, 
  Snowflake, 
  Clock, 
  MapPin, 
  ShieldCheck, 
  Sparkles, 
  ArrowRight,
  TrendingUp,
  History,
  CheckCircle2,
  AlertCircle,
  FileText,
  MessageSquare
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCartStore } from "@/features/cart/cart-store";
import { useAuthStore } from "@/features/auth/auth-store";
import { getProductById } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import type { ProductDoc, BulkPricingTier } from "@/types/product";

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);
  const addItem = useCartStore((s) => s.addItem);

  const productId = params?.id ?? "";

  const [loading, setLoading] = React.useState(true);
  const [product, setProduct] = React.useState<(ProductDoc & { id: string }) | null>(null);
  const [qty, setQty] = React.useState(1);
  const [isInquiryMode, setIsInquiryMode] = React.useState(false);
  const [inquiryNotes, setInquiryNotes] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!productId) return;
    let active = true;
    setLoading(true);
    getProductById(productId)
      .then((p) => {
        if (!active) return;
        if (p) {
          setProduct(p as ProductDoc & { id: string });
          setQty(p.moq || 1);
        } else {
          setProduct(null);
        }
      })
      .catch(() => {
        if (!active) return;
        setProduct(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, [productId]);

  const currentPrice = React.useMemo(() => {
    if (!product) return 0;
    if (!product.bulkPricing || product.bulkPricing.length === 0) return product.priceKobo;
    const tiers = [...product.bulkPricing].sort((a, b) => b.minQty - a.minQty);
    const tier = tiers.find((t) => qty >= t.minQty);
    return tier ? tier.pricePerUnitKobo : product.priceKobo;
  }, [product, qty]);

  const handleAddToCart = () => {
    if (!product) return;
    if (qty < (product.moq || 1)) {
      toast.error(`Minimum order quantity is ${product.moq} ${product.unit}`);
      return;
    }
    addItem({
      productId: product.id,
      vendorId: product.vendorId,
      name: product.name,
      unit: product.unit,
      priceKobo: currentPrice,
      quantity: qty,
      moq: product.moq,
      bulkPricing: product.bulkPricing
    });
    toast.success("Added to cart");
  };

  const handleRequestQuote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !user) {
      toast.error("Please sign in to request a quote.");
      return;
    }
    if (!inquiryNotes.trim()) {
      toast.error("Please provide some details for your request.");
      return;
    }
    setBusy(true);
    try {
      await addDoc(collection(db, "bulkInquiries"), {
        userId: user.uid,
        vendorId: product.vendorId,
        productId: product.id,
        productName: product.name,
        requestedQty: qty,
        status: "pending",
        notes: inquiryNotes,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      toast.success("Quote request sent to vendor!");
      setIsInquiryMode(false);
      setInquiryNotes("");
    } catch (err) {
      toast.error("Failed to send request.");
    } finally {
      setBusy(false);
    }
  };

  if (loading) return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="space-y-10 animate-pulse">
        <div className="h-6 w-32 bg-white/5 rounded-lg" />
        <div className="grid gap-12 lg:grid-cols-2">
          <div className="aspect-square bg-white/5 rounded-[40px]" />
          <div className="space-y-6">
            <div className="h-10 w-3/4 bg-white/5 rounded-xl" />
            <div className="h-6 w-1/4 bg-white/5 rounded-lg" />
            <div className="h-32 w-full bg-white/5 rounded-3xl" />
            <div className="h-16 w-full bg-white/5 rounded-2xl" />
          </div>
        </div>
      </div>
    </main>
  );

  if (!product) return (
    <div className="mx-auto flex min-h-[70vh] max-w-lg flex-col items-center justify-center gap-6 text-center">
      <div className="rounded-full bg-forest/20 p-6 text-leaf">
        <AlertCircle className="h-12 w-12" />
      </div>
      <div className="space-y-2">
        <h1 className="font-display text-2xl font-bold text-white">Listing not found</h1>
        <p className="text-sm text-white/50">The produce you're looking for might have been sold or removed.</p>
      </div>
      <Link href="/marketplace">
        <Button variant="secondary" className="rounded-xl border-white/10">Return to Marketplace</Button>
      </Link>
    </div>
  );

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-10">
        {/* Navigation & Actions */}
        <header className="flex items-center justify-between">
          <Link href="/marketplace" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 transition-colors hover:text-leaf">
            <ArrowRight className="h-4 w-4 rotate-180" />
            Back to Marketplace
          </Link>
          <div className="flex items-center gap-3">
            <Button variant="ghost" className="h-10 rounded-xl text-white/40 hover:text-white">
              Share
            </Button>
            <Link href="/cart">
              <Button variant="secondary" className="h-10 rounded-xl border-white/10 px-6">
                <ShoppingBag className="mr-2 h-4 w-4 text-leaf" />
                View Cart
              </Button>
            </Link>
          </div>
        </header>

        <div className="grid gap-12 lg:grid-cols-2">
          {/* Left: Visuals & Traceability */}
          <div className="space-y-10 animate-in fade-in slide-in-from-left-8 duration-1000">
            {/* Product Image Container */}
            <div className="group relative aspect-square overflow-hidden rounded-[40px] border border-forest/20 bg-gradient-to-b from-forest/10 to-transparent shadow-2xl">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-105" />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <ShoppingBag className="h-24 w-24 text-leaf/10" />
                </div>
              )}
              
              {/* Pulse Freshness Badge */}
              <div className="absolute right-6 top-6 inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-black/60 px-4 py-2 text-xs font-bold text-white backdrop-blur-md">
                <div className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-leaf opacity-75" />
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-leaf" />
                </div>
                98% Freshness Pulse
              </div>

              {/* Live Temp Indicator Overlay */}
              <div className="absolute bottom-6 left-6 right-6">
                <div className="flex items-center justify-between rounded-[24px] border border-white/10 bg-black/60 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-blue-500/20 text-blue-400">
                      <Thermometer className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Cold-Chain Temp</div>
                      <div className="text-sm font-bold text-white">4.2°C <span className="text-[10px] font-normal text-blue-400/60 ml-1">STABLE</span></div>
                    </div>
                  </div>
                  <div className="flex h-10 w-24 items-end gap-1 px-2 pb-1">
                    {[4, 5, 3, 6, 4, 7, 5, 4].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm bg-blue-400/30" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Traceability Timeline */}
            <section className="space-y-6">
              <h3 className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-white/40">
                <History className="h-4 w-4" />
                Farm-to-Door Traceability
              </h3>
              <div className="relative space-y-8 pl-8 before:absolute before:left-3.5 before:top-2 before:h-[calc(100%-16px)] before:w-px before:bg-gradient-to-b before:from-leaf before:via-blue-500 before:to-forest">
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-leaf/30 bg-[#071512] text-leaf shadow-[0_0_10px_rgba(74,222,128,0.3)]">
                    <MapPin className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">Harvested in Rivers State</div>
                    <div className="text-xs text-white/40">Verified Vendor · Port Harcourt Region</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-blue-500/30 bg-[#071512] text-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.3)]">
                    <Snowflake className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">Smart Cold-Chain Logged</div>
                    <div className="text-xs text-white/40">Transit Temp maintained at 4°C</div>
                  </div>
                </div>
                <div className="relative">
                  <div className="absolute -left-8 top-1.5 flex h-7 w-7 items-center justify-center rounded-full border border-white/20 bg-[#071512] text-white/40">
                    <Clock className="h-3.5 w-3.5" />
                  </div>
                  <div className="space-y-1">
                    <div className="text-sm font-bold text-white">Estimated Delivery</div>
                    <div className="text-xs text-white/40">Within 3 hours to Port Harcourt areas</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* Right: Pricing & Purchase */}
          <div className="space-y-8 animate-in fade-in slide-in-from-right-8 duration-1000 delay-200 fill-mode-both">
            <div className="space-y-4">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-1.5 rounded-full bg-forest/40 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-leaf">
                  <ShieldCheck className="h-3 w-3" />
                  Quality Verified
                </div>
                <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">{product.name}</h1>
                <p className="text-lg leading-relaxed text-white/50">{product.description || "Premium quality farm produce, freshly harvested and handled with strict cold-chain protocols."}</p>
              </div>

              <div className="flex items-end gap-4">
                <div className="space-y-1">
                  <div className="text-5xl font-black tracking-tighter text-white">{formatNairaFromKobo(currentPrice)}</div>
                  <div className="text-xs font-bold uppercase tracking-widest text-white/30">per {product.unit}</div>
                </div>
                {currentPrice < product.priceKobo && (
                  <div className="mb-2 rounded-lg bg-leaf/10 px-2 py-1 text-[10px] font-black uppercase text-leaf">
                    Bulk Rate Applied
                  </div>
                )}
              </div>
            </div>

            {/* MOQ Warning */}
            <div className={cn(
              "flex items-center gap-4 rounded-[24px] border p-5 transition-all",
              qty < product.moq ? "border-orange-500/20 bg-orange-500/5" : "border-white/5 bg-white/5"
            )}>
              <div className={cn("p-3 rounded-xl", qty < product.moq ? "bg-orange-500/20 text-orange-400" : "bg-leaf/10 text-leaf")}>
                {qty < product.moq ? <AlertCircle className="h-6 w-6" /> : <CheckCircle2 className="h-6 w-6" />}
              </div>
              <div className="space-y-1">
                <div className="text-sm font-bold text-white">Minimum Order Quantity (MOQ)</div>
                <div className="text-xs text-white/40">This vendor requires at least <span className="font-bold text-white">{product.moq} {product.unit}s</span></div>
              </div>
            </div>

            {/* Bulk Tiers */}
            {product.bulkPricing && product.bulkPricing.length > 0 && (
              <section className="space-y-4">
                <h3 className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/30">
                  <TrendingUp className="h-3 w-3" />
                  Bulk Discount Tiers
                </h3>
                <div className="grid gap-3 sm:grid-cols-2">
                  {product.bulkPricing.sort((a,b) => a.minQty - b.minQty).map((tier, idx) => (
                    <div key={idx} className={cn(
                      "flex items-center justify-between rounded-2xl border p-4 transition-all",
                      qty >= tier.minQty ? "border-leaf/50 bg-leaf/10" : "border-white/5 bg-black/20"
                    )}>
                      <div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{tier.minQty}+ {product.unit}s</div>
                        <div className="text-lg font-black text-white">{formatNairaFromKobo(tier.pricePerUnitKobo)}</div>
                      </div>
                      <div className="text-[10px] font-black uppercase text-leaf">
                        Save {Math.round((1 - tier.pricePerUnitKobo / product.priceKobo) * 100)}%
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Add to Cart Actions */}
            <section className="space-y-6 pt-6 border-t border-white/5">
              <div className="grid gap-6 sm:grid-cols-2 sm:items-end">
                <div className="space-y-3">
                  <Label htmlFor="qty" className="text-[10px] font-bold uppercase tracking-widest text-white/30">Select Quantity</Label>
                  <div className="flex h-14 items-center rounded-2xl border border-white/10 bg-black/40 p-1">
                    <button 
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="flex h-full w-12 items-center justify-center rounded-xl text-xl text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      −
                    </button>
                    <input 
                      id="qty"
                      type="number"
                      value={qty}
                      onChange={e => setQty(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-transparent text-center text-lg font-bold text-white outline-none"
                    />
                    <button 
                      onClick={() => setQty(qty + 1)}
                      className="flex h-full w-12 items-center justify-center rounded-xl text-xl text-white/40 transition-colors hover:bg-white/5 hover:text-white"
                    >
                      +
                    </button>
                  </div>
                </div>
                <Button 
                  onClick={handleAddToCart}
                  disabled={qty < product.moq}
                  className="group relative h-14 w-full overflow-hidden rounded-2xl shadow-xl shadow-leaf/10"
                >
                  <span className="relative z-10 flex items-center gap-2 font-bold">
                    Add to Cart
                    <ShoppingBag className="h-5 w-5" />
                  </span>
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                </Button>
              </div>

              <div className="grid gap-3">
                <Button 
                  variant="secondary" 
                  className="h-14 w-full rounded-2xl border-white/10 text-white/60 hover:text-white"
                  onClick={() => setIsInquiryMode(true)}
                >
                  <MessageSquare className="mr-2 h-5 w-5" />
                  Request Bulk Quote (5+ Tons)
                </Button>
                
                <div className="rounded-2xl border border-gold/20 bg-gold/5 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-gold/10 text-gold">
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div className="text-xs font-bold text-white">Trust this Vendor?</div>
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 rounded-lg text-[10px] font-black uppercase text-gold hover:bg-gold/10">
                      Vote (50 Credits)
                    </Button>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Inquiry Modal */}
      {isInquiryMode && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
          <div className="w-full max-w-md rounded-[32px] border border-forest/30 bg-[#071512] p-8 shadow-2xl animate-in zoom-in-95">
            <h2 className="font-display text-2xl font-bold text-white mb-2">Request Bulk Quote</h2>
            <p className="text-sm text-white/50 mb-6">Enter your requirements and the vendor will get back to you with a custom quote.</p>
            
            <form onSubmit={handleRequestQuote} className="space-y-5">
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Target Quantity ({product.unit})</Label>
                <Input 
                  type="number" 
                  value={qty} 
                  onChange={e => setQty(Number(e.target.value))}
                  className="h-12 bg-black/40 border-white/10"
                />
              </div>
              <div className="space-y-2">
                <Label className="text-[10px] font-bold uppercase tracking-widest text-white/30">Additional Notes</Label>
                <textarea 
                  value={inquiryNotes}
                  onChange={e => setInquiryNotes(e.target.value)}
                  placeholder="e.g. Delivery location, packaging preferences, frequency..."
                  className="w-full min-h-[100px] rounded-xl border border-white/10 bg-black/40 p-4 text-sm text-white placeholder:text-white/20 outline-none focus:border-leaf/50"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="ghost" className="flex-1 rounded-xl" onClick={() => setIsInquiryMode(false)}>Cancel</Button>
                <Button variant="primary" className="flex-1 rounded-xl" type="submit" disabled={busy}>
                  {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : "Send Request"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}

function Loader2(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
