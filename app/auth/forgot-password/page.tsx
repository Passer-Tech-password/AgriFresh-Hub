"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Password reset link sent to your email!");
  };

  return (
    <div className="max-w-md mx-auto py-20 px-4 space-y-8">
      <Link href="/auth/login" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-leaf transition-colors">
        <ArrowLeft className="h-4 w-4" />
        Back to Login
      </Link>
      
      <div className="space-y-2">
        <h1 className="font-display text-3xl font-bold text-white">Reset Password</h1>
        <p className="text-sm text-white/60">Enter your email and we'll send you a link to reset your password.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label>Email Address</Label>
          <Input 
            type="email" 
            placeholder="you@example.com" 
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
        </div>
        <Button type="submit" className="w-full h-12">Send Reset Link</Button>
      </form>
    </div>
  );
}
