/**
 * Module entry point for your-tool-slug
 *
 * This is a vanilla ES module - no build step required.
 * Export a default object with mount() and unmount() methods.
 *
 * Context (ctx) provides:
 * - lang: "bn" | "en"
 * - t(bn, en): translation helper
 * - theme: "dark" | "light"
 * - manifest: module manifest object
 * - ui: { dropzone, fileList, progress, resultCard, downloadButton, toast, privacyBadge, errorBox }
 * - lib(name): lazy-load vendor libs from _vendor
 * - downloadBlob(blob, filename): trigger download
 * - worker(url): create web worker
 * - api: { convert(form), serverEnabled() }
 * - signal: AbortSignal for cancellation
 * - trackUrl(url): track object URL for cleanup
 */

export default {
  /**
   * Mount the module into the container element
   * @param {HTMLElement} container - DOM element to render into
   * @param {object} ctx - Module context
   */
  mount(container, ctx) {
    const { t, ui, manifest } = ctx;

    // Create a simple dropzone
    const dropzone = ui.dropzone({
      accept: manifest.accept.join(","),
      multiple: true,
      onFiles: (files) => {
        if (files.length === 0) return;
        ui.toast(
          t("ফাইল নির্বাচিত: " + files.length, "Files selected: " + files.length),
          "info"
        );
        // Process files here
      },
      label: t("ফাইল এখানে ছাড়ুন বা বেছে নিন", "Drop files here or browse"),
    });

    // Add privacy badge
    const privacy = ui.privacyBadge(manifest.runtime);

    // Build UI
    container.appendChild(dropzone);
    container.appendChild(privacy);

    // Store cleanup function
    this._cleanup = () => {
      dropzone.remove();
      privacy.remove();
    };
  },

  /**
   * Unmount the module and clean up resources
   */
  unmount() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  },
};
