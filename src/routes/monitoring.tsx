import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Activity, Droplets, HeartPulse, Thermometer, Wind } from "lucide-react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import type { ReactNode } from "react";
import { useApp } from "@/lib/app-context";
import { formatDate, formatDateTime, getReadings, patients, type VitalReading } from "@/data/demo";
import { EmptyState, PageHeader, Panel, fieldClass } from "@/components/ui-kit";

type Range = "7" | "14" | "30";
type Search = { patient: string; range: Range };

export const Route = createFileRoute("/monitoring")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    patient: typeof s.patient === "string" && patients.some((p) => p.id === s.patient) ? s.patient : patients[0].id,
    range: s.range === "7" || s.range === "30" ? s.range : "14",
  }),
  head: () => ({
    meta: [
      { title: "Health Monitoring — HealthGuard AI" },
      { name: "description", content: "Simulated sample vital readings and charts for fictional demo patients." },
      { property: "og:title", content: "Health Monitoring — HealthGuard AI" },
      { property: "og:description", content: "Simulated sample vital readings and charts for fictional demo patients." },
    ],
  }),
  component: MonitoringPage,
});

const axisStyle = { fill: "var(--muted-foreground)", fontSize: 12 };
const tooltipStyle = { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--popover-foreground)" };

function VitalChart({ title, data, lines, unit, domain, locale, dateLabel }: {
  title: string; data: VitalReading[]; lines: { key: keyof VitalReading; name: string; color: string }[];
  unit: string; domain: [number | string, number | string]; locale: string; dateLabel: string;
}) {
  return (
    <Panel title={`${title} (${unit})`}>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 10, bottom: 20, left: 0 }}>
            <CartesianGrid stroke="var(--chart-grid)" strokeDasharray="3 3" />
            <XAxis dataKey="timestamp" tick={axisStyle} stroke="var(--border)" tickFormatter={(v) => new Date(v).toLocaleDateString(locale, { day: "numeric", month: "short", timeZone: "UTC" })}
              label={{ value: dateLabel, position: "insideBottom", offset: -12, ...axisStyle }} />
            <YAxis tick={axisStyle} stroke="var(--border)" domain={domain} width={48} label={{ value: unit, angle: -90, position: "insideLeft", ...axisStyle }} />
            <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => formatDateTime(String(v), locale)} formatter={(v) => `${v} ${unit}`} />
            {lines.length > 1 && <Legend verticalAlign="top" height={28} />}
            {lines.map((l) => <Line key={l.key} type="monotone" dataKey={l.key} name={l.name} stroke={l.color} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />)}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Panel>
  );
}

function VitalCard({ icon, label, value, time }: { icon: ReactNode; label: string; value: string; time: string }) {
  return (
    <Panel>
      <div className="flex items-center gap-2 text-sm text-muted-foreground">{icon}{label}</div>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
      <p className="mt-1 text-xs text-muted-foreground">{time}</p>
    </Panel>
  );
}

function MonitoringPage() {
  const { t, locale } = useApp();
  const { patient, range } = Route.useSearch();
  const navigate = useNavigate({ from: "/monitoring" });
  const all = getReadings(patient);
  const data = all.slice(-Number(range));
  const latest = all.at(-1);
  const measured = latest ? `${t("measuredAt")}: ${formatDateTime(latest.timestamp, locale)} · ${t("simulated")}` : "";

  return (
    <div className="space-y-6">
      <PageHeader title={t("navMonitoring")} subtitle={t("simulatedNote")}>
        <div className="flex flex-wrap gap-3">
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("selectPatient")}
            <select value={patient} onChange={(e) => navigate({ search: (p) => ({ ...p, patient: e.target.value }) })} className={fieldClass}>
              {patients.map((p) => <option key={p.id} value={p.id}>{p.id} · {p.name}</option>)}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs text-muted-foreground">
            {t("dateRange")}
            <select value={range} onChange={(e) => navigate({ search: (p) => ({ ...p, range: e.target.value as Range }) })} className={fieldClass}>
              <option value="7">{t("last7")}</option>
              <option value="14">{t("last14")}</option>
              <option value="30">{t("last30")}</option>
            </select>
          </label>
        </div>
      </PageHeader>

      {!latest ? (
        <EmptyState icon={<Activity className="size-8" />} message={t("noReadings")} />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <VitalCard icon={<HeartPulse className="size-4 text-chart-4" />} label={t("heartRate")} value={`${latest.heartRate} bpm`} time={measured} />
            <VitalCard icon={<Droplets className="size-4 text-chart-1" />} label={t("bloodPressure")} value={`${latest.systolic}/${latest.diastolic} mmHg`} time={measured} />
            <VitalCard icon={<Wind className="size-4 text-chart-2" />} label={t("oxygen")} value={`${latest.oxygen}%`} time={measured} />
            <VitalCard icon={<Thermometer className="size-4 text-chart-3" />} label={t("temperature")} value={`${latest.temperature} °C`} time={measured} />
          </div>
          <p className="text-sm text-muted-foreground">
            {t("dateRange")}: {formatDate(data[0].timestamp, locale)} – {formatDate(data.at(-1)!.timestamp, locale)}
          </p>
          <div className="grid gap-6 xl:grid-cols-2">
            <VitalChart title={t("heartRate")} unit="bpm" data={data} domain={["dataMin - 5", "dataMax + 5"]} locale={locale} dateLabel={t("dateAxis")} lines={[{ key: "heartRate", name: t("heartRate"), color: "var(--chart-4)" }]} />
            <VitalChart title={t("bloodPressure")} unit="mmHg" data={data} domain={["dataMin - 10", "dataMax + 10"]} locale={locale} dateLabel={t("dateAxis")} lines={[{ key: "systolic", name: t("systolic"), color: "var(--chart-1)" }, { key: "diastolic", name: t("diastolic"), color: "var(--chart-2)" }]} />
            <VitalChart title={t("oxygen")} unit="%" data={data} domain={[90, 100]} locale={locale} dateLabel={t("dateAxis")} lines={[{ key: "oxygen", name: t("oxygen"), color: "var(--chart-2)" }]} />
            <VitalChart title={t("temperature")} unit="°C" data={data} domain={[35.5, 38.5]} locale={locale} dateLabel={t("dateAxis")} lines={[{ key: "temperature", name: t("temperature"), color: "var(--chart-3)" }]} />
          </div>
        </>
      )}
    </div>
  );
}
