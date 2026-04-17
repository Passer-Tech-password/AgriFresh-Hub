"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Sparkles, LogIn } from "lucide-react";

import { loginWithEmail } from "@/features/auth/auth-client";
import { useAuthStore } from "@/features/auth/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const status = useAuthStore((s) => s.status);

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (status === "signedIn") router.replace("/dashboard");
  }, [router, status]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;

    if (!email.trim() || !password) {
      toast.error("Enter your email and password.");
      return;
    }

    setBusy(true);
    try {
      await loginWithEmail({ email: email.trim(), password });
      toast.success("Welcome back to AgriFresh Hub!");
      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to sign in.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="mb-10 space-y-2 text-center lg:text-left">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Welcome back<span className="text-leaf">.</span>
        </h2>
        <p className="text-sm text-white/60">
          New here?{" "}
          <Link href="/auth/register" className="font-semibold text-leaf transition-colors hover:text-leaf/80 hover:underline">
            Create an account
          </Link>
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email" className="text-xs font-bold uppercase tracking-widest text-white/40">Email address</Label>
          <div className="relative">
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
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-white/40">Password</Label>
            <Link href="/auth/forgot-password" className="text-xs text-white/30 hover:text-leaf/80 hover:underline">
              Forgot?
            </Link>
          </div>
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="h-12 border-forest/20 bg-black/40 text-white placeholder:text-white/20 focus:border-leaf/50 focus:ring-leaf/20"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="pt-4">
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
                  Sign In
                  <LogIn className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </span>
            <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
          </Button>
        </div>

        <div className="flex items-center justify-center gap-4 text-center">
          <Link href="/" className="text-xs font-semibold text-white/30 transition-colors hover:text-white/60">
            Back to home
          </Link>
        </div>
      </form>
    </div>
  );
}

