import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ClipboardCheck, ClipboardList, HeartPulse, Users } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { formatDate, formatDateTime, getLatestReading, getPatient, historyEntries, patients } from "@/data/demo";
import { PageHeader, Panel, StatusBadge, btnOutline } from "@/components/ui-kit";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — HealthGuard AI" },
      { name: "description", content: "Overview of fictional demo patients, sample vitals and doctor reviews." },
      { property: "og:title", content: "Dashboard — HealthGuard AI" },
      { property: "og:description", content: "Overview of fictional demo patients, sample vitals and doctor reviews." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const { t, locale, reviews } = useApp();
  const pendingCount = reviews.filter((r) => r.status === "pending").length;
  const stats = [
    { label: t("totalPatients"), value: patients.length, icon: Users },
    { label: t("underReviewCount"), value: patients.filter((p) => p.status === "underReview").length, icon: Activity },
    { label: t("pendingReviews"), value: pendingCount, icon: ClipboardList },
    { label: t("completedReviews"), value: reviews.length - pendingCount, icon: ClipboardCheck },
  ];
  const activity = [...historyEntries].sort((a, b) => b.timestamp.localeCompare(a.timestamp)).slice(0, 5);
  const recentReviews = [...reviews].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4);

  return (
    <div className="space-y-6">
      <PageHeader title={t("navDashboard")} subtitle={t("demoBanner")} />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map(({ label, value, icon: Icon }) => (
          <Panel key={label}>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold">{value}</p>
              </div>
              <span className="rounded-lg bg-secondary p-2 text-primary"><Icon className="size-5" /></span>
            </div>
          </Panel>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title={t("latestVitals")} className="lg:col-span-2" action={<span className="text-xs text-muted-foreground">{t("simulated")}</span>}>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[560px] text-sm">
              <thead className="text-left text-muted-foreground">
                <tr className="border-b">
                  <th className="py-2 font-medium">{t("patient")}</th>
                  <th className="py-2 font-medium">{t("heartRate")}</th>
                  <th className="py-2 font-medium">{t("bloodPressure")}</th>
                  <th className="py-2 font-medium">{t("oxygen")}</th>
                  <th className="py-2 font-medium">{t("temperature")}</th>
                </tr>
              </thead>
              <tbody>
                {patients.map((p) => {
                  const r = getLatestReading(p.id);
                  return (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-2.5">
                        <Link to="/monitoring" search={{ patient: p.id }} className="font-medium text-primary hover:underline">{p.name}</Link>
                        <div className="text-xs text-muted-foreground">{p.id}</div>
                      </td>
                      {r ? (
                        <>
                          <td>{r.heartRate} bpm</td>
                          <td>{r.systolic}/{r.diastolic} mmHg</td>
                          <td>{r.oxygen}%</td>
                          <td>{r.temperature} °C</td>
                        </>
                      ) : (
                        <td colSpan={4} className="text-muted-foreground">{t("noReadings")}</td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={t("quickActions")}>
          <div className="flex flex-col gap-2">
            <Link to="/patients" className={btnOutline + " justify-start"}><Users className="size-4" />{t("openPatients")}</Link>
            <Link to="/monitoring" className={btnOutline + " justify-start"}><HeartPulse className="size-4" />{t("openMonitoring")}</Link>
            <Link to="/reviews" className={btnOutline + " justify-start"}><ClipboardCheck className="size-4" />{t("openReviews")}</Link>
          </div>
        </Panel>

        <Panel title={t("recentActivity")} className="lg:col-span-2">
          <ul className="divide-y">
            {activity.map((h) => (
              <li key={h.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                <div>
                  <Link to="/history" search={{ patient: h.patientId }} className="font-medium hover:underline">
                    {getPatient(h.patientId)?.name} · {t(h.type)}
                  </Link>
                  <p className="text-muted-foreground">{h.summary}</p>
                </div>
                <span className="text-xs text-muted-foreground">{formatDateTime(h.timestamp, locale)}</span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title={t("recentReviews")}>
          <ul className="space-y-3">
            {recentReviews.map((r) => (
              <li key={r.id} className="flex items-center justify-between gap-2 text-sm">
                <Link to="/reviews" search={{ review: r.id }} className="min-w-0 hover:underline">
                  <p className="truncate font-medium">{getPatient(r.patientId)?.name}</p>
                  <p className="text-xs text-muted-foreground">{r.patientId} · {formatDate(r.date, locale)}</p>
                </Link>
                <StatusBadge status={r.status} />
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </div>
  );
}
