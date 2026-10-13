// Small reusable building blocks shared by every page.
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useApp } from "@/lib/app-context";
import type { PatientStatus, ReviewStatus } from "@/data/demo";

export function Panel({ title, action, children, className }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("rounded-xl border bg-card p-5 text-card-foreground shadow-card", className)}>
      {(title || action) && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

export function PageHeader({ title, subtitle, children }: { title: string; subtitle?: string; children?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>}
      </div>
      {children}
    </div>
  );
}

const statusStyles: Record<PatientStatus | ReviewStatus, string> = {
  stable: "bg-success/15 text-success",
  underReview: "bg-warning/15 text-warning",
  followUp: "bg-primary/15 text-primary",
  pending: "bg-warning/15 text-warning",
  completed: "bg-success/15 text-success",
};

export function StatusBadge({ status }: { status: PatientStatus | ReviewStatus }) {
  const { t } = useApp();
  return (
    <span className={cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[status])}>
      {t(status)}
    </span>
  );
}

export function EmptyState({ icon, message }: { icon: ReactNode; message: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed p-10 text-center text-sm text-muted-foreground">
      <span className="text-muted-foreground">{icon}</span>
      {message}
    </div>
  );
}

export const fieldClass =
  "h-10 rounded-lg border bg-background px-3 text-sm text-foreground outline-none focus-visible:ring-2 focus-visible:ring-ring";
export const btnPrimary =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";
export const btnOutline =
  "inline-flex h-10 items-center justify-center gap-2 rounded-lg border bg-background px-4 text-sm font-medium hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
