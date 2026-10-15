import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/image-resizer")({
  head: () => ({
    meta: [
      { title: "ইমেজ রিসাইজার ও কম্প্রেসর | লিখনটুলস" },
      { name: "description", content: "ছবির সাইজ (px) পরিবর্তন ও KB কমান — JPG, PNG, WEBP।" },
      { property: "og:title", content: "ইমেজ রিসাইজার ও কম্প্রেসর" },
      { property: "og:description", content: "ব্রাউজারেই ছবি রিসাইজ ও কম্প্রেস করুন।" },
    ],
  }),
  component: Resizer,
});

const kb = (n: number) => (n / 1024).toFixed(1) + " KB";

function Resizer() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [orig, setOrig] = useState(0);
  const [w, setW] = useState(0);
  const [h, setH] = useState(0);
  const [lock, setLock] = useState(true);
  const [q, setQ] = useState(80);
  const [fmt, setFmt] = useState("image/jpeg");
  const [out, setOut] = useState<{ url: string; size: number } | null>(null);

  const onFile = (f?: File) => {
    if (!f) return;
    setOrig(f.size);
    const i = new Image();
    i.onload = () => { setImg(i); setW(i.width); setH(i.height); };
    i.src = URL.createObjectURL(f);
  };

  useEffect(() => {
    if (!img || !w || !h) return;
    const c = document.createElement("canvas");
    c.width = w; c.height = h;
    const ctx = c.getContext("2d")!;
    if (fmt === "image/jpeg") { ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, w, h); }
    ctx.drawImage(img, 0, 0, w, h);
    c.toBlob((b) => b && setOut((o) => { if (o) URL.revokeObjectURL(o.url); return { url: URL.createObjectURL(b), size: b.size }; }), fmt, q / 100);
  }, [img, w, h, q, fmt]);

  const ratio = img ? img.height / img.width : 1;
  return (
    <>
      <PageTitle title="ইমেজ রিসাইজার ও কম্প্রেসর" sub="ছবির মাপ ও ফাইল সাইজ কমান — সব কিছু আপনার ডিভাইসেই হয়।" />
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="panel space-y-4">
          <input type="file" accept="image/*" className="field" onChange={(e) => onFile(e.target.files?.[0])} />
          {img && <>
            <div className="grid grid-cols-2 gap-2">
              <div><label className="label">প্রস্থ (px)</label>
                <input type="number" className="field" value={w} onChange={(e) => { const v = +e.target.value; setW(v); if (lock) setH(Math.round(v * ratio)); }} /></div>
              <div><label className="label">উচ্চতা (px)</label>
                <input type="number" className="field" value={h} onChange={(e) => { const v = +e.target.value; setH(v); if (lock) setW(Math.round(v / ratio)); }} /></div>
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={lock} onChange={(e) => setLock(e.target.checked)} /> অনুপাত ঠিক রাখুন</label>
            <div className="flex flex-wrap gap-1">
              {[25, 50, 75, 100].map((p) => <button key={p} className="btn" onClick={() => { setW(Math.round(img.width * p / 100)); setH(Math.round(img.height * p / 100)); }}>{p}%</button>)}
            </div>
            <div><label className="label">ফরম্যাট</label>
              <select className="field" value={fmt} onChange={(e) => setFmt(e.target.value)}>
                <option value="image/jpeg">JPG</option><option value="image/webp">WEBP</option><option value="image/png">PNG</option>
              </select></div>
            {fmt !== "image/png" && <div><label className="label">কোয়ালিটি: {q}%</label>
              <input type="range" min={10} max={100} value={q} onChange={(e) => setQ(+e.target.value)} className="w-full accent-primary" /></div>}
          </>}
        </div>
        <div className="panel">
          {out ? <>
            <div className="mb-3 grid grid-cols-3 gap-3">
              <div className="stat"><b>{kb(orig)}</b><span>আগে</span></div>
              <div className="stat"><b>{kb(out.size)}</b><span>এখন</span></div>
              <div className="stat"><b>{Math.max(0, Math.round((1 - out.size / orig) * 100))}%</b><span>কমেছে</span></div>
            </div>
            <img src={out.url} alt="প্রিভিউ" className="max-h-[480px] w-full rounded-lg bg-muted object-contain" />
            <a className="btn-primary mt-3" href={out.url} download={`resized.${(fmt.split("/")[1] ?? "jpg").replace("jpeg", "jpg")}`}>ডাউনলোড করুন</a>
          </> : <p className="py-24 text-center text-muted-foreground">একটি ছবি নির্বাচন করুন</p>}
        </div>
      </div>
    </>
  );
}
