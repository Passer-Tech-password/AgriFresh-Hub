"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PrivacyPolicyPage() {
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
              <Shield className="h-6 w-6" />
            </div>
            <h1 className="font-display text-4xl font-bold text-white">Privacy Policy</h1>
          </div>
          <p className="text-white/40 text-sm font-bold uppercase tracking-widest">Last Updated: March 2026</p>
        </header>

        <div className="prose prose-invert max-w-none space-y-8 text-white/70">
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">1. Introduction</h2>
            <p>
              AgriFresh Hub ("we", "our", or "us") is committed to protecting your privacy. This Privacy Policy explains how your personal information is collected, used, and disclosed by AgriFresh Hub.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">2. Information We Collect</h2>
            <p>
              We collect information that you provide directly to us when you create an account, list products, make a purchase, or communicate with us. This includes:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Name, email address, and phone number.</li>
              <li>Business details for vendors (RC Number, TIN, etc.).</li>
              <li>Payment information (processed securely via Paystack).</li>
              <li>Location data for delivery and logistics tracking.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">3. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our services.</li>
              <li>Process transactions and send related information.</li>
              <li>Monitor and analyze trends, usage, and activities.</li>
              <li>Ensure cold-chain compliance and food safety.</li>
              <li>Communicate with you about products, services, and events.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">4. Data Security</h2>
            <p>
              We take reasonable measures to help protect information about you from loss, theft, misuse and unauthorized access, disclosure, alteration and destruction.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-white">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at support@agrifreshhub.com.
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
