"use client";

import * as React from "react";
import Link from "next/link";
import { 
  Search, 
  Filter, 
  ShoppingBag, 
  MapPin, 
  Sparkles, 
  ArrowRight,
  Thermometer,
  Snowflake,
  Clock,
  LayoutGrid,
  List,
  ChevronDown
} from "lucide-react";
import { useSearchParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useCartStore } from "@/features/cart/cart-store";
import { listMarketplaceProducts } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductDoc } from "@/types/product";

const CATEGORIES = ["All", "Vegetables", "Fruits", "Livestock", "Poultry", "Fish & Seafood", "Grains & Tubers", "Frozen Foods", "Kitchen"];

export default function MarketplacePage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const cartCount = useCartStore((s) => s.items.reduce((sum, i) => sum + i.quantity, 0));

  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Array<ProductDoc & { id: string }>>([]);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [activeCategory, setActiveCategory] = React.useState(searchParams.get("category") || "All");
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");

  React.useEffect(() => {
    let active = true;
    setLoading(true);
    listMarketplaceProducts()
      .then((data) => {
        if (!active) return;
        setProducts(data.filter((p): p is ProductDoc & { id: string } => Boolean(p.id)));
      })
      .catch(() => {
        if (!active) return;
        setProducts([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });
    return () => { active = false; };
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         p.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = activeCategory === "All" || p.category.toLowerCase() === activeCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-10">
      <div className="space-y-12 animate-in fade-in duration-700">
        
        {/* Header Section */}
        <header className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-leaf/25 bg-black/25 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-leaf backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-leaf shadow-[0_0_10px_rgba(74,222,128,0.5)]" />
              Real-time Marketplace
            </div>
            <h1 className="font-display text-4xl font-bold tracking-tight text-white sm:text-5xl">
              Fresh from the <span className="text-leaf text-glow">Source</span>.
            </h1>
            <p className="max-w-xl text-sm leading-relaxed text-white/50">
              Direct access to Rivers State's finest producers. Every listing is verified for quality and cold-chain compliance.
            </p>
          </div>
          
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/cart">
              <Button variant="secondary" className="group relative h-12 rounded-2xl border-white/10 px-6">
                <ShoppingBag className="mr-2 h-4 w-4 text-leaf" />
                Cart
                {cartCount > 0 && (
                  <span className="ml-2 flex h-5 w-5 items-center justify-center rounded-full bg-leaf text-[10px] font-black text-forest">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="h-12 rounded-2xl text-white/40 hover:text-white">Dashboard</Button>
            </Link>
          </div>
        </header>

        {/* Filter & Search Bar */}
        <section className="sticky top-4 z-30 rounded-[32px] border border-forest/20 bg-[#071512]/80 p-3 shadow-2xl backdrop-blur-xl lg:p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              <Input 
                placeholder="Search okra, chicken, yams..." 
                className="h-12 border-none bg-white/5 pl-11 focus:ring-leaf/20"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            
            <div className="h-px w-full bg-white/5 lg:h-8 lg:w-px" />

            <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide pb-1 lg:pb-0">
              {CATEGORIES.map(cat => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={cn(
                    "whitespace-nowrap rounded-xl px-4 py-2 text-xs font-bold transition-all",
                    activeCategory === cat 
                      ? "bg-leaf text-forest shadow-[0_0_20px_rgba(74,222,128,0.3)]" 
                      : "text-white/40 hover:bg-white/5 hover:text-white"
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="hidden lg:flex items-center gap-2 pl-2">
              <button 
                onClick={() => setViewMode("grid")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "grid" ? "bg-white/10 text-leaf" : "text-white/20 hover:text-white")}
              >
                <LayoutGrid className="h-4 w-4" />
              </button>
              <button 
                onClick={() => setViewMode("list")}
                className={cn("p-2 rounded-lg transition-colors", viewMode === "list" ? "bg-white/10 text-leaf" : "text-white/20 hover:text-white")}
              >
                <List className="h-4 w-4" />
              </button>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        {loading ? (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex flex-col gap-4 animate-pulse">
                <div className="aspect-[4/3] rounded-[32px] bg-white/5" />
                <div className="h-6 w-3/4 bg-white/5 rounded-lg" />
                <div className="h-4 w-1/2 bg-white/5 rounded-lg" />
                <div className="mt-2 flex items-center justify-between">
                  <div className="h-8 w-1/3 bg-white/5 rounded-lg" />
                  <div className="h-10 w-10 bg-white/5 rounded-xl" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 text-center space-y-6 rounded-[40px] border border-dashed border-forest/20 bg-black/10">
            <div className="p-6 rounded-full bg-forest/20 text-leaf">
              <Search className="h-12 w-12" />
            </div>
            <div className="space-y-2">
              <h3 className="font-display text-2xl font-bold text-white">No listings found</h3>
              <p className="text-sm text-white/40">Try adjusting your filters or search terms.</p>
            </div>
            <Button variant="secondary" onClick={() => { setSearchQuery(""); setActiveCategory("All"); }} className="rounded-xl">
              Clear all filters
            </Button>
          </div>
        ) : (
          <section className={cn(
            "grid gap-6",
            viewMode === "grid" ? "sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3" : "grid-cols-1"
          )}>
            {filteredProducts.map((p, i) => (
              <Link 
                key={p.id} 
                href={`/product/${p.id}`}
                style={{ animationDelay: `${i * 50}ms` }}
                className="group relative flex flex-col overflow-hidden rounded-[32px] border border-forest/20 bg-gradient-to-b from-white/[0.03] to-transparent transition-all duration-500 hover:-translate-y-2 hover:border-leaf/30 hover:shadow-lift animate-in fade-in slide-in-from-bottom-4 fill-mode-both"
              >
                {/* Image Section */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {p.imageUrl ? (
                    <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-forest/20">
                      <ShoppingBag className="h-12 w-12 text-leaf/20" />
                    </div>
                  )}
                  
                  {/* Badges */}
                  <div className="absolute left-4 top-4 flex flex-col gap-2">
                    {p.requiresColdChain && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-blue-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-blue-300 backdrop-blur-md border border-blue-500/20">
                        <Snowflake className="h-3 w-3" />
                        Cold-Chain
                      </div>
                    )}
                    {p.isPerishable && (
                      <div className="inline-flex items-center gap-1.5 rounded-full bg-orange-500/20 px-2.5 py-1 text-[9px] font-black uppercase tracking-widest text-orange-300 backdrop-blur-md border border-orange-500/20">
                        <Clock className="h-3 w-3" />
                        Perishable
                      </div>
                    )}
                  </div>

                  <div className="absolute bottom-4 left-4 right-4 translate-y-8 opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div className="rounded-2xl bg-black/60 p-3 text-center backdrop-blur-md">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-leaf">Quick View →</span>
                    </div>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex flex-1 flex-col p-6">
                  <div className="mb-auto space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-white/30">{p.category}</span>
                      <div className="flex items-center gap-1 text-[10px] font-bold text-white/40">
                        <MapPin className="h-3 w-3 text-leaf" />
                        Rivers State
                      </div>
                    </div>
                    <h3 className="font-display text-xl font-bold text-white group-hover:text-leaf transition-colors">{p.name}</h3>
                  </div>

                  <div className="mt-6 flex items-end justify-between">
                    <div className="space-y-1">
                      <div className="text-2xl font-black text-white">{formatNairaFromKobo(p.priceKobo)}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">per {p.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-leaf">MOQ</div>
                      <div className="text-sm font-bold text-white">{p.moq} {p.unit}s</div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}

        {/* Promo Banner */}
        <section className="group relative overflow-hidden rounded-[40px] border border-leaf/20 bg-leaf/5 p-8 lg:p-12">
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-leaf/10 blur-3xl transition-transform duration-700 group-hover:scale-150" />
          <div className="relative z-10 flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-4">
              <h2 className="font-display text-3xl font-bold text-white">Scale your business with <span className="text-leaf">Bulk Orders</span></h2>
              <p className="max-w-xl text-sm leading-relaxed text-white/50">
                Are you a restaurant or retailer? Request custom quotes for orders over 5 tons and enjoy 
                prioritized logistics and discounted rates.
              </p>
            </div>
            <Link href="/vendor/apply">
              <Button size="lg" className="h-14 rounded-2xl px-8 shadow-xl shadow-leaf/10">
                Become a Bulk Vendor
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
