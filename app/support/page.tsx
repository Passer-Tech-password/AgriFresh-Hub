"use client";

import Link from "next/link";
import { ArrowLeft, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
          <Mail className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white">Support Center</h1>
        <p className="text-white/60">
          Our team is here to help. Contact us at support@agrifreshhub.com or via WhatsApp for immediate assistance with your orders or vendor account.
        </p>
        <div className="pt-6">
          <Link href="/dashboard">
            <Button variant="secondary">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
