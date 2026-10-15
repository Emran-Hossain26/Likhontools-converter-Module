import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageTitle } from "@/components/SiteHeader";

export const Route = createFileRoute("/passport-photo")({
  head: () => ({
    meta: [
      { title: "পাসপোর্ট সাইজ ছবি মেকার | লিখনটুলস" },
      { name: "description", content: "পাসপোর্ট, ভিসা ও স্ট্যাম্প সাইজ ছবি বানান এবং প্রিন্টের জন্য ৪×৬ শিট ডাউনলোড করুন।" },
      { property: "og:title", content: "পাসপোর্ট সাইজ ছবি মেকার" },
      { property: "og:description", content: "সহজে পাসপোর্ট সাইজ ছবি ও প্রিন্ট শিট তৈরি করুন।" },
    ],
  }),
  component: Passport,
});

const sizes = [
  { n: "বাংলাদেশ পাসপোর্ট (45×55mm)", w: 45, h: 55 },
  { n: "স্ট্যান্ডার্ড পাসপোর্ট (35×45mm)", w: 35, h: 45 },
  { n: "US ভিসা (2×2 inch)", w: 51, h: 51 },
  { n: "স্ট্যাম্প সাইজ (20×25mm)", w: 20, h: 25 },
];
const px = (mm: number) => Math.round((mm / 25.4) * 300);

function Passport() {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [size, setSize] = useState(sizes[0]!);
  const [zoom, setZoom] = useState(1);
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [bg, setBg] = useState("#ffffff");
  const [copies, setCopies] = useState(8);
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const W = px(size.w), H = px(size.h);
    c.width = W; c.height = H;
    const ctx = c.getContext("2d")!;
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    if (!img) return;
    const s = Math.max(W / img.width, H / img.height) * zoom;
    const dw = img.width * s, dh = img.height * s;
    ctx.drawImage(img, (W - dw) / 2 + (x / 100) * W, (H - dh) / 2 + (y / 100) * H, dw, dh);
  }, [img, size, zoom, x, y, bg]);

  const save = (canvas: HTMLCanvasElement, name: string) => {
    const a = document.createElement("a"); a.href = canvas.toDataURL("image/jpeg", 0.95); a.download = name; a.click();
  };
  const sheet = () => {
    const src = ref.current!; const S = document.createElement("canvas");
    S.width = 1800; S.height = 1200;
    const ctx = S.getContext("2d")!; ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, 1800, 1200);
    const gap = 30, cols = Math.floor((1800 - gap) / (src.width + gap)), rows = Math.floor((1200 - gap) / (src.height + gap));
    let k = 0;
    for (let r = 0; r < rows; r++) for (let col = 0; col < cols; col++) {
      if (k++ >= copies) continue;
      const dx = gap + col * (src.width + gap), dy = gap + r * (src.height + gap);
      ctx.drawImage(src, dx, dy); ctx.strokeStyle = "#ccc"; ctx.strokeRect(dx, dy, src.width, src.height);
    }
    save(S, "passport-sheet-4x6.jpg");
  };

  return (
    <>
      <PageTitle title="পাসপোর্ট সাইজ ছবি মেকার" sub="ছবি দিন, ঠিকমতো বসান, তারপর একক ছবি বা প্রিন্ট শিট ডাউনলোড করুন (৩০০ DPI)।" />
      <div className="grid gap-6 md:grid-cols-[320px_1fr]">
        <div className="panel space-y-4">
          <input type="file" accept="image/*" className="field" onChange={(e) => {
            const f = e.target.files?.[0]; if (!f) return;
            const i = new Image(); i.onload = () => setImg(i); i.src = URL.createObjectURL(f);
          }} />
          <div><label className="label">সাইজ</label>
            <select className="field" value={size.n} onChange={(e) => setSize(sizes.find((s) => s.n === e.target.value)!)}>
              {sizes.map((s) => <option key={s.n}>{s.n}</option>)}
            </select></div>
          <div><label className="label">জুম</label><input type="range" min={1} max={3} step={0.01} value={zoom} onChange={(e) => setZoom(+e.target.value)} className="w-full accent-primary" /></div>
          <div><label className="label">ডানে/বামে</label><input type="range" min={-50} max={50} value={x} onChange={(e) => setX(+e.target.value)} className="w-full accent-primary" /></div>
          <div><label className="label">উপরে/নিচে</label><input type="range" min={-50} max={50} value={y} onChange={(e) => setY(+e.target.value)} className="w-full accent-primary" /></div>
          <div className="flex items-center gap-2"><span className="text-sm font-medium">ব্যাকগ্রাউন্ড</span>
            {["#ffffff", "#dbeafe", "#e5e7eb"].map((c) => (
              <button key={c} aria-label={c} onClick={() => setBg(c)} className={`h-7 w-7 rounded-full border-2 ${bg === c ? "border-primary" : ""}`} style={{ background: c }} />
            ))}</div>
          <div><label className="label">শিটে কপি সংখ্যা</label><input type="number" min={1} max={30} className="field" value={copies} onChange={(e) => setCopies(+e.target.value)} /></div>
        </div>
        <div className="panel flex flex-col items-center">
          <canvas ref={ref} className="max-h-[440px] w-auto max-w-full rounded border shadow" />
          {!img && <p className="mt-3 text-muted-foreground">একটি ছবি নির্বাচন করুন</p>}
          <div className="mt-4 flex gap-2">
            <button className="btn-primary" disabled={!img} onClick={() => save(ref.current!, "passport-photo.jpg")}>ছবি ডাউনলোড</button>
            <button className="btn" disabled={!img} onClick={sheet}>৪×৬ প্রিন্ট শিট</button>
          </div>
        </div>
      </div>
    </>
  );
}
