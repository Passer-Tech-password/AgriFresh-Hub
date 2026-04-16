"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthStore } from "@/features/auth/auth-store";
import { createProduct } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Vegetables", "Fruits", "Livestock", "Poultry", "Fish & Seafood", 
  "Grains & Tubers", "Spices & Herbs", "Frozen Foods", "Oils & Fats", "Kitchen Utensils"
];

export default function NewProductPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);

  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [unit, setUnit] = React.useState<"kg" | "ton" | "bag" | "crate" | "liter" | "pack">("kg");
  const [priceNaira, setPriceNaira] = React.useState("5000");
  const [stock, setStock] = React.useState("100");
  const [description, setDescription] = React.useState("");
  const [moq, setMoq] = React.useState("1");
  const [isPerishable, setIsPerishable] = React.useState(true);
  const [requiresColdChain, setRequiresColdChain] = React.useState(false);
  const [maxVolumeTons, setMaxVolumeTons] = React.useState("10");
  const [bulkPricing, setBulkPricing] = React.useState<Array<{ minQty: number; pricePerUnitKobo: number }>>([]);
  const [busy, setBusy] = React.useState(false);

  const [newTierQty, setNewTierQty] = React.useState("");
  const [newTierPrice, setNewTierPrice] = React.useState("");

  const addTier = () => {
    const qty = Number(newTierQty);
    const price = Number(newTierPrice);
    if (qty > 0 && price > 0) {
      setBulkPricing([...bulkPricing, { minQty: qty, pricePerUnitKobo: Math.round(price * 100) }].sort((a,b) => a.minQty - b.minQty));
      setNewTierQty("");
      setNewTierPrice("");
    }
  };

  const removeTier = (idx: number) => {
    setBulkPricing(bulkPricing.filter((_, i) => i !== idx));
  };

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!user) return;

    const cleanName = name.trim();
    const cleanCategory = category.trim();
    const cleanDesc = description.trim();

    const parsedPrice = Number(priceNaira);
    const parsedStock = Number(stock);
    const parsedMoq = Number(moq);
    const parsedMaxVolume = Number(maxVolumeTons);

    if (!cleanName || !cleanCategory) {
      toast.error("Complete all required fields.");
      return;
    }
    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Enter a valid price.");
      return;
    }

    setBusy(true);
    try {
      await createProduct({
        vendorId: user.uid,
        name: cleanName,
        category: cleanCategory,
        unit,
        priceKobo: Math.round(parsedPrice * 100),
        stock: Math.floor(parsedStock),
        description: cleanDesc ? cleanDesc : null,
        moq: parsedMoq || 1,
        bulkPricing,
        isPerishable,
        requiresColdChain,
        maxVolumeTons: parsedMaxVolume || null
      });
      toast.success("Product created with bulk options.");
      router.replace("/vendor/products");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create product.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireAuth requireRole="vendor_approved">
      <main className="mx-auto w-full max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="space-y-2">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-3 py-1 text-xs text-leaf backdrop-blur">
              Product Listing
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-white">
              Add New Listing
            </h1>
            <p className="text-sm text-white/60">
              Set your price, MOQ, and bulk tiers for retail and B2B buyers.
            </p>
          </header>

          <form onSubmit={onSubmit} className="grid gap-6 lg:grid-cols-2">
            <div className="space-y-6 rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur">
              <h3 className="font-display text-xl font-semibold text-white">Basic Information</h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Product name</Label>
                  <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Fresh Tomatoes" />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select 
                      id="category" 
                      value={category} 
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full h-10 rounded-2xl border border-forest/40 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-leaf"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="unit">Base Unit</Label>
                    <select 
                      id="unit" 
                      value={unit} 
                      onChange={(e) => setUnit(e.target.value as any)}
                      className="w-full h-10 rounded-2xl border border-forest/40 bg-black/40 px-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-leaf"
                    >
                      <option value="kg">kg</option>
                      <option value="ton">ton</option>
                      <option value="bag">bag</option>
                      <option value="crate">crate</option>
                      <option value="liter">liter</option>
                      <option value="pack">pack</option>
                    </select>
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="price">Base Price (₦ per {unit})</Label>
                    <Input id="price" type="number" value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="stock">Total Stock</Label>
                    <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="desc">Description</Label>
                  <textarea
                    id="desc"
                    className="w-full min-h-[100px] rounded-2xl border border-forest/40 bg-black/40 p-4 text-sm text-white focus:outline-none focus:ring-1 focus:ring-leaf"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <section className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur">
                <h3 className="font-display text-xl font-semibold text-white mb-4">Bulk & Logistics</h3>
                <div className="space-y-4">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="moq">Min. Order Qty (MOQ)</Label>
                      <Input id="moq" type="number" value={moq} onChange={(e) => setMoq(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maxVol">Max. Capacity (tons)</Label>
                      <Input id="maxVol" type="number" value={maxVolumeTons} onChange={(e) => setMaxVolumeTons(e.target.value)} />
                    </div>
                  </div>
                  
                  <div className="flex flex-col gap-3 pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={isPerishable} onChange={e => setIsPerishable(e.target.checked)} className="h-5 w-5 rounded border-forest/40 bg-black/40 text-leaf" />
                      <span className="text-sm text-white/80">Perishable Item</span>
                    </label>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input type="checkbox" checked={requiresColdChain} onChange={e => setRequiresColdChain(e.target.checked)} className="h-5 w-5 rounded border-forest/40 bg-black/40 text-leaf" />
                      <span className="text-sm text-white/80">Requires Cold-Chain Monitoring</span>
                    </label>
                  </div>
                </div>
              </section>

              <section className="rounded-3xl border border-forest/25 bg-black/20 p-8 backdrop-blur">
                <h3 className="font-display text-xl font-semibold text-white mb-4">Bulk Pricing Tiers</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1">
                      <Input placeholder={`Min ${unit}`} type="number" value={newTierQty} onChange={e => setNewTierQty(e.target.value)} />
                    </div>
                    <div className="col-span-1">
                      <Input placeholder="₦/unit" type="number" value={newTierPrice} onChange={e => setNewTierPrice(e.target.value)} />
                    </div>
                    <Button type="button" variant="secondary" onClick={addTier} className="rounded-2xl h-10">Add Tier</Button>
                  </div>
                  
                  <div className="space-y-2">
                    {bulkPricing.map((tier, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 rounded-2xl bg-leaf/5 border border-leaf/20">
                        <div className="text-sm text-white/80">
                          {tier.minQty} {unit}+ @ {formatNairaFromKobo(tier.pricePerUnitKobo)}
                        </div>
                        <button type="button" onClick={() => removeTier(idx)} className="text-xs text-orange-400 hover:text-orange-300">Remove</button>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              <div className="flex items-center gap-4">
                <Link href="/vendor/products" className="flex-1">
                  <Button variant="ghost" className="w-full rounded-2xl h-12">Cancel</Button>
                </Link>
                <Button type="submit" disabled={busy} className="flex-1 rounded-2xl h-12 shadow-lift">
                  {busy ? "Creating Listing..." : "Create Listing"}
                </Button>
              </div>
            </div>
          </form>
        </div>
      </main>
    </RequireAuth>
  );
}

