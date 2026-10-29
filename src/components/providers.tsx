"use client";

import { ThemeProvider } from "@/components/theme";
import { StoreProvider } from "@/lib/store";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider>
      <StoreProvider>{children}</StoreProvider>
    </ThemeProvider>
  );
}
