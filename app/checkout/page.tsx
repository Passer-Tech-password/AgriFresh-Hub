"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { RequireAuth } from "@/components/require-auth";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/features/auth/auth-store";
import { useCartStore, selectCartTotalKobo } from "@/features/cart/cart-store";
import { createOrder, setOrderStatus } from "@/features/orders/orders-client";
import { formatNairaFromKobo } from "@/lib/money";

type PaystackPopConstructor = new () => {
  newTransaction: (options: Record<string, unknown>) => void;
};

export default function CheckoutPage() {
  const router = useRouter();

  const user = useAuthStore((s) => s.firebaseUser);
  const items = useCartStore((s) => s.items);
  const clear = useCartStore((s) => s.clear);

  const totalKobo = selectCartTotalKobo(items);

  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (items.length === 0) router.replace("/marketplace");
  }, [items.length, router]);

  async function startPayment() {
    if (busy) return;
    if (!user) return;
    if (items.length === 0) return;

    const email = user.email ?? "";
    if (!email) {
      toast.error("Your account has no email. Please sign in again.");
      return;
    }

    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast.error("Missing Paystack public key.");
      return;
    }

    const isBulkOrder = items.some(i => i.quantity >= (i.moq * 5)); // Heuristic for bulk
    const requiresColdChain = items.some(i => i.bulkPricing && i.bulkPricing.length > 0); // Placeholder logic

    setBusy(true);
    const reference = `AGF_${user.uid}_${Date.now()}`;
    try {
      const orderId = await createOrder({
        userId: user.uid,
        email,
        amountKobo: totalKobo,
        paystackReference: reference,
        type: isBulkOrder ? "bulk" : "retail",
        requiresColdChain,
        isUpfrontPayment: isBulkOrder,
        items: items.map((i) => ({
          productId: i.productId,
          vendorId: i.vendorId,
          name: i.name,
          unit: i.unit,
          priceKobo: getEffectivePrice(i),
          quantity: i.quantity
        }))
      });

      const mod = (await import("@paystack/inline-js")) as { default: PaystackPopConstructor };
      const PaystackPop = mod.default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email,
        amount: totalKobo,
        ref: reference,
        onSuccess: async () => {
          await setOrderStatus(orderId, "paid");
          clear();
          toast.success("Payment successful.");
          router.replace("/dashboard");
        },
        onCancel: async () => {
          await setOrderStatus(orderId, "cancelled");
          toast.message("Payment cancelled.");
        }
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to start checkout.";
      toast.error(message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <RequireAuth>
      <main className="mx-auto w-full max-w-5xl px-4 py-10 sm:px-6 lg:px-10">
        <div className="space-y-8">
          <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="space-y-2">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-3 py-1 text-xs text-gold backdrop-blur">
                Checkout
              </div>
              <h1 className="font-display text-3xl font-semibold tracking-tight text-white">
                Pay securely
              </h1>
              <p className="text-sm text-white/60">
                We use Paystack for secure card and bank payments.
              </p>
            </div>
            <Link href="/cart">
              <Button variant="secondary">Back to cart</Button>
            </Link>
          </header>

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur lg:col-span-2">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Order items
                </div>
                <div className="space-y-3">
                  {items.map((i) => (
                    <div
                      key={i.productId}
                      className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/10 p-4"
                    >
                      <div className="space-y-1">
                        <div className="font-display font-semibold text-white">{i.name}</div>
                        <div className="text-xs text-white/55">
                          {i.quantity} × {i.unit}
                        </div>
                      </div>
                      <div className="text-sm font-semibold text-white">
                        {formatNairaFromKobo(i.priceKobo * i.quantity)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-forest/25 bg-black/20 p-6 backdrop-blur">
              <div className="space-y-4">
                <div className="text-xs font-semibold uppercase tracking-wide text-white/50">
                  Total
                </div>
                <div className="text-2xl font-semibold text-white">
                  {formatNairaFromKobo(totalKobo)}
                </div>
                <Button size="lg" disabled={busy || items.length === 0} onClick={startPayment}>
                  {busy ? "Opening Paystack…" : "Pay with Paystack"}
                </Button>
                <div className="text-xs text-white/50">
                  You will be redirected to a secure payment modal.
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </RequireAuth>
  );
}

