"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, FileText } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10 animate-in fade-in duration-700">
      <div className="space-y-12">
        <header className="space-y-4">
          <Link href="/" className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-white/40 hover:text-leaf transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-leaf/10 text-leaf">
              <FileText className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white">Terms of Service</h1>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Last Updated: March 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the AgriFresh Hub platform, you agree to be bound by these Terms of Service. If you do not agree to all of these terms, do not use our services.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Marketplace Rules</h2>
            <p>
              AgriFresh Hub provides a marketplace for buyers and vendors. We are not a party to the transactions between users but provide the infrastructure for secure payments and logistics tracking.
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vendors must provide accurate product descriptions and pricing.</li>
              <li>Buyers must complete payments via the integrated Paystack system.</li>
              <li>All perishables must adhere to our Cold-Chain Policy.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. Vendor Obligations</h2>
            <p>
              Verified vendors agree to maintain high standards of produce quality and timely fulfillment. Failure to comply with MOQ or quality standards may result in account suspension.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Logistics & Delivery</h2>
            <p>
              Delivery times are estimates. AgriFresh Hub is not liable for delays caused by third-party logistics providers, though we provide real-time tracking for all orders.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Termination</h2>
            <p>
              We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that we believe violates these Terms or is harmful to other users of the service.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
