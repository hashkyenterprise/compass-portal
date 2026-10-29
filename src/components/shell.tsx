"use client";

import { ThemeToggle } from "@/components/theme";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";
import {
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Package,
  Settings,
  Sparkles,
  Users,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";

const nav = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/visits", label: "Visits", icon: ClipboardList },
  { href: "/labs", label: "Shipments", icon: Package },
  { href: "/results", label: "Results", icon: Mail },
  { href: "/billing", label: "Billing", icon: Wallet },
  { href: "/briefing", label: "Briefing", icon: Sparkles },
  { href: "/staff", label: "Staff", icon: Users },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { currentUser, logout } = useStore();
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  return (
    <div className="app-mesh flex h-[100dvh] overflow-hidden">
      <aside className="hero-gradient relative flex w-[212px] shrink-0 flex-col overflow-hidden text-white">
        <div className="pointer-events-none absolute -left-8 top-16 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -right-10 bottom-24 h-36 w-36 rounded-full bg-sky-300/20 blur-2xl" />
        <div className="relative flex items-center gap-2.5 px-3.5 py-3">
          <div className="grid h-8 w-8 place-items-center rounded-xl bg-white/20 text-[13px] font-bold text-white">
            C
          </div>
          <div className="leading-tight">
            <p className="text-sm font-semibold tracking-tight">Compass</p>
            <p className="text-[11px] font-medium text-blue-100">Operations</p>
          </div>
        </div>

        <nav className="relative flex-1 space-y-0.5 overflow-y-auto px-2 py-1">
          {nav.map((item) => {
            const selected =
              pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(`${item.href}/`));
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-[13px] font-medium text-white transition",
                  "hover:bg-white/10 hover:text-white",
                  "active:bg-sky-300/25 active:text-white",
                  "focus-visible:outline-none focus-visible:bg-white/10",
                  selected ? "bg-sky-300/25 text-white ring-1 ring-white/30" : "text-blue-50",
                )}
              >
                <Icon size={15} />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="relative border-t border-white/15 px-3 py-2.5">
          <div className="mb-2 flex justify-end">
            <ThemeToggle compact />
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex min-w-0 items-center gap-2">
              <div className="grid h-7 w-7 place-items-center rounded-full bg-white/20 text-[11px] font-bold">
                {ready ? currentUser?.name?.slice(0, 1) ?? "A" : "A"}
              </div>
              <div className="min-w-0">
                <p className="truncate text-[12px] font-semibold">{ready ? currentUser?.name ?? "" : "\u00a0"}</p>
                <p className="truncate text-[10px] text-blue-100">{ready ? currentUser?.email ?? "" : "\u00a0"}</p>
              </div>
            </div>
            <button
              onClick={logout}
              className="rounded-lg p-1.5 text-blue-100 hover:bg-white/12 hover:text-white"
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div
          className={cn(
            "min-h-0 flex-1 p-4",
            pathname === "/dashboard" ? "overflow-hidden" : "overflow-auto",
          )}
        >
          {children}
        </div>
      </main>
    </div>
  );
}
