import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { PageTitle } from "@/components/SiteHeader";
import { useLanguage } from "@/lib/i18n";
import { fetchModuleRegistry, findModule } from "@/lib/modules/registry";
import { createHostRuntime, importModuleScript } from "@/lib/modules/host";
import type { ModuleManifest } from "@/lib/modules/validate";

export const Route = createFileRoute("/tool/$slug")({
  head: ({ params }) => ({
    meta: [
      { title: `${params.slug} | লিখন টুলস` },
      { name: "description", content: "লিখন টুলস অনলাইন টুল" },
    ],
  }),
  component: ModuleHostPage,
});

function ModuleHostPage() {
  const { slug } = Route.useParams();
  const { language } = useLanguage();
  const hostRef = useRef<HTMLDivElement>(null);
  const [manifest, setManifest] = useState<ModuleManifest | null>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "missing" | "error">("loading");
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setManifest(null);
    void fetchModuleRegistry().then((registry) => {
      if (cancelled) return;
      const found = findModule(registry.modules, slug);
      if (!found) {
        setStatus("missing");
        return;
      }
      setManifest(found);
      const title = found.seo.title[language] || found.name[language];
      const description = found.seo.description[language] || found.description[language];
      document.title = title;
      upsertMeta("description", description);
      upsertMeta("og:title", title, "property");
      upsertMeta("og:description", description, "property");
      setStatus("ready");
    });
    return () => {
      cancelled = true;
    };
  }, [slug, language]);

  useEffect(() => {
    if (!manifest || !hostRef.current) return;
    const node = hostRef.current;
    const abort = new AbortController();
    const runtime = createHostRuntime({ lang: language, manifest, abortController: abort });
    let handle: { unmount: () => void | Promise<void> } | null = null;

    void (async () => {
      try {
        node.replaceChildren();
        const skeleton = document.createElement("div");
        skeleton.className = "module-skeleton";
        skeleton.setAttribute("aria-busy", "true");
        skeleton.textContent = language === "en" ? "Loading tool…" : "টুল লোড হচ্ছে…";
        node.append(skeleton);
        handle = await importModuleScript(`/modules/${manifest.slug}/index.js`);
        node.replaceChildren();
        await handle.mount(node, runtime.ctx);
      } catch (err) {
        console.error(err);
        setStatus("error");
        setError(
          language === "en"
            ? "This tool could not be loaded. Please try again."
            : "এই টুলটি লোড করা যায়নি। আবার চেষ্টা করুন।",
        );
      }
    })();

    return () => {
      void Promise.resolve(handle?.unmount()).catch(() => undefined);
      runtime.dispose();
      node.replaceChildren();
    };
  }, [manifest, language]);

  const title = manifest?.name[language] ?? slug;
  const sub =
    manifest?.description[language] ??
    (language === "en" ? "Online tool" : "অনলাইন টুল");

  return (
    <>
      <PageTitle title={title} sub={sub} />
      {status === "loading" && (
        <div className="module-skeleton" aria-busy="true">
          {language === "en" ? "Loading tool…" : "টুল লোড হচ্ছে…"}
        </div>
      )}
      {status === "missing" && (
        <div className="module-error" role="alert">
          {language === "en"
            ? "This tool is not available."
            : "এই টুলটি পাওয়া যায়নি।"}
        </div>
      )}
      {status === "error" && (
        <div className="module-error" role="alert">
          {error}
        </div>
      )}
      <div ref={hostRef} className="module-host" hidden={status !== "ready"} />
    </>
  );
}

function upsertMeta(name: string, content: string, attr: "name" | "property" = "name"): void {
  const selector = `meta[${attr}="${name}"]`;
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, name);
    document.head.append(el);
  }
  el.setAttribute("content", content);
}
