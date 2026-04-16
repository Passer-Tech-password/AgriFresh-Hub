"use client";

import * as React from "react";
import { useRouter, usePathname } from "next/navigation";
import { Loader2, ShieldAlert, Clock } from "lucide-react";

import { useAuthStore } from "@/features/auth/auth-store";
import { Button } from "@/components/ui/button";
import type { UserRole } from "@/types/roles";

type RequireAuthProps = {
  children: React.ReactNode;
  requireRole?: UserRole | UserRole[];
};

export function RequireAuth({ children, requireRole }: RequireAuthProps) {
  const router = useRouter();
  const pathname = usePathname();
  const status = useAuthStore((s) => s.status);
  const role = useAuthStore((s) => s.role);

  React.useEffect(() => {
    if (status === "signedOut") router.replace("/auth/login");
  }, [router, status]);

  React.useEffect(() => {
    if (!requireRole) return;
    if (status !== "signedIn") return;
    if (!role) return;

    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!allowed.includes(role)) {
      // If a vendor_pending user tries to access vendor routes
      if (role === "vendor_pending" && pathname?.startsWith("/vendor")) {
        // We'll handle this in the UI below rather than immediate redirect
        return;
      }
      router.replace("/unauthorized");
    }
  }, [requireRole, role, router, status, pathname]);

  if (status === "loading") {
    return (
      <div className="flex min-h-[60vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-white/40">
          <Loader2 className="h-8 w-8 animate-spin text-leaf" />
          <div className="text-xs font-bold uppercase tracking-widest">Verifying session...</div>
        </div>
      </div>
    );
  }

  if (status === "signedOut") return null;

  // Special case: Vendor Pending accessing vendor dashboard
  if (role === "vendor_pending" && pathname?.startsWith("/vendor") && pathname !== "/vendor/apply") {
    return (
      <main className="mx-auto flex min-h-[70vh] w-full max-w-2xl flex-col items-center justify-center px-4 text-center">
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
          <div className="relative mx-auto flex h-24 w-24 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gold/10 blur-xl" />
            <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl border border-gold/30 bg-gold/5 text-gold">
              <Clock className="h-8 w-8" />
            </div>
          </div>
          <div className="space-y-3">
            <h2 className="font-display text-3xl font-bold text-white">Application Under Review</h2>
            <p className="text-sm leading-relaxed text-white/50">
              Your vendor application is currently being reviewed by our team. 
              We'll verify your documents and get back to you soon. 
              You will be notified once your store is ready to go live!
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-center">
            <Button variant="secondary" onClick={() => router.push("/dashboard")} className="rounded-xl border-white/10">
              Return to Dashboard
            </Button>
            <Button variant="ghost" onClick={() => router.push("/profile")} className="text-white/40 hover:text-white">
              View Profile
            </Button>
          </div>
        </div>
      </main>
    );
  }

  if (requireRole) {
    const allowed = Array.isArray(requireRole) ? requireRole : [requireRole];
    if (!role) {
      return (
        <div className="flex min-h-[60vh] w-full items-center justify-center">
          <div className="flex flex-col items-center gap-4 text-white/40">
            <Loader2 className="h-8 w-8 animate-spin text-leaf" />
            <div className="text-xs font-bold uppercase tracking-widest">Setting up your profile...</div>
          </div>
        </div>
      );
    }
    if (!allowed.includes(role)) return null;
  }

  return <>{children}</>;
}

