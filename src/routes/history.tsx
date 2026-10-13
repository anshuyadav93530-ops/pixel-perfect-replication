import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { FileX } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatDateTime, getHistory, patients } from "@/data/demo";
import { EmptyState, PageHeader, Panel, btnOutline, fieldClass } from "@/components/ui-kit";

type Search = { patient: string; from?: string; to?: string };

export const Route = createFileRoute("/history")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    patient: typeof s.patient === "string" && patients.some((p) => p.id === s.patient) ? s.patient : patients[0].id,
    from: typeof s.from === "string" ? s.from : undefined,
    to: typeof s.to === "string" ? s.to : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Patient History — HealthGuard AI" },
      { name: "description", content: "Chronological timeline of fictional demo patient records." },
      { property: "og:title", content: "Patient History — HealthGuard AI" },
      { property: "og:description", content: "Chronological timeline of fictional demo patient records." },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const { t, locale } = useApp();
  const { patient, from, to } = Route.useSearch();
  const navigate = useNavigate({ from: "/history" });
  const set = (patch: Partial<Search>) => navigate({ search: (p) => ({ ...p, ...patch }), replace: true });
  const entries = getHistory(patient).filter((h) => {
    const d = h.timestamp.slice(0, 10);
    return (!from || d >= from) && (!to || d <= to);
  });

  return (
    <div>
      <PageHeader title={t("navHistory")} subtitle={t("fictionalHistory")} />
      <Panel className="mb-6">
        <div className="flex flex-wrap items-end gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("selectPatient")}
            <select value={patient} onChange={(e) => set({ patient: e.target.value })} className={fieldClass}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("from")}
            <input type="date" value={from ?? ""} onChange={(e) => set({ from: e.target.value || undefined })} className={fieldClass} />
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("to")}
            <input type="date" value={to ?? ""} onChange={(e) => set({ to: e.target.value || undefined })} className={fieldClass} />
          </label>
          {(from || to) && <button onClick={() => set({ from: undefined, to: undefined })} className={btnOutline}>{t("clearFilters")}</button>}
        </div>
      </Panel>

      {entries.length === 0 ? (
        <EmptyState icon={<FileX className="size-8" />} message={t("noHistory")} />
      ) : (
        <ol className="relative space-y-4 border-l-2 border-border pl-6">
          {entries.map((h) => (
            <li key={h.id} className="relative">
              <span className="absolute -left-[31px] top-5 size-3 rounded-full border-2 border-background bg-primary" />
              <Panel>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">{t(h.type)}</span>
                  <time className="text-xs text-muted-foreground">{formatDateTime(h.timestamp, locale)}</time>
                </div>
                <p className="mt-2 font-medium">{h.summary}</p>
                <p className="mt-1 text-sm text-muted-foreground"><span className="font-medium">{t("notes")}:</span> {h.notes}</p>
                {h.vitals && (
                  <div className="mt-3 rounded-lg bg-muted p-3 text-sm">
                    <p className="mb-1 text-xs font-medium text-muted-foreground">{t("relatedVitals")}</p>
                    <div className="flex flex-wrap gap-x-5 gap-y-1">
                      <span>{t("heartRate")}: {h.vitals.heartRate} bpm</span>
                      <span>{t("bloodPressure")}: {h.vitals.systolic}/{h.vitals.diastolic} mmHg</span>
                      <span>{t("oxygen")}: {h.vitals.oxygen}%</span>
                      <span>{t("temperature")}: {h.vitals.temperature} °C</span>
                    </div>
                  </div>
                )}
              </Panel>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
