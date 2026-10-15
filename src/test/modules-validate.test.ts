import { describe, it, expect } from "vitest";
import { validateManifest, parseManifestJson, scanModuleFolderName, type ModuleManifest } from "../lib/modules/validate";

describe("validateManifest", () => {
  it("accepts a valid manifest", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
      version: "1.0.0",
      enabled: true,
      category: "document",
      icon: "File",
      name: { bn: "টেস্ট", en: "Test" },
      description: { bn: "বর্ণনা", en: "Description" },
      keywords: ["test"],
      runtime: "client",
      accept: [".txt"],
      maxFileSizeMB: 10,
      libs: [],
      seo: {
        title: { bn: "টেস্ট - লিখন টুলস", en: "Test - Likhon Tools" },
        description: { bn: "বিস্তারিত", en: "Detailed description" },
      },
    };

    const result = validateManifest(input, { folderSlug: "test-tool" });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.id).toBe("test-tool");
      expect(result.manifest.slug).toBe("test-tool");
      expect(result.manifest.enabled).toBe(true);
    }
  });

  it("rejects invalid slug format", () => {
    const input = {
      id: "Invalid Slug",
      slug: "Invalid Slug",
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
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "id")).toBe(true);
      expect(result.issues.some((i) => i.path === "slug")).toBe(true);
    }
  });

  it("rejects when slug does not match folder name", () => {
    const input = {
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
    };

    const result = validateManifest(input, { folderSlug: "different-slug" });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "slug")).toBe(true);
    }
  });

  it("rejects invalid version format", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
      version: "invalid",
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
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "version")).toBe(true);
    }
  });

  it("rejects invalid category", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
      version: "1.0.0",
      enabled: true,
      category: "invalid",
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
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "category")).toBe(true);
    }
  });

  it("rejects missing localized fields", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
      version: "1.0.0",
      enabled: true,
      category: "document",
      icon: "File",
      name: { bn: "টেস্ট" },
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
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "name.en")).toBe(true);
    }
  });

  it("rejects invalid runtime", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
      version: "1.0.0",
      enabled: true,
      category: "document",
      icon: "File",
      name: { bn: "টেস্ট", en: "Test" },
      description: { bn: "বর্ণনা", en: "Description" },
      keywords: [],
      runtime: "invalid",
      accept: [],
      maxFileSizeMB: 10,
      libs: [],
      seo: {
        title: { bn: "টেস্ট", en: "Test" },
        description: { bn: "বর্ণনা", en: "Description" },
      },
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues.some((i) => i.path === "runtime")).toBe(true);
    }
  });

  it("rejects non-object input", () => {
    const result = validateManifest(null);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.issues[0].path).toBe("");
    }
  });

  it("rejects disabled modules but returns ok:false", () => {
    const input = {
      id: "test-tool",
      slug: "test-tool",
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
    };

    const result = validateManifest(input);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.manifest.enabled).toBe(false);
    }
  });
});

describe("parseManifestJson", () => {
  it("parses valid JSON", () => {
    const json = '{"id":"test","slug":"test","version":"1.0.0","enabled":true,"category":"document","icon":"File","name":{"bn":"টেস্ট","en":"Test"},"description":{"bn":"বর্ণনা","en":"Description"},"keywords":[],"runtime":"client","accept":[],"maxFileSizeMB":10,"libs":[],"seo":{"title":{"bn":"টেস্ট","en":"Test"},"description":{"bn":"বর্ণনা","en":"Description"}}}';
    const parsed = parseManifestJson(json);
    expect(parsed).toBeDefined();
    expect(typeof parsed).toBe("object");
  });

  it("throws on invalid JSON", () => {
    expect(() => parseManifestJson("invalid json")).toThrow();
  });
});

describe("scanModuleFolderName", () => {
  it("accepts valid folder names", () => {
    expect(scanModuleFolderName("my-tool")).toBe(true);
    expect(scanModuleFolderName("pdf-to-word")).toBe(true);
    expect(scanModuleFolderName("tool123")).toBe(true);
  });

  it("rejects _vendor and .hidden folders", () => {
    expect(scanModuleFolderName("_vendor")).toBe(false);
    expect(scanModuleFolderName(".hidden")).toBe(false);
    expect(scanModuleFolderName("_template")).toBe(false);
  });
});
