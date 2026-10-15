import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, type MouseEvent } from "react";
import {
  ArrowRight,
  ArrowDown,
  LayoutGrid,
  FileText,
  Images,
  Calculator,
  RefreshCw,
  Sparkles,
  Keyboard,
  Image,
  ImageDown,
  Contact,
  CalendarDays,
  GraduationCap,
  ShieldCheck,
  LockKeyhole,
  Zap,
  Gift,
  MonitorSmartphone,
  MousePointer2,
  FileInput,
  Settings,
  CircleCheck,
  Send,
  PencilLine,
  Play,
  Facebook,
  Linkedin,
  Mail,
  Globe,
  Youtube,
  File,
  Files,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import laptop from "@/assets/home-laptop.jpg";
import { useLanguage } from "@/lib/i18n";
import { supabase, type SiteSocialLink } from "@/lib/supabase";
import { fetchModuleRegistry, type ModuleManifest } from "@/lib/modules/registry";
import { builtinTools, DOCUMENT_TONES } from "@/lib/modules/builtin";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "লিখন টুলস — বাংলা লেখা, ছবি ও ক্যালকুলেটর" },
      {
        name: "description",
        content:
          "বাংলা টাইপিং, বিজয়-ইউনিকোড কনভার্টার, ছবি রিসাইজ, পাসপোর্ট ছবি এবং বয়স ও CGPA ক্যালকুলেটর — এক জায়গায়।",
      },
      { property: "og:title", content: "লিখন টুলস — সব অনলাইন টুল এক জায়গায়" },
      {
        property: "og:description",
        content: "বাংলা লেখা, রূপান্তর, ছবি ও হিসাবের জন্য আপনার প্রতিদিনের সঙ্গী।",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

type DisplayTool = {
  title: { bn: string; en: string };
  description: { bn: string; en: string };
  to: string;
  category: string;
  icon: LucideIcon;
  tone: string;
};

const iconMap: Record<string, LucideIcon> = {
  Keyboard,
  RefreshCw,
  Image,
  ImageDown,
  Contact,
  CalendarDays,
  GraduationCap,
  File,
};

const categories: { id: string; label: { bn: string; en: string }; icon: LucideIcon }[] = [
  { id: "all", label: { bn: "সব টুলস", en: "All Tools" }, icon: LayoutGrid },
  { id: "text", label: { bn: "টেক্সট টুলস", en: "Text Tools" }, icon: FileText },
  { id: "image", label: { bn: "ইমেজ টুলস", en: "Image Tools" }, icon: Images },
  { id: "calculator", label: { bn: "ক্যালকুলেটর", en: "Calculators" }, icon: Calculator },
  { id: "converter", label: { bn: "কনভার্টার", en: "Converters" }, icon: RefreshCw },
];
const benefits = [
  {
    icon: Zap,
    title: { bn: "দ্রুত ও সহজ", en: "Fast & Simple" },
    text: { bn: "অপেক্ষা নয়, সঙ্গে সঙ্গে ফলাফল", en: "No waiting, instant results" },
  },
  {
    icon: ShieldCheck,
    title: { bn: "সম্পূর্ণ নিরাপদ", en: "Fully Secure" },
    text: { bn: "আপনার তথ্য আপনার ডিভাইসেই", en: "Your data stays on your device" },
  },
  {
    icon: MonitorSmartphone,
    title: { bn: "ইনস্টল লাগে না", en: "No installation" },
    text: { bn: "মোবাইল কিংবা কম্পিউটার", en: "Works on mobile or desktop" },
  },
  {
    icon: Gift,
    title: { bn: "সবসময় ফ্রি", en: "Always Free" },
    text: { bn: "কোনো খরচ বা সাইন-আপ নেই", en: "No fee or signup required" },
  },
];

const socialIconMap: Record<string, LucideIcon> = {
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  email: Mail,
  website: Globe,
};

function Home() {
  const { language } = useLanguage();
  const [category, setCategory] = useState("all");
  const [socialLinks, setSocialLinks] = useState<SiteSocialLink[]>([]);
  const [displayTools, setDisplayTools] = useState<DisplayTool[]>([]);

  useEffect(() => {
    if (!supabase) return;

    let active = true;
    void supabase
      .from("site_social_links")
      .select("*")
      .eq("is_active", true)
      .order("order_index", { ascending: true })
      .then(({ data, error }) => {
        if (!active || error) return;
        setSocialLinks((data ?? []).filter(Boolean));
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    void fetchModuleRegistry().then((registry) => {
      if (!active) return;

      const tools: DisplayTool[] = builtinTools.map((tool) => ({
        title: tool.title,
        description: tool.description,
        to: tool.to,
        category: tool.category,
        icon: iconMap[tool.icon] || File,
        tone: tool.tone,
      }));

      const toneIndex = { current: 0 };
      const getNextTone = () => {
        const tone = DOCUMENT_TONES[toneIndex.current % DOCUMENT_TONES.length];
        toneIndex.current++;
        return tone;
      };

      for (const module of registry.modules) {
        tools.push({
          title: module.name,
          description: module.description,
          to: `/tool/${module.slug}`,
          category: module.category,
          icon: iconMap[module.icon] || File,
          tone: getNextTone(),
        });
      }

      setDisplayTools(tools);
    });

    return () => {
      active = false;
    };
  }, []);

  const scrollToSection = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  };
  const t = {
    eyebrow: language === "en" ? "Your daily online tools" : "আপনার প্রতিদিনের অনলাইন টুলস",
    cta: language === "en" ? "Explore all tools" : "সব টুল দেখুন",
    secondary: language === "en" ? "How it works" : "যেভাবে কাজ করে",
    trust: [
      {
        title: { bn: "দ্রুত ও নিরাপদ", en: "Fast & Secure" },
        text: { bn: "১০০% ব্রাউজারেই চলে", en: "Runs 100% in browser" },
      },
      {
        title: { bn: "গোপনীয়তা আগে", en: "Privacy first" },
        text: { bn: "কোনো তথ্য সংরক্ষণ হয় না", en: "No data is stored" },
      },
      {
        title: { bn: "ব্যবহার সহজ", en: "Easy to use" },
        text: { bn: "সহজ ও স্বাচ্ছন্দ্যময়", en: "Simple and comfortable" },
      },
      {
        title: { bn: "সবসময় ফ্রি", en: "Always free" },
        text: { bn: "অ্যাকাউন্টের প্রয়োজন নেই", en: "No account required" },
      },
    ],
    why: {
      heading: language === "en" ? "Why choose Likhon Tools?" : "কেন বেছে নেবেন\nলিখন টুলস?",
      sub:
        language === "en"
          ? "Everyday work should be simpler, faster and more polished."
          : "প্রতিদিনের কাজ হোক আরও\nসহজ, দ্রুত ও সুন্দর।",
    },
    steps: [
      {
        title: { bn: "টুল বেছে নিন", en: "Choose a tool" },
        text: { bn: "আপনার প্রয়োজনের টুলটি খুলুন।", en: "Open the tool you need." },
        icon: MousePointer2,
      },
      {
        title: { bn: "তথ্য দিন", en: "Add your details" },
        text: {
          bn: "লেখা, ছবি বা প্রয়োজনীয় তথ্য দিন।",
          en: "Enter text, image or required data.",
        },
        icon: FileInput,
      },
      {
        title: { bn: "কাজ হবে মুহূর্তেই", en: "It works instantly" },
        text: { bn: "আপনার ডিভাইসেই সব কাজ হয়।", en: "Everything runs on your device." },
        icon: Settings,
      },
      {
        title: { bn: "ফলাফল পেয়ে যান", en: "Get the result" },
        text: {
          bn: "ফলাফল দেখুন, কপি বা ডাউনলোড করুন।",
          en: "Review, copy or download the result.",
        },
        icon: CircleCheck,
      },
    ],
    banner: {
      title:
        language === "en"
          ? "Your daily companion for Bangla writers and students"
          : "বাংলা লেখক ও শিক্ষার্থীদের\nপ্রতিদিনের সঙ্গী",
      text:
        language === "en"
          ? "From writing and image work to calculations and conversion — all the tools you need are right at hand."
          : "লেখা থেকে ছবি, হিসাব থেকে রূপান্তর —\nআপনার দরকারি সব টুল হাতের কাছেই।",
      action: language === "en" ? "Get started now" : "শুরু করুন এখনই",
    },
    footer: {
      home: language === "en" ? "Home" : "হোম",
      allTools: language === "en" ? "All tools" : "সব টুলস",
      about: language === "en" ? "About Likhon Tools" : "লিখন টুলস সম্পর্কে",
      help: language === "en" ? "Help" : "সহায়তা",
      info: language === "en" ? "Your data stays safe" : "আপনার তথ্য নিরাপদ",
      note:
        language === "en"
          ? "Everything runs in your browser — no file upload is required."
          : "সব কাজ আপনার ব্রাউজারেই হয়।\nকোনো ফাইল আপলোড হয় না।",
      copyright:
        language === "en"
          ? "© 2026 Likhon Tools. All rights reserved."
          : "© ২০২৬ লিখন টুলস। সর্বস্বত্ব সংরক্ষিত।",
      links: language === "en" ? "Useful links" : "দরকারি লিংক",
      story: language === "en" ? "About us" : "আমাদের কথা",
      contact: language === "en" ? "Contact" : "যোগাযোগ",
      terms: language === "en" ? "Terms" : "শর্তাবলি",
      privacy: language === "en" ? "Privacy" : "গোপনীয়তা",
      ads: language === "en" ? "Advertise with us" : "বিজ্ঞাপন",
      adEmail: "ads@likhontools.com",
    },
  };

  return (
    <>
      <section className="home-hero">
        <img
          className="home-hero-image"
          src={laptop}
          width={1536}
          height={864}
          alt={
            language === "en"
              ? "Bangla editor and tools on laptop"
              : "ল্যাপটপে বাংলা টেক্সট এডিটর ও কলম"
          }
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
        <div className="home-container hero-content">
          <span className="hero-eyebrow">
            <Sparkles size={14} /> {t.eyebrow}
          </span>
          <h1>
            {language === "en" ? (
              <>
                Likhon Tools
                <span>
                  Write. Convert.
                  <br />
                  Calculate. Create.
                </span>
                <em>All in one place.</em>
              </>
            ) : (
              <>
                লিখন টুলস
                <span>
                  লিখুন। বদলান।
                  <br />
                  হিসাব করুন। তৈরি করুন।
                </span>
                <em>সব এক জায়গায়।</em>
              </>
            )}
          </h1>
          {language === "en" ? (
            <p>Simple and useful online tools for Bangla writers, students and everyday work.</p>
          ) : (
            <p>
              বাংলা লেখক, শিক্ষার্থী ও আপনার প্রতিদিনের
              <span className="hidden sm:inline"> </span>
              <span className="block sm:inline">কাজের জন্য সহজ, দরকারি সব অনলাইন টুল।</span>
            </p>
          )}
          <div className="hero-actions">
            <Button asChild className="home-cta">
              <a href="#tools" onClick={scrollToSection("tools")}>
                {t.cta} <ArrowRight />
              </a>
            </Button>
            <Button asChild variant="outline" className="home-outline">
              <a href="#how" onClick={scrollToSection("how")}>
                {t.secondary} <Play />
              </a>
            </Button>
          </div>
        </div>
      </section>
      <div className="home-container">
        <div className="trust-row">
          {t.trust.map(({ title, text }) => (
            <div key={title.bn}>
              <ShieldCheck />
              <p>
                <strong>{title[language]}</strong>
                <span>{text[language]}</span>
              </p>
            </div>
          ))}
        </div>
        <section id="tools" className="tools-section">
          <div
            className="category-bar"
            role="group"
            aria-label={language === "en" ? "Tool categories" : "টুলের বিভাগ"}
          >
            {categories.map(({ id, label, icon: Icon }) => (
              <Button
                key={id}
                variant="ghost"
                aria-pressed={category === id}
                className={`category-button ${category === id ? "selected" : ""}`}
                onClick={() => setCategory(id)}
              >
                <Icon />
                <span>{label[language]}</span>
              </Button>
            ))}
          </div>
          <h2 className="home-section-title">
            {category === "all"
              ? language === "en"
                ? "Popular tools"
                : "জনপ্রিয় টুলস"
              : categories.find((c) => c.id === category)?.label[language]}
          </h2>
          <div className="tool-grid">
            {displayTools
              .filter((t) => category === "all" || t.category === category)
              .map(({ title, description, to, icon: Icon, tone }) => (
                <Link key={title.bn} to={to} className={`tool-tile tile-${tone}`}>
                  <div className="tool-art">
                    {tone === "mint" || tone === "yellow" ? (
                      <div className="letter-convert">
                        <span>অ</span>
                        <RefreshCw />
                        <span>আ</span>
                      </div>
                    ) : tone === "sky" && title.bn === "ফাইল কনভার্টার" ? (
                      <div className="file-convert">
                        <Files strokeWidth={1.65} />
                        <RefreshCw size={20} />
                        <Files strokeWidth={1.65} />
                      </div>
                    ) : (
                      <Icon strokeWidth={1.65} />
                    )}
                  </div>
                  <h3>{title[language]}</h3>
                  <p>{description[language]}</p>
                  <ArrowRight className="tile-arrow" size={19} />
                </Link>
              ))}
          </div>
          {category !== "all" && (
            <div className="all-tools-action">
              <Button className="home-cta" onClick={() => setCategory("all")}>
                <LayoutGrid /> {language === "en" ? "View all tools" : "সব টুল দেখুন"}
              </Button>
            </div>
          )}
        </section>
        <section id="why" className="why-section">
          <div>
            <h2>
              {language === "en" ? "Why choose\nLikhon Tools?" : "কেন বেছে নেবেন\nলিখন টুলস?"}
            </h2>
            <span className="small-rule" />
            <p>
              {language === "en"
                ? "Everyday work should be simpler, faster and more polished."
                : "প্রতিদিনের কাজ হোক আরও\nসহজ, দ্রুত ও সুন্দর।"}
            </p>
          </div>
          {benefits.map(({ icon: Icon, title, text }) => (
            <div className="benefit" key={title.bn}>
              <span>
                <Icon />
              </span>
              <h3>{title[language]}</h3>
              <p>{text[language]}</p>
            </div>
          ))}
        </section>
        <section id="how" className="how-section">
          <h2 className="home-section-title">
            {language === "en" ? "How it works" : "যেভাবে কাজ করে"}
          </h2>
          <div className="steps-grid">
            {t.steps.map(({ title, text, icon: Icon }, i) => {
              return (
                <div className="step" key={title.bn}>
                  <span className="step-number">{["১", "২", "৩", "৪"][i]}</span>
                  <div className="step-art">
                    <Icon />
                  </div>
                  <h3>{title[language]}</h3>
                  <p>{text[language]}</p>
                  {i < 3 && <ArrowRight className="step-arrow" />}
                </div>
              );
            })}
          </div>
        </section>
        <section className="closing-banner">
          <div>
            <h2>{t.banner.title}</h2>
            <p>{t.banner.text}</p>
            <Button asChild className="home-cta">
              <a href="#tools">
                {t.banner.action} <ArrowRight />
              </a>
            </Button>
          </div>
          <Send className="paper-plane" strokeWidth={1} />
        </section>
        <footer className="home-footer">
          <div>
            <Link to="/" className="footer-brand">
              <PencilLine />
              লিখন টুলস
            </Link>
            {socialLinks.length > 0 && (
              <div
                className="footer-social"
                aria-label={language === "en" ? "Social links" : "সোশ্যাল লিংক"}
              >
                {socialLinks.map((link) => {
                  const Icon = socialIconMap[link.icon_key] ?? Globe;
                  const safeHref = link.url.trim();
                  if (!safeHref) return null;
                  return (
                    <a
                      key={link.id}
                      href={safeHref}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={link.label}
                      title={link.label}
                    >
                      <Icon size={16} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>
          <div>
            <h3>{t.footer.links}</h3>
            <Link to="/">{t.footer.home}</Link>
            <a href="#tools" onClick={scrollToSection("tools")}>
              {t.footer.allTools}
            </a>
            <a href="#why" onClick={scrollToSection("why")}>
              {t.footer.about}
            </a>
          </div>
          <div>
            <h3>{t.footer.story}</h3>
            <a href="/#how">{t.footer.help}</a>
            <Link to="/contact">{t.footer.contact}</Link>
            <Link to="/advertise">{t.footer.ads}</Link>
          </div>
          <div>
            <h3>{t.footer.info}</h3>
            <p>{t.footer.note}</p>
            <a href="mailto:it.agamirsomoy2@gmail.com">it.agamirsomoy2@gmail.com</a>
            <a href="mailto:ads@likhontools.com">{t.footer.adEmail}</a>
            <ShieldCheck size={24} />
          </div>
          <p className="footer-copyright">{t.footer.copyright}</p>
        </footer>
      </div>
    </>
  );
}
