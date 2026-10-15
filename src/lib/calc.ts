export const GRADES: { g: string; p: number; range: string }[] = [
  { g: "A+", p: 4.0, range: "80-100" }, { g: "A", p: 3.75, range: "75-79" }, { g: "A-", p: 3.5, range: "70-74" },
  { g: "B+", p: 3.25, range: "65-69" }, { g: "B", p: 3.0, range: "60-64" }, { g: "B-", p: 2.75, range: "55-59" },
  { g: "C+", p: 2.5, range: "50-54" }, { g: "C", p: 2.25, range: "45-49" }, { g: "D", p: 2.0, range: "40-44" },
  { g: "F", p: 0, range: "0-39" },
];

export function cgpa(rows: { credit: number; point: number }[]): number {
  const valid = rows.filter((r) => r.credit > 0);
  const cr = valid.reduce((s, r) => s + r.credit, 0);
  if (!cr) return 0;
  return Math.round((valid.reduce((s, r) => s + r.credit * r.point, 0) / cr) * 100) / 100;
}

export function ageBetween(from: Date, to: Date) {
  let y = to.getFullYear() - from.getFullYear();
  let m = to.getMonth() - from.getMonth();
  let d = to.getDate() - from.getDate();
  if (d < 0) { m--; d += new Date(from.getFullYear(), from.getMonth() + 1, 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  const totalDays = Math.round((Date.UTC(to.getFullYear(), to.getMonth(), to.getDate()) - Date.UTC(from.getFullYear(), from.getMonth(), from.getDate())) / 86400000);
  return { years: y, months: m, days: d, totalDays };
}

export const parseDate = (s: string) => { const [y = 2000, m = 1, d = 1] = s.split("-").map(Number); return new Date(y, m - 1, d); };
