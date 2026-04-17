"use client";

import Link from "next/link";
import { ArrowLeft, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-20 text-center">
      <div className="space-y-6">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-2xl bg-gold/10 text-gold">
          <MessageSquare className="h-8 w-8" />
        </div>
        <h1 className="font-display text-4xl font-bold text-white">Contact Sales</h1>
        <p className="text-white/60">
          Interested in enterprise solutions or large-scale procurement? Reach out to our sales team at sales@agrifreshhub.com.
        </p>
        <div className="pt-6">
          <Link href="/pro">
            <Button variant="secondary">Back to Pro Plans</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
