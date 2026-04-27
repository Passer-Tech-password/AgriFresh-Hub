"use client";

import * as React from "react";
import Link from "next/link";
import { 
  ShoppingBag, 
  Sparkles, 
  Thermometer, 
  Zap, 
  Leaf, 
  Bird, 
  Snowflake, 
  Utensils, 
  ArrowRight,
  Clock,
  MapPin,
  Fish,
  Wheat,
  Beef
} from "lucide-react";

import { useAuthStore } from "@/features/auth/auth-store";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const CATEGORIES = [
  { name: "Vegetables", icon: Leaf, color: "text-emerald-400" },
  { name: "Grains & Tubers", icon: Wheat, color: "text-yellow-600" },
  { name: "Livestock", icon: Beef, color: "text-rose-600" },
  { name: "Poultry", icon: Bird, color: "text-orange-400" },
  { name: "Fish & Seafood", icon: Fish, color: "text-cyan-400" },
  { name: "Frozen Foods", icon: Snowflake, color: "text-blue-400" },
  { name: "Perishables", icon: Thermometer, color: "text-rose-400" },
  { name: "Kitchen", icon: Utensils, color: "text-amber-400" },
];

const FEATURED_PRODUCTS = [
  {
    id: "food-1",
    name: "Traditional Soup Pack",
    category: "Food",
    price: "₦15,000",
    unit: "per pack",
    freshness: "100%",
    timeLeft: "Cooked Today",
    image: "https://images.unsplash.com/photo-1547592166-23ac45744acd?auto=format&fit=crop&q=80&w=800",
    moq: "1 pack",
    location: "Port Harcourt"
  },
  {
    id: "kitchen-1",
    name: "Professional Knife Set",
    category: "Kitchen",
    price: "₦18,500",
    unit: "per set",
    freshness: "New",
    timeLeft: "In Stock",
    image: "https://images.unsplash.com/photo-1556910103-1c02745aae4d?auto=format&fit=crop&q=80&w=800",
    moq: "1 set",
    location: "Garrison, PH"
  },
  {
    id: "veg-1",
    name: "Organic Okra Bundles",
    category: "Vegetables",
    price: "₦2,500",
    unit: "per bundle",
    freshness: "98%",
    timeLeft: "24hrs left",
    image: "https://images.unsplash.com/photo-1566385101042-1a0aa0c1234c?auto=format&fit=crop&q=80&w=800",
    moq: "5 bundles",
    location: "Obio-Akpor, PH"
  },
  {
    id: "fruit-1",
    name: "Sweet Local Oranges",
    category: "Fruits",
    price: "₦3,500",
    unit: "per crate",
    freshness: "95%",
    timeLeft: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1557800636-894a64c1696f?auto=format&fit=crop&q=80&w=800",
    moq: "2 crates",
    location: "Rivers State"
  },
  {
    id: "livestock-1",
    name: "Live West African Goat",
    category: "Livestock",
    price: "₦45,000",
    unit: "per head",
    freshness: "100%",
    timeLeft: "Healthy",
    image: "https://images.unsplash.com/photo-1524024973431-2ad916746881?auto=format&fit=crop&q=80&w=800",
    moq: "1 head",
    location: "Choba, PH"
  },
  {
    id: "frozen-1",
    name: "Frozen Chicken Wings",
    category: "Frozen Food",
    price: "₦4,200",
    unit: "per kg",
    freshness: "95%",
    timeLeft: "Cold-chain",
    image: "https://images.unsplash.com/photo-1567622417582-759738473231?auto=format&fit=crop&q=80&w=800",
    moq: "2 kg",
    location: "Mile 1, PH"
  },
  {
    id: "grains-1",
    name: "Premium Yam Tubers",
    category: "Grains & Tubers",
    price: "₦45,000",
    unit: "per ton",
    freshness: "95%",
    timeLeft: "Farm Fresh",
    image: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800",
    moq: "1 ton",
    location: "Rivers State"
  },
  {
    id: "seafood-1",
    name: "Fresh Catfish",
    category: "Fish & Seafood",
    price: "₦3,500",
    unit: "per kg",
    freshness: "100%",
    timeLeft: "Live",
    image: "https://images.unsplash.com/photo-1534073737927-85f1dfffec05?auto=format&fit=crop&q=80&w=800",
    moq: "5 kg",
    location: "Trans Amadi, PH"
  }
];

export default function HomePage() {
  const userDoc = useAuthStore((s) => s.userDoc);
  const [greeting, setGreeting] = React.useState("Good morning");

  React.useEffect(() => {
    const hour = new Date().getHours();
    if (hour >= 12 && hour < 17) setGreeting("Good afternoon");
    else if (hour >= 17) setGreeting("Good evening");
  }, []);

  return (
    <main className="mx-auto flex w-full max-w-7xl flex-col gap-16 px-4 py-10 sm:px-6 lg:px-10">
      
      {/* Hero Section */}
      <section className="relative min-h-[500px] overflow-hidden rounded-[40px] border border-forest/20 bg-[#071512] shadow-2xl">
        {/* Stunning Background Image with Morning Dew Effect Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1600" 
            alt="Fresh Nigerian Produce" 
            className="h-full w-full object-cover opacity-40 mix-blend-overlay scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#071512] via-[#071512]/60 to-transparent" />
          {/* Animated Dew/Sparkle Effect */}
          <div className="absolute inset-0 opacity-30">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i}
                className="absolute h-1 w-1 rounded-full bg-white animate-pulse"
                style={{
                  top: `${Math.random() * 100}%`,
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 5}s`,
                  animationDuration: `${2 + Math.random() * 3}s`
                }}
              />
            ))}
          </div>
        </div>

        <div className="relative z-10 flex h-full flex-col justify-center gap-8 p-8 sm:p-16 lg:max-w-3xl">
          <div className="space-y-4 animate-in fade-in slide-in-from-left-8 duration-700">
            <div className="inline-flex items-center gap-2 rounded-full border border-leaf/30 bg-leaf/10 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-leaf backdrop-blur-md">
              <Zap className="h-3.5 w-3.5 fill-leaf" />
              Verified Cold-Chain Logic
            </div>
            <h1 className="font-display text-4xl font-bold leading-[1.1] text-white sm:text-6xl">
              {greeting}, <span className="text-leaf">{userDoc?.displayName?.split(' ')[0] || "Friend"}</span> — what’s fresh in <span className="text-gold">Around Us</span> today?
            </h1>
            <p className="max-w-xl text-lg leading-relaxed text-white/60">
              Premium Nigerian produce, livestock, and perishables delivered from farm to door with 
              real-time freshness tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300">
            <Link href="/marketplace">
              <Button size="lg" className="group h-14 rounded-2xl px-8 shadow-[0_20px_50px_rgba(74,222,128,0.2)]">
                Shop Marketplace
                <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 rounded-2xl border border-white/5 bg-white/5 px-6 py-3 backdrop-blur-md">
              <Thermometer className="h-5 w-5 text-blue-400" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-widest text-white/40">Guaranteed</div>
                <div className="text-sm font-bold text-white">4°C Cold-Chain</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Category Chips */}
      <section className="space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/40 px-2">Browse by Category</h3>
        <div className="flex flex-wrap gap-3">
          {CATEGORIES.map((cat) => (
            <Link key={cat.name} href={`/marketplace?category=${cat.name.toLowerCase()}`}>
              <button className="group flex items-center gap-3 rounded-2xl border border-forest/20 bg-black/20 px-5 py-3 transition-all hover:border-leaf/40 hover:bg-leaf/5 hover:shadow-lift">
                <cat.icon className={cn("h-5 w-5 transition-transform group-hover:scale-110", cat.color)} />
                <span className="text-sm font-semibold text-white/70 group-hover:text-white">{cat.name}</span>
              </button>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Deals */}
      <section className="space-y-8">
        <div className="flex items-center justify-between px-2">
          <div className="space-y-1">
            <h2 className="font-display text-2xl font-bold text-white">Featured Deals</h2>
            <p className="text-xs text-white/40">Handpicked farm-fresh produce across all our categories</p>
          </div>
          <Link href="/marketplace" className="text-sm font-bold text-leaf hover:underline">View All</Link>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURED_PRODUCTS.map((product) => (
            <div 
              key={product.id}
              className="group relative flex flex-col overflow-hidden rounded-[32px] border border-forest/20 bg-gradient-to-b from-[#0A3D33]/40 to-transparent p-4 transition-all duration-300 hover:-translate-y-2 hover:border-leaf/30 hover:shadow-lift"
            >
              {/* Product Image */}
              <div className="relative aspect-square overflow-hidden rounded-2xl">
                <img 
                  src={product.image} 
                  alt={product.name} 
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-black/60 px-2.5 py-1 text-[10px] font-bold text-white backdrop-blur-md">
                  <MapPin className="h-3 w-3 text-leaf" />
                  {product.location}
                </div>
                <div className="absolute right-3 top-3 inline-flex items-center gap-1.5 rounded-full border border-gold/50 bg-gold/20 px-2.5 py-1 text-[10px] font-bold text-gold backdrop-blur-md">
                  <Sparkles className="h-3 w-3" />
                  {product.freshness}
                </div>
              </div>

              {/* Content */}
              <div className="mt-5 flex flex-1 flex-col justify-between space-y-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-leaf/80">{product.category}</span>
                    <div className="flex items-center gap-1 text-[10px] text-white/40">
                      <Clock className="h-2.5 w-2.5" />
                      {product.timeLeft}
                    </div>
                  </div>
                  <h4 className="font-display text-base font-bold text-white line-clamp-1 group-hover:text-leaf transition-colors">{product.name}</h4>
                </div>

                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div className="space-y-0.5">
                      <div className="text-xl font-black text-white">{product.price}</div>
                      <div className="text-[10px] font-bold uppercase tracking-widest text-white/30">{product.unit}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-leaf/60">Min Order</div>
                      <div className="text-sm font-bold text-white">{product.moq}</div>
                    </div>
                  </div>

                  <Button variant="primary" className="group relative w-full overflow-hidden rounded-xl h-10 text-xs">
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Add to Cart
                      <ShoppingBag className="h-3.5 w-3.5" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Cold-Chain Guarantee Banner */}
      <section className="rounded-3xl border border-blue-500/20 bg-blue-500/5 p-8 backdrop-blur-sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-5">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <Snowflake className="h-8 w-8" />
            </div>
            <div className="space-y-1">
              <h3 className="font-display text-xl font-bold text-white">Cold-Chain Guaranteed</h3>
              <p className="text-sm text-white/50 max-w-md">
                All perishable and frozen items are transported in our temperature-controlled 
                smart containers, maintained strictly at 4°C.
              </p>
            </div>
          </div>
          <Button variant="secondary" className="rounded-xl border-blue-500/20 text-blue-400 hover:bg-blue-500/10">
            Learn more
          </Button>
        </div>
      </section>
    </main>
  );
}
