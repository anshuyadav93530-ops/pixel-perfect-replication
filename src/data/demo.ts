// FICTIONAL DEMO DATA — not real patients, not live devices.
// Replace this module with a real data source later; UI reads only through the helpers below.

export type PatientStatus = "stable" | "underReview" | "followUp";
export type ReviewStatus = "pending" | "completed";

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: "male" | "female";
  status: PatientStatus;
  bloodGroup: string;
  contact: string;
}

export interface VitalReading {
  patientId: string;
  timestamp: string; // ISO
  heartRate: number; // bpm
  systolic: number; // mmHg
  diastolic: number; // mmHg
  oxygen: number; // %
  temperature: number; // °C
}

export interface HistoryEntry {
  id: string;
  patientId: string;
  timestamp: string;
  type: "checkup" | "consultation" | "labTest" | "followUpVisit";
  summary: string;
  notes: string;
  vitals?: Pick<VitalReading, "heartRate" | "systolic" | "diastolic" | "oxygen" | "temperature">;
}

export interface Review {
  id: string;
  patientId: string;
  date: string;
  noteKey: string; // translation key for the sample note
  status: ReviewStatus;
}

export const patients: Patient[] = [
  { id: "HG-1001", name: "Aarav Mehta", age: 54, gender: "male", status: "underReview", bloodGroup: "B+", contact: "demo-1001@example.test" },
  { id: "HG-1002", name: "Sofia Ramirez", age: 37, gender: "female", status: "stable", bloodGroup: "O+", contact: "demo-1002@example.test" },
  { id: "HG-1003", name: "Lucas Bernard", age: 68, gender: "male", status: "followUp", bloodGroup: "A-", contact: "demo-1003@example.test" },
  { id: "HG-1004", name: "Priya Sharma", age: 45, gender: "female", status: "stable", bloodGroup: "AB+", contact: "demo-1004@example.test" },
  { id: "HG-1005", name: "Emma Dubois", age: 29, gender: "female", status: "underReview", bloodGroup: "O-", contact: "demo-1005@example.test" },
  { id: "HG-1006", name: "Daniel Okafor", age: 61, gender: "male", status: "followUp", bloodGroup: "A+", contact: "demo-1006@example.test" },
];

// Deterministic pseudo-random so values stay identical across reloads.
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

const LATEST = Date.UTC(2026, 9, 12, 8, 0); // 12 Oct 2026 08:00 UTC
const DAY = 86400000;

const baselines: Record<string, [number, number, number, number, number]> = {
  "HG-1001": [82, 138, 88, 96, 36.9],
  "HG-1002": [70, 118, 76, 98, 36.6],
  "HG-1003": [76, 146, 92, 95, 37.0],
  "HG-1004": [68, 122, 80, 98, 36.7],
  "HG-1005": [88, 112, 72, 97, 37.2],
  // HG-1006 intentionally has no readings (empty-state demo)
};

export const vitalReadings: VitalReading[] = Object.entries(baselines).flatMap(([pid, b], i) => {
  const rnd = seeded(i + 7);
  return Array.from({ length: 30 }, (_, d) => {
    const v = (range: number) => (rnd() - 0.5) * range;
    return {
      patientId: pid,
      timestamp: new Date(LATEST - (29 - d) * DAY).toISOString(),
      heartRate: Math.round(b[0] + v(12)),
      systolic: Math.round(b[1] + v(14)),
      diastolic: Math.round(b[2] + v(10)),
      oxygen: Math.min(100, Math.round(b[3] + v(3))),
      temperature: Math.round((b[4] + v(0.8)) * 10) / 10,
    };
  });
});

export const historyEntries: HistoryEntry[] = [
  { id: "H1", patientId: "HG-1001", timestamp: "2026-10-10T09:30:00Z", type: "consultation", summary: "Routine consultation, blood pressure discussed.", notes: "Sample note: patient asked about diet.", vitals: { heartRate: 84, systolic: 140, diastolic: 89, oxygen: 96, temperature: 36.8 } },
  { id: "H2", patientId: "HG-1001", timestamp: "2026-09-21T11:00:00Z", type: "labTest", summary: "Sample blood panel recorded.", notes: "Sample note: values filed for review." },
  { id: "H3", patientId: "HG-1001", timestamp: "2026-08-14T15:15:00Z", type: "checkup", summary: "Annual checkup.", notes: "Sample note: no remarks.", vitals: { heartRate: 80, systolic: 134, diastolic: 86, oxygen: 97, temperature: 36.7 } },
  { id: "H4", patientId: "HG-1002", timestamp: "2026-10-05T10:00:00Z", type: "checkup", summary: "General wellness visit.", notes: "Sample note: routine visit.", vitals: { heartRate: 71, systolic: 117, diastolic: 75, oxygen: 98, temperature: 36.6 } },
  { id: "H5", patientId: "HG-1002", timestamp: "2026-07-02T13:20:00Z", type: "labTest", summary: "Sample lipid panel recorded.", notes: "Sample note: filed." },
  { id: "H6", patientId: "HG-1003", timestamp: "2026-10-11T08:45:00Z", type: "followUpVisit", summary: "Follow-up visit scheduled after previous consultation.", notes: "Sample note: next visit in two weeks.", vitals: { heartRate: 77, systolic: 148, diastolic: 93, oxygen: 95, temperature: 37.0 } },
  { id: "H7", patientId: "HG-1003", timestamp: "2026-09-28T16:00:00Z", type: "consultation", summary: "Consultation regarding sample readings.", notes: "Sample note: discussed activity levels." },
  { id: "H8", patientId: "HG-1004", timestamp: "2026-09-30T09:10:00Z", type: "checkup", summary: "Routine checkup.", notes: "Sample note: no remarks.", vitals: { heartRate: 67, systolic: 121, diastolic: 79, oxygen: 98, temperature: 36.7 } },
  { id: "H9", patientId: "HG-1005", timestamp: "2026-10-08T14:30:00Z", type: "consultation", summary: "Consultation about sleep schedule.", notes: "Sample note: patient keeps a sleep diary." },
  { id: "H10", patientId: "HG-1005", timestamp: "2026-09-12T10:40:00Z", type: "labTest", summary: "Sample thyroid panel recorded.", notes: "Sample note: filed for review." },
  { id: "H11", patientId: "HG-1006", timestamp: "2026-09-25T12:00:00Z", type: "checkup", summary: "New patient intake.", notes: "Sample note: no device readings on file." },
];

export const initialReviews: Review[] = [
  { id: "R-201", patientId: "HG-1001", date: "2026-10-11", noteKey: "reviewNote1", status: "pending" },
  { id: "R-202", patientId: "HG-1003", date: "2026-10-11", noteKey: "reviewNote2", status: "pending" },
  { id: "R-203", patientId: "HG-1005", date: "2026-10-09", noteKey: "reviewNote3", status: "pending" },
  { id: "R-204", patientId: "HG-1002", date: "2026-10-06", noteKey: "reviewNote4", status: "completed" },
  { id: "R-205", patientId: "HG-1004", date: "2026-10-01", noteKey: "reviewNote5", status: "completed" },
  { id: "R-206", patientId: "HG-1006", date: "2026-09-26", noteKey: "reviewNote6", status: "pending" },
];

// ---- Data access helpers (swap internals for a backend later) ----
export const getPatient = (id: string) => patients.find((p) => p.id === id);
export const getReadings = (id: string) => vitalReadings.filter((r) => r.patientId === id);
export const getLatestReading = (id: string) => getReadings(id).at(-1);
export const getHistory = (id: string) =>
  historyEntries.filter((h) => h.patientId === id).sort((a, b) => b.timestamp.localeCompare(a.timestamp));
export const latestDataTimestamp = [...vitalReadings.map((r) => r.timestamp), ...historyEntries.map((h) => h.timestamp)]
  .sort()
  .at(-1)!;
export const formatDateTime = (iso: string, locale: string) =>
  new Date(iso).toLocaleString(locale, { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" });
export const formatDate = (iso: string, locale: string) =>
  new Date(iso).toLocaleDateString(locale, { dateStyle: "medium", timeZone: "UTC" });
