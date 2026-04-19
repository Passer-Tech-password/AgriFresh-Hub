"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ThermometerSnowflake } from "lucide-react";

export default function ColdChainPolicyPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-12">
        <header className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-leaf transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/10 text-blue-400">
              <ThermometerSnowflake className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white">Cold-Chain Policy</h1>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Last Updated: March 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Overview</h2>
            <p>
              The AgriFresh Hub Cold-Chain Policy ensures that all perishable goods sold on our platform maintain their freshness and safety from the farm to the buyer's doorstep.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Temperature Requirements</h2>
            <p>
              Vendors listing items categorized as "Frozen" or "Perishable" must adhere to specific temperature ranges during storage and transit:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Frozen Foods:</strong> Must be maintained at -18°C or below.</li>
              <li><strong>Fresh Produce (Tomatoes, Vegetables):</strong> Must be maintained between 2°C and 8°C.</li>
              <li><strong>Livestock/Poultry (Processed):</strong> Must be chilled immediately to 4°C or below.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Real-Time Monitoring</h2>
            <p>
              AgriFresh Hub provides IoT-enabled tracking for cold-chain orders. Buyers can monitor the temperature of their order in real-time via the "Track Live" feature in their dashboard.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Compliance & Penalties</h2>
            <p>
              Vendors who fail to maintain the required temperature during transit will be held liable for spoiled goods. Repeated violations of the Cold-Chain Policy will result in the permanent removal of "Verified" status and account suspension.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Reporting Issues</h2>
            <p>
              If you receive an order that appears to have broken the cold-chain (e.g., thawed frozen goods or wilted produce), please report it immediately via the Help Center for a full investigation and potential refund.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
