"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  LayoutDashboard, 
  Package, 
  MessageSquare, 
  ShoppingBag, 
  BarChart3, 
  Star, 
  Zap, 
  Bell, 
  Menu, 
  X, 
  LogOut,
  ChevronRight,
  ShieldCheck,
  User,
  Settings
} from "lucide-react";
import { 
  collection, 
  query, 
  where, 
  onSnapshot 
} from "firebase/firestore";

import { RequireAuth } from "@/components/require-auth";
import { useAuthStore, useIsPro } from "@/features/auth/auth-store";
import { db } from "@/lib/firebase";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "Overview", href: "/vendor/dashboard", icon: LayoutDashboard },
  { label: "Inventory", href: "/vendor/products", icon: Package },
  { label: "Bulk Inquiries", href: "/vendor/inquiries", icon: MessageSquare, badge: true },
  { label: "Orders", href: "/vendor/orders", icon: ShoppingBag },
  { label: "Analytics", href: "/vendor/analytics", icon: BarChart3 },
  { label: "Votes Received", href: "/vendor/votes", icon: Star },
];

export default function VendorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const userDoc = useAuthStore((s) => s.userDoc);
  const signOut = useAuthStore((s) => s.signOut);
  const isPro = useIsPro();
  const user = useAuthStore((s) => s.firebaseUser);

  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [inquiryCount, setInquiryCount] = React.useState(0);

  React.useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "bulkInquiries"), 
      where("vendorId", "==", user.uid),
      where("status", "==", "pending")
    );
    const unsub = onSnapshot(q, (snap) => {
      setInquiryCount(snap.docs.length);
    });
    return () => unsub();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <RequireAuth requireRole="vendor_approved">
      <div className="flex min-h-screen bg-[#04110D] text-white">
        
        {/* Mobile Sidebar Overlay */}
        {isSidebarOpen && (
          <div 
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
            onClick={() => setIsSidebarOpen(false)}
          />
        )}

        {/* Sidebar */}
        <aside className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-forest/20 bg-[#071512] transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          <div className="flex h-full flex-col p-6">
            {/* Logo */}
            <div className="mb-10 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-leaf shadow-[0_0_20px_rgba(74,222,128,0.3)]">
                <ShieldCheck className="h-6 w-6 text-[#04110D]" />
              </div>
              <div className="font-display text-xl font-bold tracking-tight">
                AgriFresh <span className="text-leaf">Hub</span>
              </div>
            </div>

            {/* Navigation */}
            <nav className="flex-1 space-y-2">
              {NAV_ITEMS.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link 
                    key={item.href} 
                    href={item.href as any}
                    onClick={() => setIsSidebarOpen(false)}
                    className={cn(
                      "group flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-semibold transition-all",
                      isActive 
                        ? "bg-leaf text-[#04110D] shadow-[0_10px_30px_rgba(74,222,128,0.2)]" 
                        : "text-white/50 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon className={cn("h-5 w-5", isActive ? "text-[#04110D]" : "text-leaf")} />
                      {item.label}
                    </div>
                    {item.badge && inquiryCount > 0 && !isActive && (
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-leaf text-[10px] font-black text-[#04110D]">
                        {inquiryCount}
                      </span>
                    )}
                    {isActive && <ChevronRight className="h-4 w-4" />}
                  </Link>
                );
              })}
            </nav>

            {/* Pro Upgrade Card */}
            {!isPro && (
              <div className="mt-6 rounded-3xl border border-gold/30 bg-gold/5 p-5 backdrop-blur-sm">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-gold/20 text-gold">
                  <Zap className="h-4 w-4 fill-gold" />
                </div>
                <h4 className="mb-1 text-sm font-bold text-white">Upgrade to Pro</h4>
                <p className="mb-4 text-[10px] leading-relaxed text-white/50">
                  Get featured listings, advanced analytics, and priority bulk orders.
                </p>
                <Link href="/vendor/pro">
                  <Button variant="primary" size="sm" className="w-full bg-gold text-[#04110D] shadow-[0_10px_20px_rgba(245,195,0,0.2)] hover:bg-gold/90 border-none">
                    Upgrade Now
                  </Button>
                </Link>
              </div>
            )}

            {/* Sign Out */}
            <button 
              onClick={handleSignOut}
              className="mt-6 flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold text-white/50 transition-colors hover:bg-rose-500/10 hover:text-rose-400"
            >
              <LogOut className="h-5 w-5" />
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Top Bar */}
          <header className="flex h-20 items-center justify-between border-b border-forest/20 bg-[#071512]/50 px-6 backdrop-blur-md">
            <div className="flex items-center gap-4">
              <button 
                className="lg:hidden"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6 text-white" />
              </button>
              <div className="hidden text-xs font-bold uppercase tracking-widest text-white/30 lg:block">
                {pathname === "/vendor/dashboard" ? "Dashboard Overview" : pathname.split("/").pop()?.replace("-", " ")}
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Notifications */}
              <button className="relative group">
                <div className="absolute inset-0 rounded-full bg-leaf/20 blur-lg opacity-0 group-hover:opacity-100 transition-opacity" />
                <Bell className="h-5 w-5 text-white/50 group-hover:text-leaf transition-colors" />
                {inquiryCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-2 w-2 rounded-full bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)]" />
                )}
              </button>

              {/* User Profile */}
              <div className="flex items-center gap-3 border-l border-forest/20 pl-6">
                <div className="text-right hidden sm:block">
                  <div className="text-sm font-bold text-white">{userDoc?.displayName || "Vendor"}</div>
                  <div className="text-[10px] font-bold uppercase tracking-widest text-leaf">
                    {isPro ? "Pro Vendor" : "Free Account"}
                  </div>
                </div>
                <Link href="/profile" className="relative group">
                  <div className="h-10 w-10 overflow-hidden rounded-xl border border-forest/20 bg-forest/10 p-1 group-hover:border-leaf/50 transition-colors">
                    <div className="h-full w-full flex items-center justify-center rounded-lg bg-forest/20 text-white/50">
                      <User className="h-5 w-5" />
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-y-auto p-6 lg:p-10">
            {children}
          </main>
        </div>
      </div>
    </RequireAuth>
  );
}
