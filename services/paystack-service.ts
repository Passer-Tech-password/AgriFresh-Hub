"use client";

import { toast } from "sonner";

type PaystackPopConstructor = new () => {
  newTransaction: (options: Record<string, any>) => void;
};

export const paystackService = {
  startTransaction: async (options: {
    email: string;
    amountKobo: number;
    metadata?: Record<string, any>;
    onSuccess: (reference: string) => void;
    onCancel?: () => void;
  }) => {
    const paystackKey = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
    if (!paystackKey) {
      toast.error("Paystack public key is not configured.");
      return;
    }

    try {
      const mod = (await import("@paystack/inline-js")) as { default: PaystackPopConstructor };
      const PaystackPop = mod.default;
      const paystack = new PaystackPop();

      paystack.newTransaction({
        key: paystackKey,
        email: options.email,
        amount: options.amountKobo,
        metadata: options.metadata,
        onSuccess: (response: any) => {
          options.onSuccess(response.reference);
        },
        onCancel: () => {
          if (options.onCancel) {
            options.onCancel();
          } else {
            toast.message("Payment cancelled.");
          }
        },
      });
    } catch (err) {
      console.error("Paystack initialization failed:", err);
      toast.error("Failed to initialize payment gateway.");
    }
  },
};
