import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { ArrowUpRight, Megaphone } from "lucide-react";
import { PageTitle } from "@/components/SiteHeader";
import { useLanguage } from "@/lib/i18n";

export const Route = createFileRoute("/advertise")({
  head: () => ({
    meta: [
      { title: "বিজ্ঞাপন দিন | লিখনটুলস" },
      { name: "description", content: "লিখনটুলসে IAB standard banner ad placement এবং বিজ্ঞাপন মূল্য দেখুন।" },
    ],
  }),
  component: AdvertisePage,
});

const placements = [
  { id: "leaderboard", width: 728, height: 90, name: "Leaderboard", price: 5000 },
  { id: "medium-rectangle", width: 300, height: 250, name: "Medium Rectangle", price: 4000 },
  { id: "wide-skyscraper", width: 160, height: 600, name: "Wide Skyscraper", price: 4500 },
  { id: "half-page", width: 300, height: 600, name: "Half Page", price: 6500 },
  { id: "billboard", width: 970, height: 250, name: "Billboard", price: 8000 },
  { id: "mobile-banner", width: 320, height: 50, name: "Mobile Banner", price: 1500 },
  { id: "large-mobile-banner", width: 320, height: 100, name: "Large Mobile Banner", price: 2500 },
] as const;

function AdvertisePage() {
  const { language } = useLanguage();
  const en = language === "en";
  const [selected, setSelected] = useState<string | null>(null);
  const subject = encodeURIComponent("Likhon Tools advertising inquiry");
  const message = encodeURIComponent(
    selected ? `I am interested in the ${placements.find((placement) => placement.id === selected)?.name} ad placement.` : "I am interested in advertising on Likhon Tools.",
  );

  return (
    <div className="advertise-page">
      <PageTitle
        title={en ? "Advertise on Likhon Tools" : "লিখনটুলসে বিজ্ঞাপন দিন"}
        sub={en ? "Reach Bangla writers, students and everyday tool users." : "বাংলা লেখক, শিক্ষার্থী ও প্রতিদিনের অনলাইন টুল ব্যবহারকারীদের কাছে পৌঁছান।"}
      />
      <section className="advertise-intro panel">
        <span className="advertise-icon"><Megaphone aria-hidden="true" /></span>
        <div>
          <h2>{en ? "Choose a standard banner size" : "স্ট্যান্ডার্ড ব্যানার সাইজ বেছে নিন"}</h2>
          <p>{en ? "Select an IAB display ad size to see the sample 30-day price." : "IAB display ad size-এ ক্লিক করে নমুনা ৩০ দিনের মূল্য দেখুন।"}</p>
        </div>
      </section>
      <div className="ad-price-note" role="note">
        {en ? "Sample BDT rates for planning only. Final placement, availability and pricing are confirmed by email." : "পরিকল্পনার জন্য নমুনা BDT মূল্য। চূড়ান্ত placement, availability ও মূল্য ইমেইলে নিশ্চিত করা হবে।"}
      </div>
      <section className="ad-size-grid" aria-label={en ? "IAB standard advertising sizes" : "IAB স্ট্যান্ডার্ড বিজ্ঞাপনের সাইজ"}>
        {placements.map((placement) => {
          const isSelected = selected === placement.id;
          return (
            <div key={placement.id} className={`ad-size-option ${isSelected ? "selected" : ""}`}>
              <button
                type="button"
                aria-expanded={isSelected}
                onClick={() => setSelected(isSelected ? null : placement.id)}
                className="ad-size-card"
              >
                <span className="ad-size-dimensions">{placement.width} × {placement.height}</span>
                <span className="ad-size-name">{placement.name}</span>
                <span className="ad-size-standard">{en ? "IAB standard" : "IAB স্ট্যান্ডার্ড"}</span>
              </button>
              {isSelected && (
                <div className="ad-size-price">
                  <strong>৳{placement.price.toLocaleString("en-BD")}</strong>
                  <small>{en ? "per 30 days" : "প্রতি ৩০ দিন"}</small>
                  <a
                    href={`mailto:ads@likhontools.com?subject=${subject}&body=${message}`}
                    className="ad-enquire"
                  >
                    {en ? "Enquire" : "জানতে যোগাযোগ করুন"} <ArrowUpRight size={15} />
                  </a>
                </div>
              )}
            </div>
          );
        })}
      </section>
      <p className="ad-contact">
        {en ? "Need another size or a custom campaign?" : "অন্য কোনো সাইজ বা কাস্টম ক্যাম্পেইন দরকার?"}{" "}
        <a href={`mailto:ads@likhontools.com?subject=${subject}`}>{en ? "Contact our advertising team" : "বিজ্ঞাপন টিমের সঙ্গে যোগাযোগ করুন"}</a>.
      </p>
    </div>
  );
}
