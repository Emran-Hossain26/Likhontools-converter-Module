import { validateManifest, type ModuleManifest } from "./validate";

export type ModuleRegistryResponse = {
  modules: ModuleManifest[];
  skipped?: { slug: string; issues: { path: string; message: string }[] }[];
};

const ENDPOINTS = ["/api/modules.php", "/api/modules.json"];

export async function fetchModuleRegistry(
  fetchFn: typeof fetch = fetch,
): Promise<ModuleRegistryResponse> {
  let lastError: unknown;
  for (const url of ENDPOINTS) {
    try {
      const response = await fetchFn(url, { headers: { Accept: "application/json" } });
      if (!response.ok) {
        lastError = new Error(`${url} returned ${response.status}`);
        continue;
      }
      const payload = (await response.json()) as unknown;
      return normalizeRegistry(payload);
    } catch (error) {
      lastError = error;
    }
  }
  if (lastError) {
    console.warn("Module registry unavailable", lastError);
  }
  return { modules: [] };
}

export function normalizeRegistry(payload: unknown): ModuleRegistryResponse {
  if (!payload || typeof payload !== "object") {
    return { modules: [] };
  }
  const record = payload as Record<string, unknown>;
  const list = Array.isArray(record.modules) ? record.modules : [];
  const modules: ModuleManifest[] = [];
  const skipped: ModuleRegistryResponse["skipped"] = [];

  for (const item of list) {
    const result = validateManifest(item);
    if (result.ok && result.manifest.enabled) {
      modules.push(result.manifest);
    } else if (!result.ok) {
      const slug =
        item && typeof item === "object" && "slug" in item && typeof item.slug === "string"
          ? item.slug
          : "unknown";
      skipped.push({ slug, issues: result.issues });
    }
  }

  return skipped.length ? { modules, skipped } : { modules };
}

export function findModule(modules: ModuleManifest[], slug: string): ModuleManifest | undefined {
  return modules.find((module) => module.slug === slug);
}
