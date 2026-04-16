"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { listVendorProducts, updateProduct } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import type { ProductDoc } from "@/types/product";

export default function VendorProductsPage() {
  const user = useAuthStore((s) => s.firebaseUser);

  const [loading, setLoading] = React.useState(true);
  const [products, setProducts] = React.useState<Array<ProductDoc & { id: string }>>([]);

  const vendorId = user?.uid ?? "";

  React.useEffect(() => {
    if (!vendorId) return;
    let active = true;
    setLoading(true);
    listVendorProducts(vendorId)
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
    return () => {
      active = false;
    };
  }, [vendorId]);

  async function toggleActive(p: ProductDoc & { id: string }) {
    try {
      await updateProduct(p.id, { active: !p.active });
      setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, active: !x.active } : x)));
      toast.success(p.active ? "Product paused." : "Product activated.");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to update product.";
      toast.error(message);
    }
  }

  return (
    <RequireAuth requireRole="vendor_approved">
      <main className="mx-auto w-full max-w-6xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold backdrop-blur">
                Vendor
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
                Your products
              </h1>
              <p className="text-sm text-white/60">
                Create listings for the marketplace. Toggle active to pause sales.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/vendor/products/new">
                <Button size="lg">Add product</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="secondary">Dashboard</Button>
              </Link>
            </div>
          </header>

          {loading ? (
            <div className="rounded-3xl border border-forest/25 bg-black/20 p-8 text-white/70 backdrop-blur">
              Loading…
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-3xl border border-forest/25 bg-black/20 p-8 text-white/70 backdrop-blur">
              <div className="space-y-3">
                <div className="font-display text-xl font-semibold text-white">
                  No products yet
                </div>
                <div className="text-sm text-white/60">
                  Add your first listing to appear in the marketplace.
                </div>
                <div className="pt-2">
                  <Link href="/vendor/products/new">
                    <Button size="lg">Create product</Button>
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((p) => (
                <div
                  key={p.id}
                  className="rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur"
                >
                  <div className="space-y-3">
                    <div className="space-y-1">
                      <div className="font-display text-lg font-semibold text-white">{p.name}</div>
                      <div className="text-xs text-white/60">
                        {p.category} · {p.unit}
                      </div>
                    </div>
                    <div className="text-sm font-semibold text-white">
                      {formatNairaFromKobo(p.priceKobo)}
                    </div>
                    <div className="text-xs text-white/55">Stock: {p.stock}</div>
                    <div className="flex items-center justify-between gap-3 pt-2">
                      <div
                        className={
                          p.active
                            ? "rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs font-semibold text-leaf"
                            : "rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold text-white/70"
                        }
                      >
                        {p.active ? "Active" : "Paused"}
                      </div>
                      <Button
                        variant="secondary"
                        onClick={() => toggleActive(p)}
                        className="min-w-28"
                      >
                        {p.active ? "Pause" : "Activate"}
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </RequireAuth>
  );
}

