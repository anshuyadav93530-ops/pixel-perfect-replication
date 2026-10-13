import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Activity, ClipboardCheck, History, UserSearch } from "lucide-react";
import { useApp } from "@/lib/app-context";
import { getPatient, patients, type PatientStatus } from "@/data/demo";
import { EmptyState, PageHeader, Panel, StatusBadge, btnOutline, btnPrimary, fieldClass } from "@/components/ui-kit";
import { cn } from "@/lib/utils";

type Search = { q?: string; status?: PatientStatus; patient?: string };

export const Route = createFileRoute("/patients")({
  validateSearch: (s: Record<string, unknown>): Search => ({
    q: typeof s.q === "string" ? s.q : undefined,
    status: ["stable", "underReview", "followUp"].includes(s.status as string) ? (s.status as PatientStatus) : undefined,
    patient: typeof s.patient === "string" ? s.patient : undefined,
  }),
  head: () => ({
    meta: [
      { title: "Patients — HealthGuard AI" },
      { name: "description", content: "Search and filter fictional demo patient profiles." },
      { property: "og:title", content: "Patients — HealthGuard AI" },
      { property: "og:description", content: "Search and filter fictional demo patient profiles." },
    ],
  }),
  component: PatientsPage,
});

function PatientsPage() {
  const { t, reviews } = useApp();
  const { q = "", status, patient } = Route.useSearch();
  const navigate = useNavigate({ from: "/patients" });
  const setSearch = (patch: Partial<Search>) => navigate({ search: (prev) => ({ ...prev, ...patch }), replace: true });

  const term = q.trim().toLowerCase();
  const list = patients.filter(
    (p) => (!term || p.name.toLowerCase().includes(term) || p.id.toLowerCase().includes(term)) && (!status || p.status === status),
  );
  const selected = patient ? getPatient(patient) : undefined;
  const review = selected && reviews.find((r) => r.patientId === selected.id);

  return (
    <div>
      <PageHeader title={t("navPatients")} subtitle={t("demoBanner")} />
      <div className="grid gap-6 lg:grid-cols-[1fr_340px]">
        <Panel>
          <div className="mb-4 flex flex-wrap gap-3">
            <input value={q} onChange={(e) => setSearch({ q: e.target.value || undefined })} placeholder={t("searchPatients")} aria-label={t("searchPatients")} className={cn(fieldClass, "min-w-0 flex-1")} />
            <select value={status ?? ""} onChange={(e) => setSearch({ status: (e.target.value || undefined) as PatientStatus | undefined })} aria-label={t("status")} className={fieldClass}>
              <option value="">{t("allStatuses")}</option>
              <option value="stable">{t("stable")}</option>
              <option value="underReview">{t("underReview")}</option>
              <option value="followUp">{t("followUp")}</option>
            </select>
          </div>
          {list.length === 0 ? (
            <EmptyState icon={<UserSearch className="size-8" />} message={t("noPatientsFound")} />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px] text-sm">
                <thead className="text-left text-muted-foreground">
                  <tr className="border-b">
                    <th className="py-2 font-medium">{t("patientId")}</th>
                    <th className="py-2 font-medium">{t("name")}</th>
                    <th className="py-2 font-medium">{t("age")}</th>
                    <th className="py-2 font-medium">{t("gender")}</th>
                    <th className="py-2 font-medium">{t("status")}</th>
                    <th className="py-2 text-right font-medium">{t("actions")}</th>
                  </tr>
                </thead>
                <tbody>
                  {list.map((p) => (
                    <tr key={p.id} className={cn("border-b last:border-0", p.id === patient && "bg-accent/60")}>
                      <td className="py-2.5 font-mono text-xs">{p.id}</td>
                      <td className="font-medium">{p.name}</td>
                      <td>{p.age}</td>
                      <td>{t(p.gender)}</td>
                      <td><StatusBadge status={p.status} /></td>
                      <td className="py-2 text-right">
                        <button onClick={() => setSearch({ patient: p.id })} className={cn(btnOutline, "h-8 px-3")}>{t("viewProfile")}</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <Panel title={t("patientProfile")} className="h-fit">
          {!selected ? (
            <p className="text-sm text-muted-foreground">{t("selectPatientPrompt")}</p>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex size-12 items-center justify-center rounded-full bg-secondary font-semibold text-secondary-foreground">
                  {selected.name.split(" ").map((n) => n[0]).join("")}
                </div>
                <div>
                  <p className="font-semibold">{selected.name}</p>
                  <p className="font-mono text-xs text-muted-foreground">{selected.id}</p>
                </div>
              </div>
              <dl className="grid grid-cols-2 gap-3 text-sm">
                <div><dt className="text-muted-foreground">{t("age")}</dt><dd>{selected.age}</dd></div>
                <div><dt className="text-muted-foreground">{t("gender")}</dt><dd>{t(selected.gender)}</dd></div>
                <div><dt className="text-muted-foreground">{t("bloodGroup")}</dt><dd>{selected.bloodGroup}</dd></div>
                <div><dt className="text-muted-foreground">{t("status")}</dt><dd><StatusBadge status={selected.status} /></dd></div>
                <div className="col-span-2"><dt className="text-muted-foreground">{t("contact")}</dt><dd className="break-all">{selected.contact}</dd></div>
              </dl>
              <div className="flex flex-col gap-2">
                <Link to="/monitoring" search={{ patient: selected.id }} className={btnPrimary}><Activity className="size-4" />{t("viewMonitoring")}</Link>
                <Link to="/history" search={{ patient: selected.id }} className={btnOutline}><History className="size-4" />{t("viewHistory")}</Link>
                <Link to="/reviews" search={{ review: review?.id }} className={btnOutline}><ClipboardCheck className="size-4" />{t("viewReview")}</Link>
              </div>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}
