#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { execSync } from "node:child_process";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const modulesDir = path.join(root, "public", "modules");

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run pack-module <slug>");
  console.error("Example: npm run pack-module pdf-to-word");
  process.exit(1);
}

const moduleDir = path.join(modulesDir, slug);

if (!fs.existsSync(moduleDir)) {
  console.error(`Error: Module folder not found: ${moduleDir}`);
  process.exit(1);
}

const manifestPath = path.join(moduleDir, "module.json");
if (!fs.existsSync(manifestPath)) {
  console.error(`Error: module.json not found in: ${moduleDir}`);
  process.exit(1);
}

try {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
  const version = manifest.version || "1.0.0";
  const outputName = `${slug}-${version}.zip`;
  const outputPath = path.join(root, outputName);

  console.log(`Packing module: ${slug} (v${version})...`);

  if (process.platform === "win32") {
    execSync(`powershell Compress-Archive -Path "${moduleDir}\\*" -DestinationPath "${outputPath}" -Force`, {
      stdio: "inherit",
    });
  } else {
    execSync(`cd "${modulesDir}" && zip -r "${outputPath}" "${slug}"`, {
      stdio: "inherit",
    });
  }

  console.log(`✓ Created: ${outputName}`);
  console.log(`  Size: ${(fs.statSync(outputPath).size / 1024).toFixed(2)} KB`);
  console.log(`  Upload this file to cPanel and extract in public_html/modules/`);
} catch (error) {
  console.error("Error packing module:", error);
  process.exit(1);
}
