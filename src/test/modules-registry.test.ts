import { describe, it, expect, vi, beforeEach } from "vitest";
import { fetchModuleRegistry, normalizeRegistry, findModule } from "../lib/modules/registry";

describe("normalizeRegistry", () => {
  it("returns empty modules for null input", () => {
    const result = normalizeRegistry(null);
    expect(result.modules).toEqual([]);
  });

  it("returns empty modules for non-object input", () => {
    const result = normalizeRegistry("invalid");
    expect(result.modules).toEqual([]);
  });

  it("normalizes valid registry", () => {
    const payload = {
      modules: [
        {
          id: "test-tool",
          slug: "test-tool",
          version: "1.0.0",
          enabled: true,
          category: "document",
          icon: "File",
          name: { bn: "টেস্ট", en: "Test" },
          description: { bn: "বর্ণনা", en: "Description" },
          keywords: [],
          runtime: "client",
          accept: [],
          maxFileSizeMB: 10,
          libs: [],
          seo: {
            title: { bn: "টেস্ট", en: "Test" },
            description: { bn: "বর্ণনা", en: "Description" },
          },
        },
      ],
      skipped: [],
    };

    const result = normalizeRegistry(payload);
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].slug).toBe("test-tool");
  });

  it("filters out disabled modules", () => {
    const payload = {
      modules: [
        {
          id: "enabled-tool",
          slug: "enabled-tool",
          version: "1.0.0",
          enabled: true,
          category: "document",
          icon: "File",
          name: { bn: "টেস্ট", en: "Test" },
          description: { bn: "বর্ণনা", en: "Description" },
          keywords: [],
          runtime: "client",
          accept: [],
          maxFileSizeMB: 10,
          libs: [],
          seo: {
            title: { bn: "টেস্ট", en: "Test" },
            description: { bn: "বর্ণনা", en: "Description" },
          },
        },
        {
          id: "disabled-tool",
          slug: "disabled-tool",
          version: "1.0.0",
          enabled: false,
          category: "document",
          icon: "File",
          name: { bn: "টেস্ট", en: "Test" },
          description: { bn: "বর্ণনা", en: "Description" },
          keywords: [],
          runtime: "client",
          accept: [],
          maxFileSizeMB: 10,
          libs: [],
          seo: {
            title: { bn: "টেস্ট", en: "Test" },
            description: { bn: "বর্ণনা", en: "Description" },
          },
        },
      ],
      skipped: [],
    };

    const result = normalizeRegistry(payload);
    expect(result.modules).toHaveLength(1);
    expect(result.modules[0].slug).toBe("enabled-tool");
  });

  it("includes skipped info for invalid manifests", () => {
    const payload = {
      modules: [
        {
          id: "invalid-tool",
          slug: "invalid-tool",
          version: "invalid",
          enabled: true,
          category: "invalid",
          icon: "",
          name: { bn: "", en: "" },
          description: { bn: "", en: "" },
          keywords: [],
          runtime: "invalid",
          accept: [],
          maxFileSizeMB: -1,
          libs: [],
          seo: {
            title: { bn: "", en: "" },
            description: { bn: "", en: "" },
          },
        },
      ],
      skipped: [],
    };

    const result = normalizeRegistry(payload);
    expect(result.modules).toHaveLength(0);
    expect(result.skipped).toBeDefined();
    expect(result.skipped?.length).toBeGreaterThan(0);
  });
});

describe("findModule", () => {
  it("finds module by slug", () => {
    const modules = [
      {
        id: "test-tool",
        slug: "test-tool",
        version: "1.0.0",
        enabled: true,
        category: "document",
        icon: "File",
        name: { bn: "টেস্ট", en: "Test" },
        description: { bn: "বর্ণনা", en: "Description" },
        keywords: [],
        runtime: "client",
        accept: [],
        maxFileSizeMB: 10,
        libs: [],
        seo: {
          title: { bn: "টেস্ট", en: "Test" },
          description: { bn: "বর্ণনা", en: "Description" },
        },
      },
    ];

    const found = findModule(modules, "test-tool");
    expect(found).toBeDefined();
    expect(found?.slug).toBe("test-tool");
  });

  it("returns undefined for non-existent slug", () => {
    const modules = [
      {
        id: "test-tool",
        slug: "test-tool",
        version: "1.0.0",
        enabled: true,
        category: "document",
        icon: "File",
        name: { bn: "টেস্ট", en: "Test" },
        description: { bn: "বর্ণনা", en: "Description" },
        keywords: [],
        runtime: "client",
        accept: [],
        maxFileSizeMB: 10,
        libs: [],
        seo: {
          title: { bn: "টেস্ট", en: "Test" },
          description: { bn: "বর্ণনা", en: "Description" },
        },
      },
    ];

    const found = findModule(modules, "non-existent");
    expect(found).toBeUndefined();
  });
});

describe("fetchModuleRegistry", () => {
  it("fetches from /api/modules.php by default", async () => {
    const mockFetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        modules: [],
        skipped: [],
        generatedAt: new Date().toISOString(),
      }),
    });

    const result = await fetchModuleRegistry(mockFetch as any);
    expect(mockFetch).toHaveBeenCalledWith("/api/modules.php", {
      headers: { Accept: "application/json" },
    });
    expect(result.modules).toEqual([]);
  });

  it("falls back to /api/modules.json on failure", async () => {
    const mockFetch = vi.fn()
      .mockResolvedValueOnce({
        ok: false,
        status: 404,
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          modules: [],
          skipped: [],
          generatedAt: new Date().toISOString(),
        }),
      });

    const result = await fetchModuleRegistry(mockFetch as any);
    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(mockFetch).toHaveBeenNthCalledWith(1, "/api/modules.php", {
      headers: { Accept: "application/json" },
    });
    expect(mockFetch).toHaveBeenNthCalledWith(2, "/api/modules.json", {
      headers: { Accept: "application/json" },
    });
    expect(result.modules).toEqual([]);
  });

  it("returns empty modules on complete failure", async () => {
    const mockFetch = vi.fn().mockRejectedValue(new Error("Network error"));
    const consoleWarnSpy = vi.spyOn(console, "warn").mockImplementation(() => {});

    const result = await fetchModuleRegistry(mockFetch as any);
    expect(result.modules).toEqual([]);

    consoleWarnSpy.mockRestore();
  });
});
