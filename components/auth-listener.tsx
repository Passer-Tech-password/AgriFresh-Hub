"use client";

import * as React from "react";

import { useAuthStore } from "@/features/auth/auth-store";

export function AuthListener() {
  const initAuthListener = useAuthStore((s) => s.initAuthListener);

  React.useEffect(() => {
    const unsub = initAuthListener();
    return () => unsub();
  }, [initAuthListener]);

  return null;
}

