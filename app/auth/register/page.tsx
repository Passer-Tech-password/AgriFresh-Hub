"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, User, ShoppingBag } from "lucide-react";

import { registerWithEmail } from "@/features/auth/auth-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { UserRole } from "@/types/roles";

type SignupMode = "buyer" | "vendor";

export default function RegisterPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  const [mode, setMode] = React.useState<SignupMode>("buyer");
  const [fullName, setFullName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (status === "signedIn") router.replace("/dashboard");
  }, [router, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    const cleanName = fullName.trim();
    const cleanEmail = email.trim();
    if (!cleanName || !cleanEmail || !password) {
      toast.error("Complete all required fields.");
      return;
    }
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    const role: UserRole = mode === "vendor" ? "vendor_pending" : "buyer";

    setBusy(true);
    try {
      await registerWithEmail({ fullName: cleanName, email: cleanEmail, password, role });
      toast.success("Account created successfully!");
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to create account.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-8 space-y-2 text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Join AgriFresh Hub<span className="text-leaf">.</span>
        </h2>
        <p className="text-sm text-white/60">
          Already have an account?{" "}
          <Link href="/auth/login" className="font-semibold text-leaf transition-colors hover:text-leaf/80 hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => setMode("buyer")}
          className={cn(
            "group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300",
            mode === "buyer"
              ? "border-leaf/50 bg-leaf/10 shadow-[0_0_20px_rgba(74,222,128,0.15)] ring-1 ring-leaf/30"
              : "border-forest/20 bg-black/40 hover:border-forest/40"
          )}
        >
          {mode === "buyer" && (
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-leaf/10 blur-2xl" />
          )}
          <div className={cn(
            "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
            mode === "buyer" ? "bg-leaf text-forest" : "bg-forest/30 text-white/40 group-hover:text-white/60"
          )}>
            <ShoppingBag className="h-5 w-5" />
          </div>
          <div className="font-display text-lg font-bold text-white">Buyer</div>
          <div className="text-xs leading-relaxed text-white/50">Shop verified produce & track freshness.</div>
        </button>
        
        <button
          type="button"
          onClick={() => setMode("vendor")}
          className={cn(
            "group relative overflow-hidden rounded-3xl border p-5 text-left transition-all duration-300",
            mode === "vendor"
              ? "border-leaf/50 bg-leaf/10 shadow-[0_0_20px_rgba(74,222,128,0.15)] ring-1 ring-leaf/30"
              : "border-forest/20 bg-black/40 hover:border-forest/40"
          )}
        >
          {mode === "vendor" && (
            <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-leaf/10 blur-2xl" />
          )}
          <div className={cn(
            "mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl transition-colors",
            mode === "vendor" ? "bg-leaf text-forest" : "bg-forest/30 text-white/40 group-hover:text-white/60"
          )}>
            <User className="h-5 w-5" />
          </div>
          <div className="font-display text-lg font-bold text-white">Vendor</div>
          <div className="text-xs leading-relaxed text-white/50">Apply to sell. Approval required before listing.</div>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="fullName" className="text-xs font-bold uppercase tracking-widest text-white/40">Full name</Label>
          <Input
            id="fullName"
            name="fullName"
            autoComplete="name"
            placeholder="John Doe"
            className="h-12 border-forest/20 bg-black/40 text-white placeholder:text-white/20 focus:border-leaf/50 focus:ring-leaf/20"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/40">Email address</Label>
          <Input
            id="email"
            name="email"
            autoComplete="email"
            inputMode="email"
            placeholder="you@example.com"
            className="h-12 border-forest/20 bg-black/40 text-white placeholder:text-white/20 focus:border-leaf/50 focus:ring-leaf/20"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-white/40">Password</Label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              placeholder="Min. 8 characters"
              className="h-12 border-forest/20 bg-black/40 text-white placeholder:text-white/20 focus:border-leaf/50 focus:ring-leaf/20"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-xs font-bold uppercase tracking-widest text-white/40">Confirm</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              placeholder="Repeat password"
              className="h-12 border-forest/20 bg-black/40 text-white placeholder:text-white/20 focus:border-leaf/50 focus:ring-leaf/20"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>
        </div>

        <div className="pt-2">
          <Button 
            type="submit" 
            variant="primary" 
            size="lg" 
            className="group relative w-full overflow-hidden"
            disabled={busy}
          >
            <span className="relative z-10 flex items-center justify-center gap-2">
              {busy ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  Create Account
                  <Sparkles className="h-4 w-4 transition-transform group-hover:scale-125" />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </Button>
        </div>

        <div className="text-center">
          <Link href="/" className="text-xs font-semibold text-white/30 transition-colors hover:text-white/60">
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}

