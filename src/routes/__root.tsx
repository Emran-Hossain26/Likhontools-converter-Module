import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
  useLocation,
  type ErrorComponentProps,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { SiteHeader } from "@/components/SiteHeader";
import { LanguageContext, LANGUAGE_STORAGE_KEY, getStoredLanguage, type Language } from "@/lib/i18n";

const siteUrl = "https://www.likhontools.com";
const siteName = "লিখনটুলস";
const siteDescription = "বাংলা টাইপিং, বিজয়-ইউনিকোড কনভার্টার, ছবি রিসাইজ, পাসপোর্ট সাইজ ছবি, বয়স ক্যালকুলেটর ও CGPA ক্যালকুলেটর — এক জায়গায়।";
const siteKeywords = "বাংলা টাইপিং, বাংলা টুলস, বিজয় ইউনিকোড, ইউনিকোড কনভার্টার, ইমেজ রিসাইজার, পাসপোর্ট ছবি, বয়স ক্যালকুলেটর, CGPA ক্যালকুলেটর, বাংলা লেখার টুল";
const googleSiteVerification = "YOUR_GOOGLE_SITE_VERIFICATION_CODE";
const gaMeasurementId = "G-J9F05SW978";
const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebSite",
      name: siteName,
      url: siteUrl,
      description: siteDescription,
      inLanguage: "bn-BD",
      potentialAction: {
        "@type": "SearchAction",
        target: `${siteUrl}/?q={search_term_string}`,
        "query-input": "required name=search_term_string",
      },
    },
    {
      "@type": "WebApplication",
      name: siteName,
      applicationCategory: "UtilitiesApplication",
      operatingSystem: "Any",
      url: siteUrl,
      description: siteDescription,
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "BDT",
      },
    },
  ],
};

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: ErrorComponentProps) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "application-name", content: siteName },
      { name: "author", content: siteName },
      { name: "description", content: siteDescription },
      { name: "keywords", content: siteKeywords },
      { name: "robots", content: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" },
      { name: "theme-color", content: "#10b981" },
      { name: "google-site-verification", content: googleSiteVerification },
      { property: "og:type", content: "website" },
      { property: "og:site_name", content: siteName },
      { property: "og:title", content: "লিখনটুলস — বাংলা লেখা, ছবি ও ক্যালকুলেটর" },
      { property: "og:description", content: siteDescription },
      { property: "og:url", content: siteUrl },
      { property: "og:image", content: `${siteUrl}/favicon.png` },
      { property: "og:image:alt", content: siteName },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "লিখনটুলস — বাংলা লেখা, ছবি ও ক্যালকুলেটর" },
      { name: "twitter:description", content: siteDescription },
      { name: "twitter:image", content: `${siteUrl}/favicon.png` },
    ],
    links: [
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=Tiro+Bangla&display=swap" },
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: siteUrl },
      { rel: "icon", href: "/favicon.png?v=20261012", type: "image/png", sizes: "351x313" },
      { rel: "apple-touch-icon", href: "/favicon.png?v=20261012" },
      { rel: "manifest", href: "/site.webmanifest" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="bn">
      <head>
        <HeadContent />
        {gaMeasurementId && gaMeasurementId !== "G-XXXXXXXXXX" ? (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
            <script dangerouslySetInnerHTML={{ __html: `window.dataLayer = window.dataLayer || []; function gtag(){dataLayer.push(arguments);} gtag('js', new Date()); gtag('config', '${gaMeasurementId}');` }} />
          </>
        ) : null}
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const home = useLocation().pathname === "/";
  const [language, setLanguage] = useState<Language>("bn");
  const [languageReady, setLanguageReady] = useState(false);

  useEffect(() => {
    setLanguage(getStoredLanguage());
    setLanguageReady(true);
  }, []);

  useEffect(() => {
    if (!languageReady || typeof window === "undefined") return;
    window.localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
    document.documentElement.lang = language === "en" ? "en" : "bn";
  }, [language, languageReady]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      <QueryClientProvider client={queryClient}>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
        {/* Required: nested routes render here. Removing <Outlet /> breaks all child routes. */}
        <SiteHeader />
        <main className={home ? "home-page" : "mx-auto max-w-6xl px-4 py-8"}>
          <Outlet />
        </main>
        {!home && <footer className="py-6 text-center text-sm text-muted-foreground">{language === "en" ? "All tools run in your browser — no file upload is required." : "সব টুল আপনার ব্রাউজারেই চলে — কোনো ফাইল আপলোড হয় না।"}</footer>}
      </QueryClientProvider>
    </LanguageContext.Provider>
  );
}
