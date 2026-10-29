"use client";

import { Moon, Sun } from "lucide-react";
import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

type Theme = "light" | "dark";

const KEY = "compass-theme";

const ThemeCtx = createContext<{ theme: Theme; toggle: () => void }>({
  theme: "light",
  toggle: () => {},
});

function readTheme(): Theme {
  if (typeof window === "undefined") return "light";
  const saved = localStorage.getItem(KEY);
  if (saved === "dark" || saved === "light") return saved;
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");

  useEffect(() => {
    const next = readTheme();
    setTheme(next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    localStorage.setItem(KEY, next);
    document.documentElement.classList.toggle("dark", next === "dark");
  }

  return <ThemeCtx.Provider value={{ theme, toggle }}>{children}</ThemeCtx.Provider>;
}

export function useTheme() {
  return useContext(ThemeCtx);
}

export function ThemeToggle({ compact = false }: { compact?: boolean }) {
  const { theme, toggle } = useTheme();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      className={
        compact
          ? "grid h-8 w-8 place-items-center rounded-lg text-blue-100 hover:bg-white/12 hover:text-white"
          : "inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-blue-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
      }
    >
      {theme === "dark" ? <Sun size={14} /> : <Moon size={14} />}
      {compact ? null : theme === "dark" ? "Light" : "Dark"}
    </button>
  );
}
