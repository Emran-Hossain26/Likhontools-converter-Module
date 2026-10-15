export const MODULE_CATEGORIES = [
  "text",
  "image",
  "calculator",
  "converter",
  "document",
] as const;

export const MODULE_RUNTIMES = ["client", "server"] as const;

export type ModuleCategory = (typeof MODULE_CATEGORIES)[number];
export type ModuleRuntime = (typeof MODULE_RUNTIMES)[number];

export type LocalizedText = { bn: string; en: string };

export type ModuleManifest = {
  id: string;
  slug: string;
  version: string;
  enabled: boolean;
  category: ModuleCategory;
  icon: string;
  name: LocalizedText;
  description: LocalizedText;
  keywords: string[];
  runtime: ModuleRuntime;
  accept: string[];
  maxFileSizeMB: number;
  libs: string[];
  seo: {
    title: LocalizedText;
    description: LocalizedText;
  };
};

export type ManifestIssue = { path: string; message: string };

export type ManifestResult =
  | { ok: true; manifest: ModuleManifest }
  | { ok: false; issues: ManifestIssue[] };

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const VERSION_RE = /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.]+)?$/;

function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function readLocalized(value: unknown, path: string, issues: ManifestIssue[]): LocalizedText | null {
  if (!isObject(value)) {
    issues.push({ path, message: "must be an object with bn and en strings" });
    return null;
  }
  const bn = value.bn;
  const en = value.en;
  if (typeof bn !== "string" || bn.trim() === "") {
    issues.push({ path: `${path}.bn`, message: "must be a non-empty string" });
  }
  if (typeof en !== "string" || en.trim() === "") {
    issues.push({ path: `${path}.en`, message: "must be a non-empty string" });
  }
  if (typeof bn === "string" && typeof en === "string" && bn.trim() && en.trim()) {
    return { bn: bn.trim(), en: en.trim() };
  }
  return null;
}

function readStringList(value: unknown, path: string, issues: ManifestIssue[]): string[] {
  if (!Array.isArray(value)) {
    issues.push({ path, message: "must be an array of strings" });
    return [];
  }
  const items: string[] = [];
  value.forEach((item, index) => {
    if (typeof item !== "string" || item.trim() === "") {
      issues.push({ path: `${path}[${index}]`, message: "must be a non-empty string" });
      return;
    }
    items.push(item.trim());
  });
  return items;
}

export function parseManifestJson(raw: string): unknown {
  return JSON.parse(raw) as unknown;
}

export function validateManifest(
  input: unknown,
  options: { folderSlug?: string } = {},
): ManifestResult {
  const issues: ManifestIssue[] = [];
  if (!isObject(input)) {
    return { ok: false, issues: [{ path: "", message: "module.json must be a JSON object" }] };
  }

  const id = input.id;
  const slug = input.slug;
  if (typeof id !== "string" || !SLUG_RE.test(id)) {
    issues.push({ path: "id", message: "must be a kebab-case slug" });
  }
  if (typeof slug !== "string" || !SLUG_RE.test(slug)) {
    issues.push({ path: "slug", message: "must be a kebab-case slug" });
  }
  if (typeof id === "string" && typeof slug === "string" && id !== slug) {
    issues.push({ path: "id", message: "must match slug" });
  }
  if (options.folderSlug && typeof slug === "string" && slug !== options.folderSlug) {
    issues.push({ path: "slug", message: `must match folder name (${options.folderSlug})` });
  }

  const version = input.version;
  if (typeof version !== "string" || !VERSION_RE.test(version)) {
    issues.push({ path: "version", message: "must be a semver string such as 1.0.0" });
  }

  if (typeof input.enabled !== "boolean") {
    issues.push({ path: "enabled", message: "must be true or false" });
  }

  const category = input.category;
  if (typeof category !== "string" || !MODULE_CATEGORIES.includes(category as ModuleCategory)) {
    issues.push({
      path: "category",
      message: `must be one of: ${MODULE_CATEGORIES.join(", ")}`,
    });
  }

  if (typeof input.icon !== "string" || input.icon.trim() === "") {
    issues.push({ path: "icon", message: "must be a non-empty string" });
  }

  const name = readLocalized(input.name, "name", issues);
  const description = readLocalized(input.description, "description", issues);
  const keywords = readStringList(input.keywords, "keywords", issues);

  const runtime = input.runtime;
  if (typeof runtime !== "string" || !MODULE_RUNTIMES.includes(runtime as ModuleRuntime)) {
    issues.push({ path: "runtime", message: 'must be "client" or "server"' });
  }

  const accept = readStringList(input.accept, "accept", issues);

  const maxFileSizeMB = input.maxFileSizeMB;
  if (typeof maxFileSizeMB !== "number" || !Number.isFinite(maxFileSizeMB) || maxFileSizeMB <= 0) {
    issues.push({ path: "maxFileSizeMB", message: "must be a positive number" });
  }

  const libs = readStringList(input.libs, "libs", issues);

  let seoTitle: LocalizedText | null = null;
  let seoDescription: LocalizedText | null = null;
  if (!isObject(input.seo)) {
    issues.push({ path: "seo", message: "must be an object" });
  } else {
    seoTitle = readLocalized(input.seo.title, "seo.title", issues);
    seoDescription = readLocalized(input.seo.description, "seo.description", issues);
  }

  if (issues.length > 0 || !name || !description || !seoTitle || !seoDescription) {
    return { ok: false, issues };
  }

  return {
    ok: true,
    manifest: {
      id: id as string,
      slug: slug as string,
      version: version as string,
      enabled: input.enabled as boolean,
      category: category as ModuleCategory,
      icon: String(input.icon).trim(),
      name,
      description,
      keywords,
      runtime: runtime as ModuleRuntime,
      accept,
      maxFileSizeMB: maxFileSizeMB as number,
      libs,
      seo: { title: seoTitle, description: seoDescription },
    },
  };
}

export function scanModuleFolderName(name: string): boolean {
  return !name.startsWith("_") && !name.startsWith(".");
}
