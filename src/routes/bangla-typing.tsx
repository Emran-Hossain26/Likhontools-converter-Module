import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState, type KeyboardEvent } from "react";
import { transliterate, toBnDigits, toEnDigits } from "@/lib/avro";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/bangla-typing")({
  head: () => ({
    meta: [
      { title: "বাংলা টাইপিং ও ওয়ার্ড কাউন্টার | লিখনটুলস" },
      { name: "description", content: "ফোনেটিক বাংলা টাইপিং এডিটর, ওয়ার্ড কাউন্টার ও টেক্সট টুলস — সম্পূর্ণ ফ্রি।" },
      { property: "og:title", content: "বাংলা টাইপিং ও ওয়ার্ড কাউন্টার" },
      { property: "og:description", content: "ফোনেটিক বাংলা টাইপিং এডিটর, ওয়ার্ড কাউন্টার ও টেক্সট টুলস।" },
    ],
  }),
  component: Editor,
});

function Editor() {
  const [text, setText] = useState("");
  const [bangla, setBangla] = useState(true);
  const [find, setFind] = useState("");
  const [rep, setRep] = useState("");
  const [size, setSize] = useState(20);
  const ref = useRef<HTMLTextAreaElement>(null);
  const buf = useRef({ raw: "", start: 0, len: 0 });
  const reset = () => (buf.current = { raw: "", start: 0, len: 0 });

  const apply = (raw: string, el: HTMLTextAreaElement) => {
    const b = buf.current;
    const out = transliterate(raw);
    const v = el.value;
    const next = v.slice(0, b.start) + out + v.slice(b.start + b.len);
    b.raw = raw; b.len = out.length;
    setText(next);
    const pos = b.start + out.length;
    requestAnimationFrame(() => el.setSelectionRange(pos, pos));
  };

  const onKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    const el = e.currentTarget;
    if (e.key === "F9" || (e.ctrlKey && e.key === "m")) { e.preventDefault(); setBangla((x) => !x); reset(); return; }
    if (!bangla || e.ctrlKey || e.metaKey || e.altKey) { reset(); return; }
    if (e.key.length === 1 && /[A-Za-z0-9.^:$,`]/.test(e.key)) {
      e.preventDefault();
      if (!buf.current.raw) {
        const { selectionStart: s, selectionEnd: en } = el;
        if (en > s) el.value = el.value.slice(0, s) + el.value.slice(en);
        buf.current = { raw: "", start: s, len: 0 };
      }
      apply(buf.current.raw + e.key, el);
    } else if (e.key === "Backspace" && buf.current.raw) {
      e.preventDefault();
      apply(buf.current.raw.slice(0, -1), el);
    } else reset();
  };

  const stats = useMemo(() => {
    const t = text.trim();
    const words = t ? t.split(/\s+/).length : 0;
    return {
      words,
      chars: text.length,
      noSpace: text.replace(/\s/g, "").length,
      sentences: t ? t.split(/[।.!?]+/).filter((s) => s.trim()).length : 0,
      paragraphs: t ? t.split(/\n\s*\n/).filter((s) => s.trim()).length : 0,
      read: Math.ceil(words / 200),
    };
  }, [text]);

  const tool = (fn: (s: string) => string) => { reset(); setText(fn(text)); };
  const download = () => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([text], { type: "text/plain;charset=utf-8" }));
    a.download = "bangla-text.txt"; a.click();
  };
  const n = (x: number) => toBnDigits(String(x));

  return (
    <>
      <PageTitle title="বাংলা টাইপিং ও ওয়ার্ড কাউন্টার" sub="ইংরেজি অক্ষরে লিখুন, বাংলা হয়ে যাবে — যেমন: ami banglay gan gai → আমি বাংলায় গান গাই" />
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="panel">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <button className={bangla ? "btn-primary" : "btn"} onClick={() => { setBangla(!bangla); reset(); ref.current?.focus(); }}>
              {bangla ? "বাংলা ✓" : "English"}
            </button>
            <span className="text-xs text-muted-foreground">F9 / Ctrl+M দিয়ে ভাষা বদলান</span>
            <div className="ml-auto flex items-center gap-1">
              <button className="btn" onClick={() => setSize((s) => Math.max(12, s - 2))}>A−</button>
              <button className="btn" onClick={() => setSize((s) => Math.min(40, s + 2))}>A+</button>
            </div>
          </div>
          <textarea ref={ref} value={text} onChange={(e) => { reset(); setText(e.target.value); }} onKeyDown={onKeyDown}
            onClick={reset} onBlur={reset} autoFocus style={{ fontSize: size }}
            className="field min-h-[380px] resize-y leading-relaxed" placeholder="এখানে লেখা শুরু করুন..." />
          <div className="mt-3 flex flex-wrap gap-2">
            <button className="btn" onClick={() => navigator.clipboard.writeText(text)}>কপি</button>
            <button className="btn" onClick={download}>ডাউনলোড .txt</button>
            <button className="btn" onClick={() => tool((s) => s.replace(/[ \t]+/g, " ").replace(/ *\n */g, "\n").trim())}>বাড়তি স্পেস মুছুন</button>
            <button className="btn" onClick={() => tool((s) => s.replace(/\s*\n+\s*/g, " "))}>লাইন ব্রেক মুছুন</button>
            <button className="btn" onClick={() => tool((s) => [...new Set(s.split("\n"))].join("\n"))}>ডুপ্লিকেট লাইন মুছুন</button>
            <button className="btn" onClick={() => tool((s) => s.split("\n").sort((a, b) => a.localeCompare(b, "bn")).join("\n"))}>লাইন সাজান</button>
            <button className="btn" onClick={() => tool(toBnDigits)}>123 → ১২৩</button>
            <button className="btn" onClick={() => tool(toEnDigits)}>১২৩ → 123</button>
            <button className="btn" onClick={() => tool((s) => s.toUpperCase())}>ABC</button>
            <button className="btn" onClick={() => tool((s) => s.toLowerCase())}>abc</button>
            <button className="btn" onClick={() => tool(() => "")}>মুছে ফেলুন</button>
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <input className="field max-w-[180px]" placeholder="খুঁজুন" value={find} onChange={(e) => setFind(e.target.value)} />
            <input className="field max-w-[180px]" placeholder="প্রতিস্থাপন" value={rep} onChange={(e) => setRep(e.target.value)} />
            <button className="btn" disabled={!find} onClick={() => tool((s) => s.split(find).join(rep))}>সব রিপ্লেস</button>
            {find && <span className="text-sm text-muted-foreground">{n(text.split(find).length - 1)} টি পাওয়া গেছে</span>}
          </div>
        </div>
        <aside className="space-y-3">
          <div className="panel grid grid-cols-2 gap-3">
            <div className="stat"><b>{n(stats.words)}</b><span>শব্দ</span></div>
            <div className="stat"><b>{n(stats.chars)}</b><span>অক্ষর</span></div>
            <div className="stat"><b>{n(stats.noSpace)}</b><span>স্পেস ছাড়া</span></div>
            <div className="stat"><b>{n(stats.sentences)}</b><span>বাক্য</span></div>
            <div className="stat"><b>{n(stats.paragraphs)}</b><span>অনুচ্ছেদ</span></div>
            <div className="stat"><b>{n(stats.read)}</b><span>মিনিট পড়া</span></div>
          </div>
          <div className="panel text-sm">
            <h3 className="mb-2 font-semibold">টাইপিং গাইড</h3>
            <ul className="grid grid-cols-2 gap-1 text-muted-foreground">
              {[["kh","খ"],["ch","ছ"],["T","ট"],["D","ড"],["sh","শ"],["Sh","ষ"],["R","ড়"],["y","য়"],["ng","ং"],["^","ঁ"],["rri","ঋ"],["O","ো"],["kkh","ক্ষ"],[",,","্"],[".","।"],["t``","ৎ"]].map(([a,b]) => (
                <li key={a}><code className="rounded bg-muted px-1">{a}</code> → {b}</li>
              ))}
            </ul>
          </div>
        </aside>
      </div>
    </>
  );
}
