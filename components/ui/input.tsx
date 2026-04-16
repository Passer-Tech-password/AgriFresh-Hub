"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-forest/25 bg-black/15 px-4 py-2 text-sm text-white placeholder:text-white/40 shadow-[0_0_0_1px_rgba(10,61,51,0.12)] outline-none transition focus:border-leaf/50 focus:bg-black/25 focus:ring-2 focus:ring-leaf/20",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

