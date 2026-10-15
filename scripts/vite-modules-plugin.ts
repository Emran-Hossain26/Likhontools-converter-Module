import path from "node:path";
import type { Plugin } from "vite";
import { buildSitemapXml, scanModulesDir } from "../src/lib/modules/scan-node";

export function modulesDevPlugin(root = process.cwd()): Plugin {
  const modulesRoot = path.join(root, "public", "modules");

  return {
    name: "likhon-modules-dev",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split("?")[0] ?? "";
        if (url === "/api/modules.php" || url === "/api/modules.json") {
          const scan = scanModulesDir(modulesRoot);
          const body = JSON.stringify({
            modules: scan.modules.filter((m) => m.enabled),
            skipped: scan.skipped,
            generatedAt: new Date().toISOString(),
          });
          res.setHeader("Content-Type", "application/json; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(body);
          return;
        }
        if (url === "/api/sitemap.php") {
          const scan = scanModulesDir(modulesRoot);
          const xml = buildSitemapXml("https://www.likhontools.com", scan.modules.filter((m) => m.enabled));
          res.setHeader("Content-Type", "application/xml; charset=utf-8");
          res.end(xml);
          return;
        }
        next();
      });
    },
  };
}
