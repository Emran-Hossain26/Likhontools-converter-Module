#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const templateDir = path.join(root, "public", "modules", "_template");
const modulesDir = path.join(root, "public", "modules");

const slug = process.argv[2];

if (!slug) {
  console.error("Usage: npm run new-module <slug>");
  console.error("Example: npm run new-module pdf-to-word");
  process.exit(1);
}

if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
  console.error("Error: Slug must be kebab-case (lowercase letters, numbers, hyphens)");
  process.exit(1);
}

const targetDir = path.join(modulesDir, slug);

if (fs.existsSync(targetDir)) {
  console.error(`Error: Module folder already exists: ${targetDir}`);
  process.exit(1);
}

if (!fs.existsSync(templateDir)) {
  console.error("Error: Template folder not found:", templateDir);
  process.exit(1);
}

try {
  fs.mkdirSync(targetDir, { recursive: true });

  const templateFiles = fs.readdirSync(templateDir, { withFileTypes: true });
  for (const entry of templateFiles) {
    if (entry.isDirectory()) continue;

    const srcPath = path.join(templateDir, entry.name);
    const destPath = path.join(targetDir, entry.name);
    const content = fs.readFileSync(srcPath, "utf8");

    let newContent = content;
    if (entry.name === "module.json") {
      const parsed = JSON.parse(content);
      parsed.id = slug;
      parsed.slug = slug;
      newContent = JSON.stringify(parsed, null, 2);
    }

    fs.writeFileSync(destPath, newContent, "utf8");
  }

  console.log(`✓ Created new module: ${slug}`);
  console.log(`  Location: ${targetDir}`);
  console.log(`  Next steps:`);
  console.log(`    1. Edit ${path.join(targetDir, "module.json")}`);
  console.log(`    2. Edit ${path.join(targetDir, "index.js")}`);
  console.log(`    3. Test with npm run dev`);
  console.log(`    4. Pack with npm run pack-module ${slug}`);
} catch (error) {
  console.error("Error creating module:", error);
  process.exit(1);
}
