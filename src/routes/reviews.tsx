import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CheckCircle2, ClipboardX, RotateCcw } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatDate, getPatient, type ReviewStatus } from "@/data/demo";
import type { TranslationKey } from "@/i18n/translations";
import { EmptyState, PageHeader, Panel, StatusBadge, btnOutline, btnPrimary, fieldClass } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

type Search = { status?: ReviewStatus; review?: string };

export const Route = createFileRoute("/reviews")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    status: s.status === "pending" || s.status === "completed" ? s.status : undefined,
    review: typeof s.review === "string" ? s.review : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Doctor Review — HealthGuard AI" },
      { name: "description", content: "Demo review workflow for fictional patient records." },
      { property: "og:title", content: "Doctor Review — HealthGuard AI" },
      { property: "og:description", content: "Demo review workflow for fictional patient records." },
    ],
  }),
  component: ReviewsPage,
});

function ReviewsPage() {
  const { t, locale, reviews, toggleReview, resetReviews } = useApp();
  const { status, review } = Route.useSearch();
  const navigate = useNavigate({ from: "/reviews" });
  const set = (patch: Partial<Search>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });
  const list = reviews.filter((r) => !status || r.status === status);
  const selected = reviews.find((r) => r.id === review);

  return (
    <div>
      <PageHeader title={t("navReviews")} subtitle={t("reviewDisclaimer")}>
        <button onClick={resetReviews} className={btnOutline}><RotateCcw className="size-4" />{t("resetDemo")}</button>
      </PageHeader>
      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        <Panel
          title={t("reviewList")}
          action={
            <select value={status ?? ""} onChange={(e) => set({ status: (e.target.value || undefined) as ReviewStatus | undefined })} aria-label={t("status")} className={fieldClass}>
              <option value="">{t("allStatuses")}</option>
              <option value="pending">{t("pending")}</option>
              <option value="completed">{t("completed")}</option>
            </select>
          }
        >
          {list.length === 0 ? (
            <EmptyState icon={<ClipboardX className="size-8" />} message={t("noReviews")} />
          ) : (
            <ul className="space-y-2">
              {list.map((r) => (
                <li key={r.id}>
                  <button
                    onClick={() => set({ review: r.id })}
                    aria-pressed={r.id === review}
                    className={cn("flex w-full items-center justify-between gap-3 rounded-lg border p-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", r.id === review && "border-primary bg-accent")}
                  >
                    <div className="min-w-0">
                      <p className="truncate font-medium">{getPatient(r.patientId)?.name}</p>
                      <p className="text-xs text-muted-foreground">{r.id} · {r.patientId} · {formatDate(r.date, locale)}</p>
                    </div>
                    <StatusBadge status={r.status} />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel className="h-fit" title={selected ? selected.id : undefined}>
          {!selected ? (
            <p className="text-sm text-muted-foreground">{t("selectReview")}</p>
          ) : (
            <div className="space-y-4 text-sm">
              <dl className="grid grid-cols-2 gap-3">
                <div><dt className="text-muted-foreground">{t("patient")}</dt><dd className="font-medium">{getPatient(selected.patientId)?.name}</dd></div>
                <div><dt className="text-muted-foreground">{t("patientId")}</dt><dd className="font-mono text-xs">{selected.patientId}</dd></div>
                <div><dt className="text-muted-foreground">{t("reviewDate")}</dt><dd>{formatDate(selected.date, locale)}</dd></div>
                <div><dt className="text-muted-foreground">{t("status")}</dt><dd><StatusBadge status={selected.status} /></dd></div>
              </dl>
              <div>
                <p className="mb-1 text-muted-foreground">{t("reviewNotes")}</p>
                <p className="rounded-lg bg-muted p-3">{t(selected.noteKey as TranslationKey)}</p>
              </div>
              {selected.status === "pending" ? (
                <button onClick={() => toggleReview(selected.id)} className={cn(btnPrimary, "w-full")}><CheckCircle2 className="size-4" />{t("markCompleted")}</button>
              ) : (
                <button onClick={() => toggleReview(selected.id)} className={cn(btnOutline, "w-full")}><RotateCcw className="size-4" />{t("markPending")}</button>
              )}
              <p className="text-xs text-muted-foreground">{t("reviewDisclaimer")}</p>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
