import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { GRADES, cgpa } from "@/lib/calc";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/cgpa-calculator")({
  head: () => ({
    meta: [
      { title: "CGPA ক্যালকুলেটর | লিখনটুলস" },
      { name: "description", content: "ক্রেডিট ও গ্রেড দিয়ে বিশ্ববিদ্যালয়ের CGPA হিসাব করুন (UGC স্কেল)।" },
      { property: "og:title", content: "CGPA ক্যালকুলেটর" },
      { property: "og:description", content: "UGC গ্রেডিং স্কেলে সহজ CGPA হিসাব।" },
    ],
  }),
  component: Cgpa,
});

type Row = { name: string; credit: number; grade: string };
const blank = (): Row => ({ name: "", credit: 3, grade: "A+" });

function Cgpa() {
  const [rows, setRows] = useState<Row[]>([blank(), blank(), blank(), blank()]);
  const pt = (g: string) => GRADES.find((x) => x.g === g)!.p;
  const result = cgpa(rows.map((r) => ({ credit: r.credit, point: pt(r.grade) })));
  const credits = rows.reduce((s, r) => s + (r.credit || 0), 0);
  const upd = (i: number, p: Partial<Row>) => setRows(rows.map((r, j) => (j === i ? { ...r, ...p } : r)));
  return (
    <>
      <PageTitle title="CGPA ক্যালকুলেটর" sub="প্রতিটি কোর্সের ক্রেডিট ও গ্রেড দিন।" />
      <div className="grid gap-6 md:grid-cols-[1fr_280px]">
        <div className="panel space-y-2">
          <div className="grid grid-cols-[1fr_90px_110px_40px] gap-2 text-xs text-muted-foreground"><span>কোর্স</span><span>ক্রেডিট</span><span>গ্রেড</span><span /></div>
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-[1fr_90px_110px_40px] gap-2">
              <input className="field" placeholder={`কোর্স ${i + 1}`} value={r.name} onChange={(e) => upd(i, { name: e.target.value })} />
              <input type="number" step={0.5} min={0} className="field" value={r.credit} onChange={(e) => upd(i, { credit: +e.target.value })} />
              <select className="field" value={r.grade} onChange={(e) => upd(i, { grade: e.target.value })}>
                {GRADES.map((g) => <option key={g.g} value={g.g}>{g.g} ({g.p.toFixed(2)})</option>)}
              </select>
              <button className="btn" aria-label="মুছুন" onClick={() => setRows(rows.filter((_, j) => j !== i))}>✕</button>
            </div>
          ))}
          <button className="btn" onClick={() => setRows([...rows, blank()])}>+ কোর্স যোগ করুন</button>
        </div>
        <aside className="space-y-3">
          <div className="panel text-center">
            <p className="text-sm text-muted-foreground">আপনার CGPA</p>
            <p className="text-5xl font-bold text-primary">{result.toFixed(2)}</p>
            <p className="mt-1 text-sm text-muted-foreground">মোট ক্রেডিট: {credits}</p>
          </div>
          <div className="panel text-sm">
            <h3 className="mb-2 font-semibold">গ্রেডিং স্কেল (UGC)</h3>
            <table className="w-full"><tbody>
              {GRADES.map((g) => <tr key={g.g} className="border-t"><td className="py-1">{g.range}%</td><td>{g.g}</td><td className="text-right">{g.p.toFixed(2)}</td></tr>)}
            </tbody></table>
          </div>
        </aside>
      </div>
    </>
  );
}
