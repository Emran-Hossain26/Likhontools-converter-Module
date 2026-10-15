import { Link, useLocation } from "@tanstack/react-router";
import { PencilLine } from "lucide-react";
import type { MouseEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useLanguage } from "@/lib/i18n";

export function SiteHeader() {
  const pathname = useLocation().pathname;
  const home = pathname === "/";
  const { language, setLanguage } = useLanguage();
  const scrollToSection = (id: string) => (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    document.getElementById(id)?.scrollIntoView({ behavior: "auto", block: "start" });
  };

  return (
    <header className={home ? "home-header" : "border-b bg-card/80 backdrop-blur"}>
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-5 py-5">
        <Link to="/" className="brand-link mr-4 flex items-center gap-2 text-2xl font-semibold">
          <PencilLine className="brand-pen size-8" strokeWidth={2.3} />
          লিখন টুলস
        </Link>
        <div className="ml-auto flex items-center gap-2 sm:order-last">
          <button
            type="button"
            onClick={() => setLanguage(language === "bn" ? "en" : "bn")}
            className="rounded-md border border-input bg-background px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-accent"
            aria-label="Switch language"
          >
            {language === "bn" ? "EN" : "বাংলা"}
          </button>
          <ThemeToggle />
        </div>
        <nav
          aria-label={language === "en" ? "Main menu" : "প্রধান মেনু"}
          className="flex w-full flex-wrap gap-1 sm:w-auto"
        >
          <Link to="/" className={`site-category-link ${home ? "active" : ""}`}>
            {language === "en" ? "Home" : "হোম"}
          </Link>
          <a
            href={home ? "#tools" : "/#tools"}
            onClick={home ? scrollToSection("tools") : undefined}
            className="site-category-link"
          >
            {language === "en" ? "All tools" : "সব টুলস"}
          </a>
          <Link
            to="/contact"
            className={`site-category-link ${pathname === "/contact" ? "active" : ""}`}
          >
            {language === "en" ? "Contact" : "যোগাযোগ"}
          </Link>
          <Link
            to="/advertise"
            className={`site-category-link ${pathname === "/advertise" ? "active" : ""}`}
          >
            {language === "en" ? "Advertise" : "বিজ্ঞাপন"}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PageTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div className="mb-6">
      <h1 className="font-display text-3xl md:text-4xl">{title}</h1>
      <p className="mt-1 text-muted-foreground">{sub}</p>
    </div>
  );
}
