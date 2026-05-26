"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { 
  Plus, 
  Search, 
  LayoutGrid, 
  List, 
  MoreVertical, 
  Edit3, 
  PauseCircle, 
  PlayCircle,
  Package,
  AlertTriangle,
  ArrowRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/features/auth/auth-store";
import { listVendorProducts, updateProduct } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";
import type { ProductDoc } from "@/types/product";

export default function VendorInventoryPage() {
  const user = useAuthStore((s) => s.firebaseUser);

  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Array<ProductDoc & { id: string }>>([]);
  const [viewMode, setViewMode] = React.useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = React.useState("");

  const vendorId = user?.uid ?? "";

  React.useEffect(() => {
    if (!vendorId) return;
    loadProducts();
  }, [vendorId]);

  async function loadProducts() {
    setLoading(true);
    try {
      const data = await listVendorProducts(vendorId);
      setProducts(data.filter((p): p is ProductDoc & { id: string } => Boolean(p.id)));
    } catch (err) {
      toast.error("Failed to load inventory.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleActive(p: ProductDoc & { id: string }) {
    try {
      await updateProduct(p.id, { active: !p.active });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
      toast.success(p.active ? "Listing paused." : "Listing activated.");
    } catch (err) {
      toast.error("Unable to update product status.");
    }
  }

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header */}
      <header className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-1">
          <h1 className="font-display text-4xl font-bold tracking-tight text-white">
            Inventory <span className="text-leaf">Management</span>.
          </h1>
          <p className="text-sm text-white/50">
            Control your marketplace listings and stock levels.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-2xl border border-forest/20 bg-black/20 p-1 backdrop-blur">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "grid" ? "bg-leaf text-[#04110D]" : "text-white/40 hover:text-white"
              )}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn(
                "p-2 rounded-xl transition-all",
                viewMode === "list" ? "bg-leaf text-[#04110D]" : "text-white/40 hover:text-white"
              )}
            >
              <List className="h-4 w-4" />
            </button>
          </div>
          <Link href="/vendor/products/new">
            <Button className="rounded-2xl h-12 px-6 shadow-lift">
              <Plus className="mr-2 h-4 w-4" />
              Add Product
            </Button>
          </Link>
        </div>
      </header>

      {/* Filters & Search */}
      <section className="flex flex-col gap-4 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
          <Input 
            placeholder="Search products by name or category..." 
            className="h-12 pl-12 rounded-2xl border-forest/20 bg-black/20 focus:ring-leaf/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </section>

      {/* Product List */}
      {loading ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-64 animate-pulse rounded-[32px] bg-white/5 border border-forest/10" />
          ))}
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="rounded-[40px] border border-forest/20 bg-black/20 p-20 text-center space-y-6 backdrop-blur">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-[28px] bg-white/5 text-white/20">
            <Package className="h-10 w-10" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">No products found</h3>
            <p className="text-sm text-white/40 max-w-xs mx-auto">
              {searchQuery ? "Try adjusting your search filters." : "Start by adding your first product listing."}
            </p>
          </div>
          {!searchQuery && (
            <Link href="/vendor/products/new">
              <Button variant="secondary" className="rounded-xl">Create Listing</Button>
            </Link>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProducts.map((p) => (
            <div key={p.id} className="group relative overflow-hidden rounded-[32px] border border-forest/20 bg-black/20 p-5 backdrop-blur transition-all hover:border-leaf/30 hover:shadow-lift">
              <div className="relative aspect-video overflow-hidden rounded-2xl bg-white/5 mb-5">
                {p.imageUrl ? (
                  <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/10">
                    <Package className="h-12 w-12" />
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className={cn(
                    "rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-widest backdrop-blur-md border",
                    p.active ? "bg-leaf/20 text-leaf border-leaf/30" : "bg-white/10 text-white/40 border-white/10"
                  )}>
                    {p.active ? "Live" : "Paused"}
                  </span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-leaf/60">{p.category}</span>
                    {p.stock < 10 && (
                      <span className="flex items-center gap-1 text-[9px] font-black uppercase text-rose-400">
                        <AlertTriangle className="h-3 w-3" />
                        Low Stock
                      </span>
                    )}
                  </div>
                  <h3 className="font-display text-lg font-bold text-white group-hover:text-leaf transition-colors">{p.name}</h3>
                </div>

                <div className="flex items-end justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <div className="text-xl font-black text-white">{formatNairaFromKobo(p.priceKobo)}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">per {p.unit}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => toggleActive(p)}
                      className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-white transition-colors border border-white/5"
                    >
                      {p.active ? <PauseCircle className="h-5 w-5" /> : <PlayCircle className="h-5 w-5" />}
                    </button>
                    <Link href={`/vendor/products/edit/${p.id}`}>
                      <button className="p-2 rounded-xl bg-white/5 text-white/40 hover:text-leaf transition-colors border border-white/5">
                        <Edit3 className="h-5 w-5" />
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="rounded-[32px] border border-forest/20 bg-black/20 backdrop-blur overflow-hidden">
          <table className="w-full text-left">
            <thead className="border-b border-white/5 bg-white/5">
              <tr>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Product</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Price</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Stock</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30">Status</th>
                <th className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-white/30 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-xl bg-white/5 overflow-hidden border border-white/10 shrink-0">
                        {p.imageUrl && <img src={p.imageUrl} alt={p.name} className="h-full w-full object-cover" />}
                      </div>
                      <div className="space-y-0.5">
                        <div className="font-bold text-white group-hover:text-leaf transition-colors">{p.name}</div>
                        <div className="text-[10px] font-bold text-white/30 uppercase tracking-widest">{p.category}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {formatNairaFromKobo(p.priceKobo)}
                    <span className="text-[10px] text-white/30 ml-1 font-normal uppercase">/ {p.unit}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className={cn("font-bold", p.stock < 10 ? "text-rose-400" : "text-white")}>{p.stock}</span>
                      <span className="text-[10px] text-white/30 uppercase font-bold tracking-widest">{p.unit}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      "inline-flex rounded-full px-2 py-0.5 text-[9px] font-black uppercase tracking-widest border",
                      p.active ? "bg-leaf/20 text-leaf border-leaf/30" : "bg-white/10 text-white/40 border-white/10"
                    )}>
                      {p.active ? "Active" : "Paused"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => toggleActive(p)}
                        className="p-2 rounded-xl hover:bg-white/5 transition-colors"
                      >
                        {p.active ? <PauseCircle className="h-5 w-5 text-white/40" /> : <PlayCircle className="h-5 w-5 text-leaf" />}
                      </button>
                      <Link href={`/vendor/products/edit/${p.id}`}>
                        <button className="p-2 rounded-xl hover:bg-white/5 text-white/40 hover:text-leaf transition-colors">
                          <Edit3 className="h-5 w-5" />
                        </button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Floating Add Button for Mobile */}
      <div className="fixed bottom-6 right-6 lg:hidden">
        <Link href="/vendor/products/new">
          <button className="flex h-14 w-14 items-center justify-center rounded-2xl bg-leaf text-[#04110D] shadow-[0_10px_30px_rgba(74,222,128,0.5)] transition-transform active:scale-95">
            <Plus className="h-6 w-6" />
          </button>
        </Link>
      </div>
    </div>
  );
}
