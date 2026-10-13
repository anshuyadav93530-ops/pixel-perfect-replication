import { useState, type ReactNode } from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import {
  Activity, Bell, ChevronsLeft, ChevronsRight, ClipboardCheck, Database, HeartPulse, History,
  LayoutDashboard, Menu, Monitor, Moon, Search, Sun, Users, X,
} from "lucide-react";
import { useApp, type ThemeChoice } from "@/lib/app-context";
import { languages, type Language, type TranslationKey } from "@/i18n/translations";
import { patients } from "@/data/demo";
import { cn } from "@/lib/utils";
import { fieldClass } from "./ui-kit";

const nav: { to: "/" | "/patients" | "/monitoring" | "/history" | "/reviews" | "/data-status"; key: TranslationKey; icon: typeof Users }[] = [
  { to: "/", key: "navDashboard", icon: LayoutDashboard },
  { to: "/patients", key: "navPatients", icon: Users },
  { to: "/monitoring", key: "navMonitoring", icon: Activity },
  { to: "/history", key: "navHistory", icon: History },
  { to: "/reviews", key: "navReviews", icon: ClipboardCheck },
  { to: "/data-status", key: "navData", icon: Database },
];

export function AppShell({ children }: { children: ReactNode }) {
  const { t, theme, setTheme, lang, setLang, reviews } = useApp();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const current = nav.find((n) => n.to === pathname);
  const pending = reviews.filter((r) => r.status === "pending");

  const ThemeIcon = theme === "dark" ? Moon : theme === "light" ? Sun : Monitor;

  const sidebar = (isMobile: boolean) => (
    <nav aria-label="Main" className="flex flex-1 flex-col gap-1 p-3">
      {nav.map(({ to, key, icon: Icon }) => (
        <Link
          key={to}
          to={to}
          onClick={() => setMobileOpen(false)}
          activeOptions={{ exact: true }}
          title={collapsed && !isMobile ? t(key) : undefined}
          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring data-[status=active]:bg-sidebar-primary data-[status=active]:text-sidebar-primary-foreground"
        >
          <Icon className="size-5 shrink-0" aria-hidden />
          {(!collapsed || isMobile) && <span className="truncate">{t(key)}</span>}
        </Link>
      ))}
    </nav>
  );

  const brand = (showText: boolean) => (
    <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
      <HeartPulse className="size-6 shrink-0 text-sidebar-primary" aria-hidden />
      {showText && <span className="truncate font-semibold">{t("appName")}</span>}
    </div>
  );

  return (
    <div className="flex min-h-screen bg-background text-foreground">
      {/* Desktop sidebar */}
      <aside className={cn("sticky top-0 hidden h-screen shrink-0 flex-col border-r border-sidebar-border bg-sidebar text-sidebar-foreground transition-[width] md:flex", collapsed ? "w-[72px]" : "w-64")}>
        {brand(!collapsed)}
        {sidebar(false)}
        <button
          onClick={() => setCollapsed((c) => !c)}
          aria-label={collapsed ? t("expand") : t("collapse")}
          className="m-3 flex items-center justify-center gap-2 rounded-lg p-2 text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
        >
          {collapsed ? <ChevronsRight className="size-5" /> : <><ChevronsLeft className="size-5" /><span>{t("collapse")}</span></>}
        </button>
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-foreground/40" onClick={() => setMobileOpen(false)} />
          <aside className="relative flex h-full w-64 flex-col bg-sidebar text-sidebar-foreground">
            <button onClick={() => setMobileOpen(false)} aria-label="Close" className="absolute right-3 top-4 rounded p-1 hover:bg-sidebar-accent">
              <X className="size-5" />
            </button>
            {brand(true)}
            {sidebar(true)}
          </aside>
        </div>
      )}

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="bg-demo px-4 py-1.5 text-center text-xs font-medium text-demo-foreground">
          <span className="mr-2 rounded bg-demo-foreground/15 px-1.5 py-0.5 font-bold tracking-wide">{t("demoMode")}</span>
          {t("demoBanner")}
        </div>
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b bg-background/90 px-4 backdrop-blur">
          <button onClick={() => setMobileOpen(true)} aria-label={t("openMenu")} className="rounded-lg p-2 hover:bg-accent md:hidden">
            <Menu className="size-5" />
          </button>
          <h1 className="hidden truncate text-lg font-semibold lg:block">{current ? t(current.key) : t("appName")}</h1>

          <form
            className="relative ml-auto min-w-0 flex-1 sm:max-w-xs"
            onSubmit={(e) => {
              e.preventDefault();
              navigate({ to: "/patients", search: { q: query || undefined } });
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              list="patient-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t("searchPatients")}
              aria-label={t("searchPatients")}
              className={cn(fieldClass, "w-full pl-9")}
            />
            <datalist id="patient-search">
              {patients.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
            </datalist>
          </form>

          <div className="relative">
            <button onClick={() => setNotifOpen((o) => !o)} aria-label={t("notifications")} aria-expanded={notifOpen} className="relative rounded-lg p-2 hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <Bell className="size-5" />
              {pending.length > 0 && <span className="absolute right-1 top-1 size-2 rounded-full bg-warning" />}
            </button>
            {notifOpen && (
              <div className="absolute right-0 top-12 z-40 w-72 rounded-xl border bg-popover p-3 text-popover-foreground shadow-card">
                <p className="mb-2 text-sm font-semibold">{t("notifications")}</p>
                {pending.length === 0 ? (
                  <p className="text-sm text-muted-foreground">{t("noNotifications")}</p>
                ) : (
                  <Link to="/reviews" onClick={() => setNotifOpen(false)} className="block rounded-lg p-2 text-sm hover:bg-accent">
                    {t("pendingReviewsNotice", { n: pending.length })}
                  </Link>
                )}
              </div>
            )}
          </div>

          <label className="relative flex items-center">
            <span className="sr-only">{t("theme")}</span>
            <ThemeIcon className="pointer-events-none absolute left-2.5 size-4" />
            <select value={theme} onChange={(e) => setTheme(e.target.value as ThemeChoice)} className={cn(fieldClass, "w-10 appearance-none pl-8 pr-1 sm:w-auto sm:pr-3")}>
              <option value="light">{t("light")}</option>
              <option value="dark">{t("dark")}</option>
              <option value="system">{t("system")}</option>
            </select>
          </label>

          <label>
            <span className="sr-only">{t("language")}</span>
            <select value={lang} onChange={(e) => setLang(e.target.value as Language)} className={cn(fieldClass, "max-w-[6.5rem]")}>
              {languages.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
            </select>
          </label>

          <div className="hidden items-center gap-2 xl:flex" title={t("demoRole")}>
            <div className="flex size-9 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-secondary-foreground">DU</div>
            <div className="leading-tight">
              <p className="text-sm font-medium">{t("demoUser")}</p>
              <p className="text-xs text-muted-foreground">{t("demoRole")}</p>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
