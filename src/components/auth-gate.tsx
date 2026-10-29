"use client";

import { useStore } from "@/lib/store";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";

export function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, hydrated } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!hydrated) return;
    if (!currentUser && pathname !== "/login") {
      router.replace("/login");
    }
    if (currentUser && pathname === "/login") {
      router.replace("/dashboard");
    }
  }, [hydrated, currentUser, pathname, router]);

  if (hydrated && !currentUser && pathname !== "/login") return null;
  return <>{children}</>;
}
