import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ageBetween, parseDate } from "@/lib/calc";
import { toBnDigits } from "@/lib/avro";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/age-calculator")({
  head: () => ({
    meta: [
      { title: "বয়স ক্যালকুলেটর | লিখনটুলস" },
      { name: "description", content: "জন্মতারিখ দিয়ে সঠিক বয়স বছর, মাস ও দিনে বের করুন।" },
      { property: "og:title", content: "বয়স ক্যালকুলেটর" },
      { property: "og:description", content: "জন্মতারিখ থেকে বয়স ও পরবর্তী জন্মদিন জানুন।" },
    ],
  }),
  component: Age,
});

function Age() {
  const [dob, setDob] = useState("2000-01-01");
  const [asOf, setAsOf] = useState("2026-01-01");
  useEffect(() => { const d = new Date(); setAsOf(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`); }, []);
  const ok = !!dob && !!asOf;
  const from = ok ? parseDate(dob) : new Date(), to = ok ? parseDate(asOf) : new Date();
  const a = ok && from <= to ? ageBetween(from, to) : null;
  let next = new Date(to.getFullYear(), from.getMonth(), from.getDate());
  if (next < to) next = new Date(to.getFullYear() + 1, from.getMonth(), from.getDate());
  const untilNext = Math.round((next.getTime() - to.getTime()) / 86400000);
  const b = (n: number) => toBnDigits(String(n));
  return (
    <>
      <PageTitle title="বয়স ক্যালকুলেটর" sub="জন্মতারিখ দিন — সঠিক বয়স জেনে নিন।" />
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="panel space-y-4">
          <div><label className="label">জন্মতারিখ</label><input type="date" className="field" value={dob} onChange={(e) => setDob(e.target.value)} /></div>
          <div><label className="label">যে তারিখ পর্যন্ত</label><input type="date" className="field" value={asOf} onChange={(e) => setAsOf(e.target.value)} /></div>
        </div>
        <div className="panel">
          {a ? <>
            <p className="mb-4 text-center font-display text-3xl">{b(a.years)} বছর {b(a.months)} মাস {b(a.days)} দিন</p>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="stat"><b>{b(a.years * 12 + a.months)}</b><span>মোট মাস</span></div>
              <div className="stat"><b>{b(Math.floor(a.totalDays / 7))}</b><span>মোট সপ্তাহ</span></div>
              <div className="stat"><b>{b(a.totalDays)}</b><span>মোট দিন</span></div>
              <div className="stat"><b>{b(untilNext)}</b><span>পরবর্তী জন্মদিন বাকি (দিন)</span></div>
            </div>
          </> : <p className="text-destructive">সঠিক তারিখ দিন।</p>}
        </div>
      </div>
    </>
  );
}
