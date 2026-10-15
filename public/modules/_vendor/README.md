# Self-hosted vendor libraries

These files are loaded **only** when a module calls `ctx.lib(name)`. They are not part of the main site bundle.

Run from the repo root:

```sh
npm run sync-vendor
```

That downloads versioned builds into this folder (pdf-lib, pdf.js, JSZip, Mammoth, SheetJS, jsPDF, docx, Noto Sans Bengali). Upload the `_vendor` folder to `public_html/modules/_vendor/` together with your modules.
