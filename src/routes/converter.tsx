import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { bijoyToUnicode, unicodeToBijoy } from "@/lib/bijoy";
import { transliterate, toBnDigits, toEnDigits } from "@/lib/avro";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/converter")({
  head: () => ({
    meta: [
      { title: "বিজয় টু ইউনিকোড কনভার্টার | লিখনটুলস" },
      { name: "description", content: "বিজয় থেকে ইউনিকোড, ইউনিকোড থেকে বিজয়, ফোনেটিক ও সংখ্যা কনভার্টার।" },
      { property: "og:title", content: "বিজয় টু ইউনিকোড কনভার্টার" },
      { property: "og:description", content: "বিজয় ↔ ইউনিকোড সহ বিভিন্ন বাংলা কনভার্টার।" },
    ],
  }),
  component: Converter,
});

const modes = [
  { id: "b2u", label: "বিজয় → ইউনিকোড", fn: bijoyToUnicode, ph: "Avwg evsjvq Mvb MvB" },
  { id: "u2b", label: "ইউনিকোড → বিজয়", fn: unicodeToBijoy, ph: "আমি বাংলায় গান গাই" },
  { id: "ph", label: "ইংরেজি → বাংলা (ফোনেটিক)", fn: transliterate, ph: "ami banglay gan gai" },
  { id: "n2b", label: "123 → ১২৩", fn: toBnDigits, ph: "2026" },
  { id: "b2n", label: "১২৩ → 123", fn: toEnDigits, ph: "২০২৬" },
];

function Converter() {
  const [mode, setMode] = useState(modes[0]!);
  const [input, setInput] = useState("");
  const out = mode.fn(input);
  return (
    <>
      <PageTitle title="বাংলা কনভার্টার" sub="বিজয় (SutonnyMJ) লেখা ইউনিকোডে, বা ইউনিকোড বিজয়ে রূপান্তর করুন।" />
      <div className="mb-4 flex flex-wrap gap-2">
        {modes.map((m) => (
          <button key={m.id} className={m.id === mode.id ? "btn-primary" : "btn"} onClick={() => setMode(m)}>{m.label}</button>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="panel">
          <label className="label">ইনপুট</label>
          <textarea className="field min-h-[300px] text-lg" placeholder={mode.ph} value={input} onChange={(e) => setInput(e.target.value)} />
          <button className="btn mt-2" onClick={() => setInput("")}>মুছুন</button>
        </div>
        <div className="panel">
          <label className="label">আউটপুট</label>
          <textarea readOnly className="field min-h-[300px] text-lg" value={out} />
          <button className="btn-primary mt-2" onClick={() => navigator.clipboard.writeText(out)}>কপি করুন</button>
        </div>
      </div>
    </>
  );
}
