/**
 * Hello World Module - Test module for the module system
 */

export default {
  mount(container, ctx) {
    const { t, ui, manifest } = ctx;

    // Create a panel container
    const panel = document.createElement("div");
    panel.className = "panel";

    // Title
    const title = document.createElement("h2");
    title.textContent = t("হ্যালো ওয়ার্ল্ড!", "Hello World!");
    panel.appendChild(title);

    // Description
    const desc = document.createElement("p");
    desc.textContent = t(
      "এটি মডিউল সিস্টেম টেস্ট করার জন্য একটি সাধারণ টুল।",
      "This is a simple tool to test the module system."
    );
    panel.appendChild(desc);

    // Info about context
    const info = document.createElement("div");
    info.className = "module-result";
    info.innerHTML = `
      <h3>${t("কন্টেক্সট তথ্য", "Context Info")}</h3>
      <ul>
        <li>${t("ভাষা: ", "Language: ")}${ctx.lang}</li>
        <li>${t("থিম: ", "Theme: ")}${ctx.theme}</li>
        <li>${t("মডিউল: ", "Module: ")}${manifest.slug}</li>
        <li>${t("ভার্সন: ", "Version: ")}${manifest.version}</li>
      </ul>
    `;
    panel.appendChild(info);

    // Test button
    const btn = ui.downloadButton(t("টেস্ট করুন", "Test"), () => {
      ui.toast(t("বাটন কাজ করছে!", "Button works!"), "ok");
    });
    panel.appendChild(btn);

    // Privacy badge
    const privacy = ui.privacyBadge(manifest.runtime);
    panel.appendChild(privacy);

    // Add to container
    container.appendChild(panel);

    // Store cleanup
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
