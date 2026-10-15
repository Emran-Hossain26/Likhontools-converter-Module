# Module Template

This is a template for creating new Likhon Tools modules.

## How to Use

1. Copy this entire folder to `public/modules/<your-slug>/`
2. Rename the folder to match your tool's slug (kebab-case, e.g., `pdf-to-word`)
3. Edit `module.json`:
   - Set `id` and `slug` to your tool's slug
   - Update `name`, `description`, and `seo` fields (BN + EN)
   - Set `category` (text, image, calculator, converter, document)
   - Set `accept` to list of MIME types or file extensions
   - Set `maxFileSizeMB` for upload limit
   - Add any `libs` you need from `_vendor` (pdf-lib, pdfjs, jszip, etc.)
4. Edit `index.js` to implement your tool's logic
5. Test locally with `npm run dev`
6. Pack with `npm run pack-module <slug>` and upload to cPanel

## Module Contract

Your `index.js` must export a default object with:

- `mount(container, ctx)` - Called when the module loads. Render UI into `container`.
- `unmount()` - Called when navigating away. Clean up event listeners, timers, etc.

## Context API

`ctx` provides:
- `lang`: "bn" | "en"
- `t(bn, en)`: Translation helper
- `theme`: "dark" | "light"
- `manifest`: The parsed module.json object
- `ui`: UI helpers (dropzone, fileList, progress, resultCard, downloadButton, toast, privacyBadge, errorBox)
- `lib(name)`: Lazy-load vendor libraries from `_vendor`
- `downloadBlob(blob, filename)`: Trigger file download
- `worker(url)`: Create web worker
- `api.convert(form)`: POST to server converter (if enabled)
- `api.serverEnabled()`: Check if server converter is available
- `signal`: AbortSignal for cancellation
- `trackUrl(url)`: Track object URLs for cleanup

## Styling

Use the existing CSS classes:
- `.panel` - Card container
- `.btn` - Button
- `.btn-primary` - Primary button
- `.module-dropzone` - Dropzone style
- `.module-file-list` - File list style
- `.module-progress` - Progress bar
- `.module-result` - Result card
- `.module-error` - Error message
- `.module-toast` - Toast notification
- `.module-privacy-client` / `.module-privacy-server` - Privacy badges

## Example: Simple File Processor

```javascript
export default {
  mount(container, ctx) {
    const { t, ui, manifest, downloadBlob } = ctx;
    let currentBlob = null;

    const dropzone = ui.dropzone({
      accept: manifest.accept.join(","),
      onFiles: async (files) => {
        // Process file
        const result = await processFile(files[0]);
        currentBlob = result;

        // Show result
        const card = ui.resultCard(t("ফলাফল", "Result"));
        const btn = ui.downloadButton(t("ডাউনলোড", "Download"), () => {
          downloadBlob(currentBlob, "output.txt");
        });
        card.appendChild(btn);
        container.appendChild(card);
      },
    });

    container.appendChild(dropzone);

    this._cleanup = () => {
      dropzone.remove();
      // Clean up result cards if any
    };
  },

  unmount() {
    this._cleanup?.();
  },
};
```
