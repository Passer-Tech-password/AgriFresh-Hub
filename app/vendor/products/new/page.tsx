"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Package, 
  Tag, 
  Truck, 
  Layers, 
  Eye,
  Info,
  Sparkles,
  ArrowRight
} from "lucide-react";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuthStore } from "@/features/auth/auth-store";
import { createProduct } from "@/features/products/products-client";
import { formatNairaFromKobo } from "@/lib/money";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  "Vegetables", "Fruits", "Livestock", "Poultry", "Fish & Seafood", 
  "Grains & Tubers", "Spices & Herbs", "Frozen Foods", "Oils & Fats", "Kitchen Utensils"
];

const STEPS = [
  { id: "basic", title: "Basic Info", icon: Package },
  { id: "pricing", title: "Pricing", icon: Tag },
  { id: "bulk", title: "Bulk Tiers", icon: Layers },
  { id: "logistics", title: "Logistics", icon: Truck },
  { id: "review", title: "Review", icon: Eye },
];

export default function NewProductPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.firebaseUser);

  const [step, setStep] = React.useState(0);
  const [name, setName] = React.useState("");
  const [category, setCategory] = React.useState(CATEGORIES[0]);
  const [unit, setUnit] = React.useState<"kg" | "ton" | "bag" | "crate" | "liter" | "pack">("kg");
  const [priceNaira, setPriceNaira] = React.useState("5000");
  const [stock, setStock] = React.useState("100");
  const [description, setDescription] = React.useState("");
  const [imageUrl, setImageUrl] = React.useState("");
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

  const nextStep = () => {
    if (step === 0 && !name.trim()) {
      toast.error("Please enter a product name.");
      return;
    }
    if (step === 1 && (Number(priceNaira) <= 0 || Number(stock) < 0)) {
      toast.error("Please enter valid price and stock.");
      return;
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  };

  const prevStep = () => setStep(s => Math.max(s - 1, 0));

  async function onSubmit() {
    if (busy || !user) return;

    setBusy(true);
    try {
      await createProduct({
        vendorId: user.uid,
        name: name.trim(),
        category: category.trim(),
        unit,
        priceKobo: Math.round(Number(priceNaira) * 100),
        stock: Math.floor(Number(stock)),
        description: description.trim() || null,
        imageUrl: imageUrl.trim() || null,
        moq: Number(moq) || 1,
        bulkPricing,
        isPerishable,
        requiresColdChain,
        maxVolumeTons: Number(maxVolumeTons) || undefined
      });
      toast.success("Product listing created successfully!");
      router.replace("/vendor/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Unable to create product.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      {/* Header & Progress */}
      <header className="space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-display text-4xl font-bold tracking-tight text-white">
              Listing <span className="text-leaf">Builder</span>.
            </h1>
            <p className="text-sm text-white/50">
              Step {step + 1} of {STEPS.length}: {STEPS[step].title}
            </p>
          </div>
          <Link href="/vendor/products">
            <Button variant="ghost" className="text-white/40 hover:text-white">
              Exit Builder
            </Button>
          </Link>
        </div>

        {/* Step Indicator */}
        <div className="relative flex justify-between max-w-2xl mx-auto px-4">
          <div className="absolute top-5 left-8 right-8 h-0.5 bg-forest/20 z-0" />
          <div 
            className="absolute top-5 left-8 h-0.5 bg-leaf transition-all duration-500 z-0" 
            style={{ width: `calc(${(step / (STEPS.length - 1)) * 100}% - 16px)` }}
          />
          {STEPS.map((s, i) => (
            <div key={s.id} className="relative z-10 flex flex-col items-center gap-2">
              <div 
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-2xl border-2 transition-all duration-300",
                  i <= step ? "border-leaf bg-leaf text-[#04110D] shadow-[0_0_20px_rgba(74,222,128,0.3)]" : "border-forest/40 bg-[#071512] text-white/40",
                  i === step && "ring-4 ring-leaf/10"
                )}
              >
                {i < step ? <Check className="h-5 w-5" /> : <s.icon className="h-5 w-5" />}
              </div>
              <span className={cn("text-[10px] font-black uppercase tracking-widest hidden sm:block", i <= step ? "text-leaf" : "text-white/20")}>
                {s.title}
              </span>
            </div>
          ))}
        </div>
      </header>

      <div className="grid gap-10 lg:grid-cols-3">
        {/* Main Form Area */}
        <div className="lg:col-span-2">
          <div className="min-h-[460px] rounded-[48px] border border-forest/20 bg-black/20 p-8 backdrop-blur-xl sm:p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-leaf/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000 pointer-events-none" />
            
            <div className="relative z-10 h-full flex flex-col">
              {step === 0 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">Basic Information</h3>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Identify your produce</p>
                  </div>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="name" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Product Name</Label>
                      <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g., Premium Fresh Tomatoes" className="h-14 text-lg rounded-2xl border-forest/20 bg-black/40 focus:ring-leaf/50" />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="category" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Category</Label>
                        <select 
                          id="category" 
                          value={category} 
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full h-14 rounded-2xl border border-forest/20 bg-black/40 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-leaf/50 transition-all"
                        >
                          {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="unit" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Base Unit</Label>
                        <select 
                          id="unit" 
                          value={unit} 
                          onChange={(e) => setUnit(e.target.value as any)}
                          className="w-full h-14 rounded-2xl border border-forest/20 bg-black/40 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-leaf/50 transition-all"
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
                    <div className="space-y-2">
                      <Label htmlFor="imageUrl" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Image URL</Label>
                      <Input id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} placeholder="https://unsplash.com/..." className="h-14 rounded-2xl border-forest/20 bg-black/40" />
                    </div>
                  </div>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">Pricing & Inventory</h3>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Set your commercial rates</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid gap-6 sm:grid-cols-2">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Base Price (₦ per {unit})</Label>
                        <div className="relative">
                          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 font-bold">₦</span>
                          <Input id="price" type="number" value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} className="h-14 pl-10 rounded-2xl border-forest/20 bg-black/40" />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="stock" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Total Stock ({unit})</Label>
                        <Input id="stock" type="number" value={stock} onChange={(e) => setStock(e.target.value)} className="h-14 rounded-2xl border-forest/20 bg-black/40" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="moq" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Min. Order Qty (MOQ)</Label>
                      <Input id="moq" type="number" value={moq} onChange={(e) => setMoq(e.target.value)} className="h-14 rounded-2xl border-forest/20 bg-black/40" />
                      <p className="text-[10px] text-white/20 italic ml-1">Smallest amount a single buyer can purchase.</p>
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">Bulk Pricing Tiers</h3>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Reward large volume buyers</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4 p-6 rounded-[32px] bg-leaf/5 border border-leaf/10 backdrop-blur-sm">
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Min {unit}</Label>
                        <Input placeholder={`e.g. 10`} type="number" value={newTierQty} onChange={e => setNewTierQty(e.target.value)} className="h-10 rounded-xl border-forest/20 bg-black/40" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-[9px] font-black uppercase tracking-widest text-white/40">Price per {unit}</Label>
                        <Input placeholder="e.g. 4500" type="number" value={newTierPrice} onChange={e => setNewTierPrice(e.target.value)} className="h-10 rounded-xl border-forest/20 bg-black/40" />
                      </div>
                      <div className="flex items-end">
                        <Button type="button" variant="secondary" onClick={addTier} className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest bg-leaf text-[#04110D] border-none shadow-lift hover:scale-[1.02]">Add Tier</Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 max-h-[180px] overflow-y-auto pr-2 custom-scrollbar">
                      {bulkPricing.length === 0 ? (
                        <div className="py-10 text-center border-2 border-dashed border-forest/10 rounded-[32px]">
                          <p className="text-xs text-white/20 uppercase font-black tracking-widest">No bulk strategy defined</p>
                        </div>
                      ) : (
                        bulkPricing.map((tier, idx) => (
                          <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/tier transition-all hover:border-leaf/30">
                            <div className="flex items-center gap-4">
                              <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-leaf/10 text-leaf text-xs font-black">
                                {idx + 1}
                              </div>
                              <div className="text-sm text-white font-medium">
                                <span className="text-white/40">From</span> <span className="font-black">{tier.minQty} {unit}</span> <ArrowRight className="inline h-3 w-3 mx-1 opacity-40" /> <span className="text-leaf font-black">{formatNairaFromKobo(tier.pricePerUnitKobo)}</span>
                              </div>
                            </div>
                            <button type="button" onClick={() => removeTier(idx)} className="text-[9px] text-rose-400 font-black uppercase tracking-widest opacity-0 group-hover/tier:opacity-100 transition-opacity">Remove</button>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">Logistics & Handling</h3>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Define storage & freshness needs</p>
                  </div>
                  <div className="space-y-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="flex items-center justify-between p-6 rounded-[32px] border border-forest/20 bg-white/5 transition-all hover:border-leaf/20">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Perishable</h4>
                          <p className="text-[10px] text-white/30 font-medium">Sensitive to time/temp?</p>
                        </div>
                        <Switch checked={isPerishable} onCheckedChange={setIsPerishable} />
                      </div>

                      <div className="flex items-center justify-between p-6 rounded-[32px] border border-forest/20 bg-white/5 transition-all hover:border-blue-500/20">
                        <div className="space-y-1">
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">Cold-Chain</h4>
                          <p className="text-[10px] text-white/30 font-medium">Requires 4°C storage?</p>
                        </div>
                        <Switch checked={requiresColdChain} onCheckedChange={setRequiresColdChain} className="data-[state=checked]:bg-blue-500" />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="maxVol" className="text-[10px] font-black uppercase tracking-widest text-white/40 ml-1">Maximum Fulfillment Capacity (tons)</Label>
                      <Input id="maxVol" type="number" value={maxVolumeTons} onChange={(e) => setMaxVolumeTons(e.target.value)} className="h-14 rounded-2xl border-forest/20 bg-black/40" />
                    </div>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500 flex-1">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white">Review Listing</h3>
                    <p className="text-sm text-white/40 uppercase tracking-widest font-black">Final check before going live</p>
                  </div>
                  
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Product</div>
                      <div className="text-white font-bold truncate">{name}</div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Market Rate</div>
                      <div className="text-leaf font-black">{formatNairaFromKobo(Number(priceNaira) * 100)} / {unit}</div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Inventory</div>
                      <div className="text-white font-bold">{stock} {unit} available</div>
                    </div>
                    <div className="p-5 rounded-3xl bg-white/5 border border-white/5 space-y-1">
                      <div className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">Strategy</div>
                      <div className="text-white font-bold">{bulkPricing.length} bulk tiers set</div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <div className={cn(
                      "flex-1 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-center border transition-all",
                      isPerishable ? "bg-orange-500/10 text-orange-400 border-orange-500/20" : "bg-white/5 text-white/10 border-white/5"
                    )}>
                      Perishable
                    </div>
                    <div className={cn(
                      "flex-1 p-4 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] text-center border transition-all",
                      requiresColdChain ? "bg-blue-500/10 text-blue-400 border-blue-500/20" : "bg-white/5 text-white/10 border-white/5"
                    )}>
                      Cold-Chain
                    </div>
                  </div>
                </div>
              )}

              {/* Footer Controls */}
              <div className="mt-12 flex items-center justify-between border-t border-white/5 pt-8">
                <Button 
                  variant="ghost" 
                  onClick={prevStep}
                  disabled={step === 0}
                  className="h-12 px-6 rounded-2xl gap-2 text-white/40 hover:text-white"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Back
                </Button>
                
                {step < STEPS.length - 1 ? (
                  <Button 
                    onClick={nextStep}
                    className="h-12 px-10 rounded-2xl gap-2 shadow-[0_10px_30px_rgba(74,222,128,0.2)]"
                  >
                    Next Step
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button 
                    onClick={onSubmit}
                    disabled={busy}
                    className="h-12 px-12 rounded-2xl gap-2 bg-leaf text-[#04110D] font-black shadow-[0_15px_40px_rgba(74,222,128,0.3)] hover:scale-105 transition-all"
                  >
                    {busy ? "Publishing..." : "Launch Listing"}
                    <Sparkles className="h-4 w-4 fill-current" />
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar / Preview */}
        <aside className="space-y-8">
          {/* Live Preview Card */}
          <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
              <h4 className="text-[10px] font-black uppercase tracking-widest text-white/30">Real-time Preview</h4>
              <div className="h-2 w-2 rounded-full bg-leaf animate-pulse shadow-[0_0_10px_rgba(74,222,128,1)]" />
            </div>
            <div className="rounded-[40px] border border-forest/20 bg-gradient-to-b from-[#0A3D33]/40 to-transparent p-5 transition-all duration-700 shadow-2xl">
              <div className="relative aspect-square overflow-hidden rounded-[28px] bg-[#071512] border border-white/5">
                {imageUrl ? (
                  <img src={imageUrl} alt="Preview" className="h-full w-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-white/5">
                    <Package className="h-16 w-16" />
                  </div>
                )}
                {isPerishable && (
                  <div className="absolute top-3 right-3 px-3 py-1 rounded-full bg-gold text-[#04110D] text-[9px] font-black uppercase tracking-widest shadow-lift">
                    Fresh
                  </div>
                )}
              </div>
              <div className="mt-6 space-y-4">
                <div className="space-y-1">
                  <div className="text-[10px] font-black uppercase tracking-widest text-leaf/60">{category || "Category"}</div>
                  <h5 className="font-display text-xl font-bold text-white line-clamp-1">{name || "Listing Title"}</h5>
                </div>
                <div className="flex items-end justify-between border-t border-white/5 pt-4">
                  <div className="space-y-0.5">
                    <div className="text-2xl font-black text-white">{formatNairaFromKobo(Number(priceNaira) * 100)}</div>
                    <div className="text-[10px] font-black uppercase text-white/20 tracking-widest">per {unit}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] font-black uppercase text-leaf/40 tracking-widest">Min. Order</div>
                    <div className="text-sm font-black text-white">{moq} {unit}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Builder Tips */}
          <section className="rounded-[40px] border border-forest/20 bg-black/20 p-8 backdrop-blur space-y-6">
            <div className="flex items-center gap-3 text-gold">
              <div className="h-8 w-8 flex items-center justify-center rounded-xl bg-gold/10">
                <Info className="h-4 w-4" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest">Builder Tips</span>
            </div>
            <p className="text-xs text-white/50 leading-relaxed italic">
              {step === 0 && "Farmers who use clear, high-quality images see 3x more bulk inquiries."}
              {step === 1 && "Setting a fair MOQ (Minimum Order Quantity) helps balance retail and bulk trade."}
              {step === 2 && "Large hotels and restaurants in Port Harcourt prioritize vendors with bulk tiers."}
              {step === 3 && "Verified cold-chain listings are marked with a blue badge in the marketplace."}
              {step === 4 && "Almost live! Your listing will be immediately visible to thousands of buyers."}
            </p>
          </section>
        </aside>
      </div>
    </div>
  );
}
