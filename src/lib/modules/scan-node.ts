import fs from "node:fs";
import path from "node:path";
import { scanModuleFolderName, validateManifest, type ModuleManifest } from "./validate";

export type ScanResult = {
  modules: ModuleManifest[];
  skipped: { slug: string; issues: { path: string; message: string }[] }[];
  newestMtime: number;
};

export function scanModulesDir(modulesRoot: string): ScanResult {
  const skipped: ScanResult["skipped"] = [];
  const modules: ModuleManifest[] = [];
  let newestMtime = 0;

  if (!fs.existsSync(modulesRoot)) {
    return { modules, skipped, newestMtime };
  }

  const entries = fs.readdirSync(modulesRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !scanModuleFolderName(entry.name)) continue;
    const folder = path.join(modulesRoot, entry.name);
    const manifestPath = path.join(folder, "module.json");
    if (!fs.existsSync(manifestPath)) {
      skipped.push({
        slug: entry.name,
        issues: [{ path: "module.json", message: "missing module.json" }],
      });
      continue;
    }
    try {
      const stat = fs.statSync(manifestPath);
      newestMtime = Math.max(newestMtime, stat.mtimeMs);
      const raw = fs.readFileSync(manifestPath, "utf8");
      const parsed = JSON.parse(raw) as unknown;
      const result = validateManifest(parsed, { folderSlug: entry.name });
      if (!result.ok) {
        skipped.push({ slug: entry.name, issues: result.issues });
        continue;
      }
      modules.push(result.manifest);
    } catch (error) {
      skipped.push({
        slug: entry.name,
        issues: [
          {
            path: "module.json",
            message: error instanceof Error ? error.message : "invalid JSON",
          },
        ],
      });
    }
  }

  modules.sort((a, b) => a.slug.localeCompare(b.slug));
  return { modules, skipped, newestMtime };
}

export const STATIC_SITEMAP_PATHS = [
  "/",
  "/bangla-typing",
  "/converter",
  "/image-resizer",
  "/passport-photo",
  "/age-calculator",
  "/cgpa-calculator",
  "/contact",
  "/advertise",
];

export function buildSitemapXml(siteUrl: string, modules: ModuleManifest[]): string {
  const origin = siteUrl.replace(/\/$/, "");
  const today = new Date().toISOString().slice(0, 10);
  const urls = [
    ...STATIC_SITEMAP_PATHS.map((loc) => ({ loc: `${origin}${loc}`, priority: loc === "/" ? "1.0" : "0.8" })),
    ...modules.filter((m) => m.enabled).map((m) => ({ loc: `${origin}/tool/${m.slug}`, priority: "0.7" })),
  ];
  const body = urls
    .map(
      ({ loc, priority }) => `  <url>
    <loc>${escapeXml(loc)}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;
}

function escapeXml(value: string): string {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
