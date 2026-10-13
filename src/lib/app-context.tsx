import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import { initialReviews, type Review } from "@/data/demo";
import { languages, translate, type Language, type TranslationKey } from "@/i18n/translations";

export type ThemeChoice = "light" | "dark" | "system";

interface AppState {
  theme: ThemeChoice;
  setTheme: (t: ThemeChoice) => void;
  lang: Language;
  setLang: (l: Language) => void;
  locale: string;
  t: (key: TranslationKey, vars?: Record<string, string | number>) => string;
  reviews: Review[];
  toggleReview: (id: string) => void;
  resetReviews: () => void;
}

const AppContext = createContext<AppState | null>(null);
const KEYS = { theme: "hg-theme", lang: "hg-lang", reviews: "hg-reviews" };

function applyTheme(choice: ThemeChoice) {
  const dark = choice === "dark" || (choice === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<ThemeChoice>("system");
  const [lang, setLangState] = useState<Language>("en");
  const [reviews, setReviews] = useState<Review[]>(initialReviews);

  // Load saved preferences after mount (avoids hydration mismatch).
  useEffect(() => {
    const t = localStorage.getItem(KEYS.theme) as ThemeChoice | null;
    if (t) setThemeState(t);
    const l = localStorage.getItem(KEYS.lang) as Language | null;
    if (l && languages.some((x) => x.code === l)) setLangState(l);
    try {
      const saved = JSON.parse(localStorage.getItem(KEYS.reviews) ?? "null") as Record<string, Review["status"]> | null;
      if (saved) setReviews(initialReviews.map((r) => ({ ...r, status: saved[r.id] ?? r.status })));
    } catch {
      /* ignore corrupt storage */
    }
  }, []);

  useEffect(() => {
    applyTheme(theme);
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const fn = () => applyTheme("system");
    mq.addEventListener("change", fn);
    return () => mq.removeEventListener("change", fn);
  }, [theme]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const setTheme = (t: ThemeChoice) => {
    setThemeState(t);
    localStorage.setItem(KEYS.theme, t);
  };
  const setLang = (l: Language) => {
    setLangState(l);
    localStorage.setItem(KEYS.lang, l);
  };
  const persist = (list: Review[]) =>
    localStorage.setItem(KEYS.reviews, JSON.stringify(Object.fromEntries(list.map((r) => [r.id, r.status]))));

  const toggleReview = (id: string) =>
    setReviews((prev) => {
      const next = prev.map((r) =>
        r.id === id ? { ...r, status: r.status === "pending" ? ("completed" as const) : ("pending" as const) } : r,
      );
      persist(next);
      return next;
    });
  const resetReviews = () => {
    localStorage.removeItem(KEYS.reviews);
    setReviews(initialReviews);
  };

  const t = useCallback((key: TranslationKey, vars?: Record<string, string | number>) => translate(lang, key, vars), [lang]);
  const locale = languages.find((l) => l.code === lang)?.locale ?? "en-GB";

  return (
    <AppContext.Provider value={{ theme, setTheme, lang, setLang, locale, t, reviews, toggleReview, resetReviews }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside AppProvider");
  return ctx;
}

// Inline script for <head> to apply the saved theme before first paint.
export const themeInitScript = `try{var t=localStorage.getItem("${KEYS.theme}")||"system";if(t==="dark"||(t==="system"&&matchMedia("(prefers-color-scheme: dark)").matches))document.documentElement.classList.add("dark")}catch(e){}`;
