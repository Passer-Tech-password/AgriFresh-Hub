"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return (
    <label
      className={cn("text-xs font-semibold tracking-wide text-white/70", className)}
      {...props}
    />
  );
}

