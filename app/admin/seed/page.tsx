"use client";

import * as React from "react";
import { collection, doc, setDoc, serverTimestamp, getDocs, deleteDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Loader2, Database, AlertTriangle } from "lucide-react";

const TEST_VENDORS = [
  { uid: "vendor_ph_1", displayName: "Port Harcourt Green Farms", email: "ph_green@example.com" },
  { uid: "vendor_ph_2", displayName: "Rivers Livestock Producers", email: "rivers_livestock@example.com" },
  { uid: "vendor_ph_3", displayName: "Obio-Akpor Perishables Ltd", email: "obio_perishables@example.com" },
  { uid: "vendor_ph_4", displayName: "Garden City Kitchen Supplies", email: "gardencity_kitchen@example.com" },
];

const SEED_PRODUCTS = [
  // Vegetables
  {
    name: "Fresh Okra (Large Bag)",
    category: "Vegetables",
    unit: "bag",
    priceKobo: 2500000, // 25,000 NGN
    stock: 50,
    moq: 2,
    description: "Premium large okra bags harvested from Obio-Akpor. Approx 50kg per bag.",
    isPerishable: true,
    requiresColdChain: false,
    vendorId: "vendor_ph_1",
    imageUrl: "https://images.unsplash.com/photo-1627484394148-9254ad353e04?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 2200000 }]
  },
  {
    name: "Onions (Purple - 100kg Bag)",
    category: "Vegetables",
    unit: "bag",
    priceKobo: 8500000, // 85,000 NGN
    stock: 30,
    moq: 1,
    description: "Large 100kg bag of premium purple onions from Northern Nigeria, stored in PH.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_1",
    imageUrl: "https://images.unsplash.com/photo-1508747703725-719777637510?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 5, pricePerUnitKobo: 8000000 }]
  },
  // Grains & Tubers
  {
    name: "Yam Tubers (Bulk Ton)",
    category: "Grains & Tubers",
    unit: "ton",
    priceKobo: 45000000, // 450,000 NGN
    stock: 10,
    moq: 1,
    description: "Quality yam tubers from Rivers State farms. 1 ton capacity (approx 100-120 large tubers).",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_1",
    imageUrl: "https://images.unsplash.com/photo-1591073113125-e46713c829ed?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 5, pricePerUnitKobo: 40000000 }]
  },
  {
    name: "Honey Beans (Oloyin - 50kg Bag)",
    category: "Grains & Tubers",
    unit: "bag",
    priceKobo: 6500000, // 65,000 NGN
    stock: 100,
    moq: 2,
    description: "Premium sweet honey beans (Oloyin). Clean and stone-free. 50kg per bag.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_1",
    imageUrl: "https://images.unsplash.com/photo-1514733670139-4d87a1941d55?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 6000000 }]
  },
  // Livestock & Poultry
  {
    name: "Live Broiler Chicken (Large)",
    category: "Poultry",
    unit: "bird",
    priceKobo: 850000, // 8,500 NGN
    stock: 500,
    moq: 10,
    description: "Healthy live broiler chickens, ready for processing. Approx 2.5kg - 3kg each.",
    isPerishable: true,
    requiresColdChain: false,
    vendorId: "vendor_ph_2",
    imageUrl: "https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 50, pricePerUnitKobo: 750000 }, { minQty: 100, pricePerUnitKobo: 700000 }]
  },
  {
    name: "Jumbo Snails (Dozen)",
    category: "Livestock",
    unit: "pack",
    priceKobo: 1200000, // 12,000 NGN
    stock: 100,
    moq: 3,
    description: "Large forest snails (Achatina Achatina), washed and ready for cooking.",
    isPerishable: true,
    requiresColdChain: false,
    vendorId: "vendor_ph_2",
    imageUrl: "https://images.unsplash.com/photo-1533104816931-20fa691ff6ca?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 1000000 }]
  },
  {
    name: "Fresh Catfish (Large - 1kg+)",
    category: "Fish & Seafood",
    unit: "kg",
    priceKobo: 350000, // 3,500 NGN
    stock: 200,
    moq: 5,
    description: "Live or freshly killed catfish. Minimum 1kg per fish.",
    isPerishable: true,
    requiresColdChain: true,
    vendorId: "vendor_ph_2",
    imageUrl: "https://images.unsplash.com/photo-1534073737927-85f1dfffec05?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 20, pricePerUnitKobo: 300000 }]
  },
  // Frozen Foods
  {
    name: "Frozen Titus Fish (Mackerel - Crate)",
    category: "Frozen Foods",
    unit: "crate",
    priceKobo: 6500000, // 65,000 NGN
    stock: 30,
    moq: 1,
    description: "High-quality frozen Titus fish. 20kg per crate. Stored at -18°C.",
    isPerishable: true,
    requiresColdChain: true,
    vendorId: "vendor_ph_3",
    imageUrl: "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 5, pricePerUnitKobo: 6000000 }]
  },
  {
    name: "Frozen Chicken Wings (10kg Carton)",
    category: "Frozen Foods",
    unit: "pack",
    priceKobo: 4200000, // 42,000 NGN
    stock: 40,
    moq: 2,
    description: "Premium frozen chicken wings. 10kg per carton.",
    isPerishable: true,
    requiresColdChain: true,
    vendorId: "vendor_ph_3",
    imageUrl: "https://images.unsplash.com/photo-1567622417582-759738473231?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 3800000 }]
  },
  // Perishables
  {
    name: "Plum Tomatoes (Large Crate)",
    category: "Frozen Foods", // Using Frozen for Cold-chain categorization in this UI
    unit: "crate",
    priceKobo: 4500000, // 45,000 NGN
    stock: 25,
    moq: 1,
    description: "Freshly harvested plum tomatoes. Handled via cold-chain from North to PH.",
    isPerishable: true,
    requiresColdChain: true,
    vendorId: "vendor_ph_3",
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f02ac6d31?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 4000000 }]
  },
  {
    name: "Palm Oil (25L Jerrycan)",
    category: "Vegetables",
    unit: "pack",
    priceKobo: 2800000, // 28,000 NGN
    stock: 50,
    moq: 1,
    description: "Pure, unadulterated red palm oil from Rivers State plantations. 25-liter jerrycan.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_1",
    imageUrl: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 2500000 }]
  },
  // Kitchen Utensils
  {
    name: "Stainless Steel Knife Set (6pc)",
    category: "Kitchen",
    unit: "pack",
    priceKobo: 1850000, // 18,500 NGN
    stock: 100,
    moq: 1,
    description: "Professional grade 6-piece stainless steel kitchen knife set with stand.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_4",
    imageUrl: "https://images.unsplash.com/photo-1593618998160-e34014e67546?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 1500000 }]
  },
  {
    name: "Cast Iron Dutch Oven (5L)",
    category: "Kitchen",
    unit: "pack",
    priceKobo: 3500000, // 35,000 NGN
    stock: 30,
    moq: 1,
    description: "Durable 5-liter cast iron dutch oven, perfect for traditional Nigerian stews.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_4",
    imageUrl: "https://images.unsplash.com/photo-1584990344112-519cfa292757?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 5, pricePerUnitKobo: 3000000 }]
  },
  {
    name: "Mortar and Pestle (Large Wood)",
    category: "Kitchen",
    unit: "pack",
    priceKobo: 1200000, // 12,000 NGN
    stock: 50,
    moq: 1,
    description: "Heavy-duty traditional wooden mortar and pestle for pounding yam and spices.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_4",
    imageUrl: "https://images.unsplash.com/photo-1590540179852-2110a54f813a?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 10, pricePerUnitKobo: 1000000 }]
  },
  {
    name: "Industrial Gas Burner (Double)",
    category: "Kitchen",
    unit: "pack",
    priceKobo: 5500000, // 55,000 NGN
    stock: 15,
    moq: 1,
    description: "High-pressure double gas burner for commercial kitchen use.",
    isPerishable: false,
    requiresColdChain: false,
    vendorId: "vendor_ph_4",
    imageUrl: "https://images.unsplash.com/photo-1523413363574-c30aa1c2a516?auto=format&fit=crop&q=80&w=800",
    bulkPricing: [{ minQty: 3, pricePerUnitKobo: 5000000 }]
  }
];

export default function AdminSeedPage() {
  const [busy, setBusy] = React.useState(false);

  const seedData = async () => {
    setBusy(true);
    try {
      // 1. Seed Vendors
      for (const vendor of TEST_VENDORS) {
        await setDoc(doc(db, "users", vendor.uid), {
          uid: vendor.uid,
          displayName: vendor.displayName,
          email: vendor.email,
          role: "vendor_approved",
          creditsBalance: 5000,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        }, { merge: true });
      }

      // 2. Seed Products
      for (const product of SEED_PRODUCTS) {
        const productRef = doc(collection(db, "products"));
        await setDoc(productRef, {
          ...product,
          active: true,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }

      toast.success("Successfully seeded 4 vendors and 12 products!");
    } catch (err) {
      console.error("Seeding failed:", err);
      toast.error("Seeding failed. Check console.");
    } finally {
      setBusy(false);
    }
  };

  const clearData = async () => {
    if (!confirm("This will delete ALL products. Continue?")) return;
    setBusy(true);
    try {
      const snap = await getDocs(collection(db, "products"));
      for (const d of snap.docs) {
        await deleteDoc(d.ref);
      }
      toast.success("Products cleared.");
    } catch (err) {
      toast.error("Clear failed.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center space-y-10">
      <div className="space-y-4">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-[24px] bg-gold/10 text-gold mb-2">
          <Database className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white">Data Seeding Hub</h1>
        <p className="text-white/50 leading-relaxed">
          Initialize the marketplace with realistic Nigerian produce and verified test vendors. 
          Use this for deployment preparation and testing.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Button 
          size="lg" 
          onClick={seedData} 
          disabled={busy}
          className="h-16 rounded-2xl bg-leaf text-forest hover:bg-leaf/90 font-black gap-2"
        >
          {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <><Database className="h-5 w-5" /> Seed Production Data</>}
        </Button>
        <Button 
          size="lg" 
          variant="secondary" 
          onClick={clearData} 
          disabled={busy}
          className="h-16 rounded-2xl border-orange-500/20 text-orange-400 hover:bg-orange-500/10 gap-2"
        >
          <AlertTriangle className="h-5 w-5" /> Clear Products
        </Button>
      </div>

      <div className="p-6 rounded-3xl bg-white/5 border border-white/5 text-left space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-white/30">What will be seeded?</h3>
        <ul className="text-sm text-white/60 space-y-2">
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-leaf" /> 
            4 Test Vendors (Obio-Akpor, Rivers State region)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-leaf" /> 
            12 Realistic Products (Okra, Yam, Broilers, Utensils)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-leaf" /> 
            Bulk Tiers (Up to 100+ units / Tons)
          </li>
          <li className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-leaf" /> 
            Cold-Chain & Perishable flags correctly set
          </li>
        </ul>
      </div>
    </main>
  );
}

function CheckCircle2(props: any) {
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
      <path d="M20 6 9 17l-5-5" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  );
}
