import type { ModuleManifest } from "./validate";

export type Language = "bn" | "en";

export type ModuleHandle = {
  mount: (container: HTMLElement, ctx: ModuleContext) => void | Promise<void>;
  unmount: () => void | Promise<void>;
};

export type ModuleContext = {
  lang: Language;
  t: (bn: string, en: string) => string;
  theme: "dark" | "light";
  manifest: ModuleManifest;
  ui: ModuleUi;
  lib: (name: string) => Promise<unknown>;
  downloadBlob: (blob: Blob, filename: string) => void;
  worker: (url: string) => Worker;
  api: {
    convert: (form: FormData) => Promise<Response>;
    serverEnabled: () => Promise<boolean>;
  };
  signal: AbortSignal;
  trackUrl: (url: string) => string;
};

export type ModuleUi = {
  dropzone: (options: {
    accept?: string;
    multiple?: boolean;
    onFiles: (files: File[]) => void;
    label?: string;
  }) => HTMLElement;
  fileList: (files: File[], options?: { onRemove?: (index: number) => void; onReorder?: (from: number, to: number) => void }) => HTMLElement;
  progress: (percent: number, label?: string) => HTMLElement;
  resultCard: (title: string, body?: HTMLElement | string) => HTMLElement;
  downloadButton: (label: string, onClick: () => void) => HTMLButtonElement;
  toast: (message: string, kind?: "info" | "error" | "ok") => void;
  privacyBadge: (kind: "client" | "server") => HTMLElement;
  errorBox: (message: string) => HTMLElement;
};

type VendorEntry = {
  version?: string;
  type: "umd" | "esm" | "font";
  global?: string;
  file: string;
  worker?: string;
  after?: string;
};

const libCache = new Map<string, Promise<unknown>>();
let catalogCache: Record<string, VendorEntry> | null = null;

export function createHostRuntime(options: {
  lang: Language;
  manifest: ModuleManifest;
  abortController: AbortController;
}): { ctx: ModuleContext; dispose: () => void } {
  const objectUrls = new Set<string>();
  const workers = new Set<Worker>();
  const theme: "dark" | "light" =
    typeof document !== "undefined" && document.documentElement.classList.contains("dark")
      ? "dark"
      : "light";

  const t = (bn: string, en: string) => (options.lang === "en" ? en : bn);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    objectUrls.add(url);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
  };

  const ctx: ModuleContext = {
    lang: options.lang,
    t,
    theme,
    manifest: options.manifest,
    ui: createUi(t),
    lib: (name) => loadVendorLib(name),
    downloadBlob,
    worker: (url) => {
      const worker = new Worker(url, { type: "module" });
      workers.add(worker);
      return worker;
    },
    api: {
      convert: (form) => fetch("/api/convert.php", { method: "POST", body: form, signal: options.abortController.signal }),
      serverEnabled: async () => {
        try {
          const res = await fetch("/api/convert.php?status=1");
          if (!res.ok) return false;
          const json = (await res.json()) as { enabled?: boolean };
          return Boolean(json.enabled);
        } catch {
          return false;
        }
      },
    },
    signal: options.abortController.signal,
    trackUrl: (url) => {
      objectUrls.add(url);
      return url;
    },
  };

  return {
    ctx,
    dispose: () => {
      options.abortController.abort();
      for (const url of objectUrls) URL.revokeObjectURL(url);
      objectUrls.clear();
      for (const worker of workers) {
        try {
          worker.terminate();
        } catch {
          /* ignore */
        }
      }
      workers.clear();
    },
  };
}

export async function importModuleScript(
  url: string,
  importer: (url: string) => Promise<unknown> = (u) => import(/* @vite-ignore */ u),
): Promise<ModuleHandle> {
  const loaded = (await importer(url)) as { default?: ModuleHandle } & Partial<ModuleHandle>;
  const handle = loaded.default ?? loaded;
  if (!handle || typeof handle.mount !== "function" || typeof handle.unmount !== "function") {
    throw new Error("invalid-module-contract");
  }
  return { mount: handle.mount.bind(handle), unmount: handle.unmount.bind(handle) };
}

async function loadCatalog(): Promise<Record<string, VendorEntry>> {
  if (catalogCache) return catalogCache;
  const res = await fetch("/modules/_vendor/catalog.json");
  if (!res.ok) {
    catalogCache = {};
    return catalogCache;
  }
  catalogCache = (await res.json()) as Record<string, VendorEntry>;
  return catalogCache;
}

async function loadVendorLib(name: string): Promise<unknown> {
  const cached = libCache.get(name);
  if (cached) return cached;
  const pending = (async () => {
    const catalog = await loadCatalog();
    const entry = catalog[name];
    if (!entry) throw new Error(`unknown-lib:${name}`);
    if (entry.after) await loadVendorLib(entry.after);
    const url = `/modules/_vendor/${entry.file}`;
    if (entry.type === "esm") {
      const mod = await import(/* @vite-ignore */ url);
      if (name === "pdfjs" && entry.worker && typeof mod === "object" && mod && "GlobalWorkerOptions" in mod) {
        (mod as { GlobalWorkerOptions: { workerSrc: string } }).GlobalWorkerOptions.workerSrc =
          `/modules/_vendor/${entry.worker}`;
      }
      return mod;
    }
    if (entry.type === "font") {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font-missing:${name}`);
      return await res.arrayBuffer();
    }
    await loadScript(url);
    const globalName = entry.global ?? name;
    const value = (window as unknown as Record<string, unknown>)[globalName];
    if (name === "jspdf" && value && typeof value === "object" && "jsPDF" in value) {
      return (value as { jsPDF: unknown }).jsPDF;
    }
    return value;
  })();
  libCache.set(name, pending);
  return pending;
}

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[data-likhon-lib="${src}"]`);
    if (existing) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.likhonLib = src;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`failed-to-load:${src}`));
    document.head.appendChild(script);
  });
}

function createUi(t: (bn: string, en: string) => string): ModuleUi {
  return {
    dropzone({ accept, multiple = true, onFiles, label }) {
      const wrap = document.createElement("label");
      wrap.className = "module-dropzone";
      wrap.tabIndex = 0;
      const input = document.createElement("input");
      input.type = "file";
      input.className = "sr-only";
      if (accept) input.accept = accept;
      input.multiple = multiple;
      const text = document.createElement("span");
      text.textContent = label ?? t("ফাইল এখানে ছাড়ুন বা বেছে নিন", "Drop files here or browse");
      wrap.append(text, input);
      const take = (list: FileList | File[] | null) => {
        if (!list) return;
        onFiles(Array.from(list));
      };
      input.addEventListener("change", () => take(input.files));
      wrap.addEventListener("dragover", (event) => {
        event.preventDefault();
        wrap.classList.add("is-over");
      });
      wrap.addEventListener("dragleave", () => wrap.classList.remove("is-over"));
      wrap.addEventListener("drop", (event) => {
        event.preventDefault();
        wrap.classList.remove("is-over");
        take(event.dataTransfer?.files ?? null);
      });
      wrap.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          input.click();
        }
      });
      return wrap;
    },
    fileList(files, options) {
      const list = document.createElement("ul");
      list.className = "module-file-list";
      files.forEach((file, index) => {
        const item = document.createElement("li");
        item.draggable = Boolean(options?.onReorder);
        const name = document.createElement("span");
        name.textContent = `${file.name} (${formatBytes(file.size)})`;
        item.append(name);
        if (options?.onRemove) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "btn";
          btn.textContent = t("সরান", "Remove");
          btn.addEventListener("click", () => options.onRemove?.(index));
          item.append(btn);
        }
        if (options?.onReorder) {
          item.addEventListener("dragstart", (event) => {
            event.dataTransfer?.setData("text/plain", String(index));
          });
          item.addEventListener("dragover", (event) => event.preventDefault());
          item.addEventListener("drop", (event) => {
            event.preventDefault();
            const from = Number(event.dataTransfer?.getData("text/plain"));
            if (Number.isInteger(from)) options.onReorder?.(from, index);
          });
        }
        list.append(item);
      });
      return list;
    },
    progress(percent, label) {
      const wrap = document.createElement("div");
      wrap.className = "module-progress";
      wrap.setAttribute("role", "progressbar");
      wrap.setAttribute("aria-valuemin", "0");
      wrap.setAttribute("aria-valuemax", "100");
      wrap.setAttribute("aria-valuenow", String(Math.round(percent)));
      const bar = document.createElement("div");
      bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      const caption = document.createElement("span");
      caption.textContent = label ?? `${Math.round(percent)}%`;
      wrap.append(bar, caption);
      return wrap;
    },
    resultCard(title, body) {
      const card = document.createElement("div");
      card.className = "panel module-result";
      const heading = document.createElement("h3");
      heading.textContent = title;
      card.append(heading);
      if (typeof body === "string") {
        const p = document.createElement("p");
        p.textContent = body;
        card.append(p);
      } else if (body) {
        card.append(body);
      }
      return card;
    },
    downloadButton(label, onClick) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "btn-primary";
      btn.textContent = label;
      btn.addEventListener("click", onClick);
      return btn;
    },
    toast(message, kind = "info") {
      const el = document.createElement("div");
      el.className = `module-toast module-toast-${kind}`;
      el.setAttribute("role", kind === "error" ? "alert" : "status");
      el.textContent = message;
      document.body.append(el);
      window.setTimeout(() => el.remove(), 4000);
    },
    privacyBadge(kind) {
      const el = document.createElement("p");
      el.className = `module-privacy module-privacy-${kind}`;
      el.textContent =
        kind === "server"
          ? t("সার্ভারে প্রসেস হয়", "Processed on the server")
          : t("আপনার ব্রাউজারেই হয়", "Runs in your browser");
      return el;
    },
    errorBox(message) {
      const el = document.createElement("div");
      el.className = "module-error";
      el.setAttribute("role", "alert");
      el.textContent = message;
      return el;
    },
  };
}

export function formatBytes(size: number): string {
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function filesTooLarge(files: File[], maxMb: number): File[] {
  const max = maxMb * 1024 * 1024;
  return files.filter((file) => file.size > max);
}

export function warnMobileMemory(t: (bn: string, en: string) => string, ui: ModuleUi): void {
  const coarse = typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches;
  if (coarse) {
    ui.toast(
      t(
        "মোবাইলে বড় ফাইল মেমোরি সমস্যা করতে পারে। ছোট ব্যাচ ব্যবহার করুন।",
        "Large files on mobile may run out of memory. Use smaller batches.",
      ),
      "info",
    );
  }
}
