import { createFileRoute } from "@tanstack/react-router";
import { CircleOff, Database, Info } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatDateTime, historyEntries, latestDataTimestamp, patients, vitalReadings } from "@/data/demo";
import { PageHeader, Panel } from "@/components/ui-kit";

export const Route = createFileRoute("/data-status")({
  head: () => ({
    meta: [
      { title: "Data & Demo Status — HealthGuard AI" },
      { name: "description", content: "What fictional sample data is available and what is not connected." },
      { property: "og:title", content: "Data & Demo Status — HealthGuard AI" },
      { property: "og:description", content: "What fictional sample data is available and what is not connected." },
    ],
  }),
  component: DataStatusPage,
});

function DataStatusPage() {
  const { t, locale, reviews } = useApp();
  const categories = [
    { label: t("catPatients"), count: patients.length },
    { label: t("catVitals"), count: vitalReadings.length },
    { label: t("catHistory"), count: historyEntries.length },
    { label: t("catReviews"), count: reviews.length },
  ];
  const integrations = [t("liveDevices"), t("externalSources"), t("backend"), t("aiModel")];

  return (
    <div className="space-y-6">
      <PageHeader title={t("navData")} />
      <div className="flex gap-3 rounded-xl border border-primary/30 bg-secondary p-4 text-sm text-secondary-foreground">
        <Info className="mt-0.5 size-5 shrink-0 text-primary" />
        <p>{t("notConnectedExplain")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Panel>
          <p className="text-sm text-muted-foreground">{t("demoStatus")}</p>
          <p className="mt-1 text-xl font-semibold text-primary">{t("demoMode")} · {t("active")}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">{t("latestTimestamp")}</p>
          <p className="mt-1 text-xl font-semibold">{formatDateTime(latestDataTimestamp, locale)}</p>
        </Panel>
        <Panel>
          <p className="text-sm text-muted-foreground">{t("localRecords")}</p>
          <p className="mt-1 text-xl font-semibold text-success">{t("available")}</p>
        </Panel>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Panel title={t("dataCategories")}>
          <ul className="divide-y text-sm">
            {categories.map((c) => (
              <li key={c.label} className="flex items-center justify-between py-2.5">
                <span className="flex items-center gap-2"><Database className="size-4 text-primary" />{c.label}</span>
                <span className="text-muted-foreground">{c.count} {t("records")}</span>
              </li>
            ))}
          </ul>
        </Panel>
        <Panel title={t("connections")}>
          <ul className="divide-y text-sm">
            {integrations.map((name) => (
              <li key={name} className="flex items-center justify-between py-2.5">
                <span>{name}</span>
                <span className="flex items-center gap-1.5 text-muted-foreground"><CircleOff className="size-4" />{t("notConnected")}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
