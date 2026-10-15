/**
 * File Converter Module - Placeholder for Phase 2
 * In Phase 2, this will contain actual converter functionality
 */

export default {
  mount(container, ctx) {
    const { t, ui, manifest } = ctx;

    const panel = document.createElement("div");
    panel.className = "panel";

    const title = document.createElement("h2");
    title.textContent = t("ফাইল কনভার্টার", "File Converter");
    panel.appendChild(title);

    const desc = document.createElement("p");
    desc.textContent = t(
      "ফাইল কনভার্ট করুন - PDF, Word, Excel, ইমেজ এবং আরও অনেক।",
      "Convert files - PDF, Word, Excel, images and more."
    );
    panel.appendChild(desc);

    const comingSoon = document.createElement("div");
    comingSoon.className = "module-result";
    comingSoon.innerHTML = `
      <h3>${t("শীঘ্রই আসছে", "Coming Soon")}</h3>
      <p>${t(
        "ফাইল কনভার্টার মডিউলগুলি শীঘ্রই যোগ করা হবে।",
        "File converter modules will be added soon."
      )}</p>
    `;
    panel.appendChild(comingSoon);

    const privacy = ui.privacyBadge(manifest.runtime);
    panel.appendChild(privacy);

    container.appendChild(panel);

    this._cleanup = () => {
      panel.remove();
    };
  },

  unmount() {
    if (this._cleanup) {
      this._cleanup();
      this._cleanup = null;
    }
  },
};
