# Module System Guide

লিখন টুলস মডিউল সিস্টেম গাইড

---

## English

### Overview

Likhon Tools uses a plugin module system that allows you to add new tools without rebuilding the entire application. Modules are self-contained folders that can be uploaded directly to the server via cPanel File Manager.

### Module Structure

```
public_html/modules/<slug>/
├── module.json    # Module manifest (metadata)
├── index.js       # Module code (vanilla ES module)
└── assets/        # Optional static assets
```

### Adding a New Module

1. **Create locally** (optional, for development):
   ```bash
   npm run new-module my-tool
   ```
   This creates a new folder in `public/modules/my-tool/` from the template.

2. **Edit the module**:
   - Open `public/modules/my-tool/module.json`
   - Set `id`, `slug`, `name`, `description`, `seo` fields
   - Set `category` (text, image, calculator, converter, document)
   - Set `accept` to list of file types (e.g., `.pdf`, `.docx`)
   - Set `maxFileSizeMB` for upload limit
   - Add any `libs` you need from `_vendor` (pdf-lib, pdfjs, jszip, mammoth, xlsx, jspdf, docx, noto-sans-bengali)
   - Open `public/modules/my-tool/index.js` and implement your tool

3. **Test locally**:
   ```bash
   npm run dev
   ```
   Visit `http://localhost:5173/tool/my-tool` to test.

4. **Pack for deployment**:
   ```bash
   npm run pack-module my-tool
   ```
   This creates `my-tool-1.0.0.zip` in the project root.

5. **Upload to cPanel**:
   - Go to cPanel File Manager
   - Navigate to `public_html/modules/`
   - Upload the `.zip` file
   - Extract it
   - The module will appear on the home page automatically

### Updating a Module

1. Make changes to your local module files
2. Update the `version` in `module.json` (e.g., `1.0.0` → `1.0.1`)
3. Pack again: `npm run pack-module my-tool`
4. Upload and extract on the server (overwrite existing files)
5. The PHP cache will automatically refresh within 60 seconds (or delete `public/api/.cache/modules.json` manually)

### Disabling a Module

To temporarily disable a module without deleting it:

1. Edit `public_html/modules/<slug>/module.json` on the server
2. Set `"enabled": false`
3. Save the file
4. The module will disappear from the home page
5. To re-enable, set `"enabled": true`

### Removing a Module

1. In cPanel File Manager, delete the entire folder: `public_html/modules/<slug>/`
2. The module will be removed from the registry automatically

### Module Manifest Schema

```json
{
  "id": "kebab-case-slug",
  "slug": "kebab-case-slug",
  "version": "1.0.0",
  "enabled": true,
  "category": "document",
  "icon": "File",
  "name": {
    "bn": "বাংলা নাম",
    "en": "English Name"
  },
  "description": {
    "bn": "বাংলা বর্ণনা",
    "en": "English description"
  },
  "keywords": ["tool", "converter"],
  "runtime": "client",
  "accept": [".pdf", ".docx"],
  "maxFileSizeMB": 10,
  "libs": ["pdf-lib", "pdfjs"],
  "seo": {
    "title": {
      "bn": "বাংলা SEO টাইটেল",
      "en": "English SEO Title"
    },
    "description": {
      "bn": "বাংলা SEO বর্ণনা",
      "en": "English SEO Description"
    }
  }
}
```

### Available Categories

- `text` - Text tools
- `image` - Image tools
- `calculator` - Calculators
- `converter` - Converters
- `document` - Document converters

### Available Icons (Lucide)

Use any Lucide icon name as a string: `File`, `Image`, `RefreshCw`, `Keyboard`, `CalendarDays`, etc.

### Available Vendor Libraries

These can be loaded via `ctx.lib(name)`:

- `pdf-lib` - PDF manipulation
- `pdfjs` - PDF rendering
- `jszip` - ZIP file creation
- `mammoth` - DOCX to HTML
- `xlsx` - Excel processing
- `jspdf` - PDF generation
- `jspdf-autotable` - PDF tables
- `docx` - DOCX generation
- `noto-sans-bengali` - Bangla font

### Module Contract

Your `index.js` must export:

```javascript
export default {
  mount(container, ctx) {
    // Render UI into container
    // Use ctx helpers for UI, translations, etc.
  },
  unmount() {
    // Clean up event listeners, timers, etc.
  }
}
```

### Context API

`ctx` provides:
- `lang`: `"bn"` | `"en"`
- `t(bn, en)`: Translation helper
- `theme`: `"dark"` | `"light"`
- `manifest`: Module manifest object
- `ui`: UI helpers (dropzone, fileList, progress, resultCard, downloadButton, toast, privacyBadge, errorBox)
- `lib(name)`: Lazy-load vendor libraries
- `downloadBlob(blob, filename)`: Trigger file download
- `worker(url)`: Create web worker
- `api.convert(form)`: POST to server converter (if enabled)
- `api.serverEnabled()`: Check if server converter is available
- `signal`: AbortSignal for cancellation
- `trackUrl(url)`: Track object URLs for cleanup

### Styling

Use existing CSS classes:
- `.panel` - Card container
- `.btn` - Button
- `.btn-primary` - Primary button
- `.module-dropzone` - Dropzone
- `.module-file-list` - File list
- `.module-progress` - Progress bar
- `.module-result` - Result card
- `.module-error` - Error message
- `.module-toast` - Toast notification
- `.module-privacy-client` / `.module-privacy-server` - Privacy badges

### Security

- Modules are trusted code uploaded by the site owner
- Invalid `module.json` files are safely skipped (logged, never crash the site)
- Client-side modules run entirely in the browser (no file upload to server)
- Server-side modules (if enabled) require explicit configuration in `config.php`

---

## বাংলা

### ওভারভিউ

লিখন টুলস একটি প্লাগইন মডিউল সিস্টেম ব্যবহার করে যা আপনাকে পুরো অ্যাপ রিবিল্ড না করেই নতুন টুল যোগ করতে দেয়। মডিউলগুলি স্বয়ংসম্পূর্ণ ফোল্ডার যা cPanel ফাইল ম্যানেজারের মাধ্যমে সরাসরি সার্ভারে আপলোড করা যায়।

### মডিউল স্ট্রাকচার

```
public_html/modules/<slug>/
├── module.json    # মডিউল ম্যানিফেস্ট (মেটাডেটা)
├── index.js       # মডিউল কোড (vanilla ES module)
└── assets/        # অপশনাল স্ট্যাটিক অ্যাসেট
```

### নতুন মডিউল যোগ করা

1. **লোকালি তৈরি করুন** (ডেভেলপমেন্টের জন্য):
   ```bash
   npm run new-module my-tool
   ```
   এটি `public/modules/my-tool/` ফোল্ডার টেমপ্লেট থেকে তৈরি করে।

2. **মডিউল এডিট করুন**:
   - `public/modules/my-tool/module.json` খুলুন
   - `id`, `slug`, `name`, `description`, `seo` ফিল্ড সেট করুন
   - `category` সেট করুন (text, image, calculator, converter, document)
   - `accept` সেট করুন ফাইল টাইপের তালিকা (যেমন `.pdf`, `.docx`)
   - `maxFileSizeMB` সেট করুন আপলোড লিমিটের জন্য
   - `libs` যোগ করুন `_vendor` থেকে (pdf-lib, pdfjs, jszip, mammoth, xlsx, jspdf, docx, noto-sans-bengali)
   - `public/modules/my-tool/index.js` খুলুন এবং আপনার টুল ইমপ্লিমেন্ট করুন

3. **লোকালি টেস্ট করুন**:
   ```bash
   npm run dev
   ```
   টেস্ট করতে `http://localhost:5173/tool/my-tool` ভিজিট করুন।

4. **ডিপ্লয়মেন্টের জন্য প্যাক করুন**:
   ```bash
   npm run pack-module my-tool
   ```
   এটি প্রজেক্ট রুটে `my-tool-1.0.0.zip` তৈরি করে।

5. **cPanel-এ আপলোড করুন**:
   - cPanel ফাইল ম্যানেজারে যান
   - `public_html/modules/`-এ যান
   - `.zip` ফাইল আপলোড করুন
   - এক্সট্র্যাক্ট করুন
   - মডিউল স্বয়ংক্রিয়ভাবে হোম পেজে দেখা যাবে

### মডিউল আপডেট করা

1. আপনার লোকাল মডিউল ফাইলে পরিবর্তন করুন
2. `module.json`-এ `version` আপডেট করুন (যেমন `1.0.0` → `1.0.1`)
3. আবার প্যাক করুন: `npm run pack-module my-tool`
4. সার্ভারে আপলোড এবং এক্সট্র্যাক্ট করুন (বিদ্যমান ফাইল ওভাররাইট করুন)
5. PHP ক্যাশ ৬০ সেকেন্ডের মধ্যে স্বয়ংক্রিয়ভাবে রিফ্রেশ হবে (অথবা ম্যানুয়ালি `public/api/.cache/modules.json` ডিলিট করুন)

### মডিউল ডিসেবল করা

মডিউল ডিলিট না করে সাময়িকভাবে ডিসেবল করতে:

1. সার্ভারে `public_html/modules/<slug>/module.json` এডিট করুন
2. `"enabled": false` সেট করুন
3. ফাইল সেভ করুন
4. মডিউল হোম পেজ থেকে ডিসঅ্যাপিয়ার হবে
5. পুনরায় সক্ষম করতে `"enabled": true` সেট করুন

### মডিউল রিমুভ করা

1. cPanel ফাইল ম্যানেজারে, পুরো ফোল্ডার ডিলিট করুন: `public_html/modules/<slug>/`
2. মডিউল স্বয়ংক্রিয়ভাবে রেজিস্ট্রি থেকে রিমুভ হবে

### মডিউল ম্যানিফেস্ট স্কিমা

```json
{
  "id": "kebab-case-slug",
  "slug": "kebab-case-slug",
  "version": "1.0.0",
  "enabled": true,
  "category": "document",
  "icon": "File",
  "name": {
    "bn": "বাংলা নাম",
    "en": "English Name"
  },
  "description": {
    "bn": "বাংলা বর্ণনা",
    "en": "English description"
  },
  "keywords": ["tool", "converter"],
  "runtime": "client",
  "accept": [".pdf", ".docx"],
  "maxFileSizeMB": 10,
  "libs": ["pdf-lib", "pdfjs"],
  "seo": {
    "title": {
      "bn": "বাংলা SEO টাইটেল",
      "en": "English SEO Title"
    },
    "description": {
      "bn": "বাংলা SEO বর্ণনা",
      "en": "English SEO Description"
    }
  }
}
```

### উপলব্ধ ক্যাটাগরি

- `text` - টেক্সট টুলস
- `image` - ইমেজ টুলস
- `calculator` - ক্যালকুলেটর
- `converter` - কনভার্টার
- `document` - ডকুমেন্ট কনভার্টার

### উপলব্ধ আইকন (Lucide)

যেকোনো Lucide আইকন নাম স্ট্রিং হিসেবে ব্যবহার করুন: `File`, `Image`, `RefreshCw`, `Keyboard`, `CalendarDays`, ইত্যাদি।

### উপলব্ধ ভেন্ডর লাইব্রেরি

`ctx.lib(name)` এর মাধ্যমে লোড করা যায়:

- `pdf-lib` - PDF ম্যানিপুলেশন
- `pdfjs` - PDF রেন্ডারিং
- `jszip` - ZIP ফাইল তৈরি
- `mammoth` - DOCX থেকে HTML
- `xlsx` - Excel প্রসেসিং
- `jspdf` - PDF জেনারেশন
- `jspdf-autotable` - PDF টেবিল
- `docx` - DOCX জেনারেশন
- `noto-sans-bengali` - বাংলা ফন্ট

### মডিউল কন্ট্রাক্ট

আপনার `index.js` অবশ্যই এক্সপোর্ট করবে:

```javascript
export default {
  mount(container, ctx) {
    // container-এ UI রেন্ডার করুন
    // UI, ট্রান্সলেশন ইত্যাদির জন্য ctx হেল্পার ব্যবহার করুন
  },
  unmount() {
    // ইভেন্ট লিসেনার, টাইমার ইত্যাদি ক্লিনআপ করুন
  }
}
```

### কন্টেক্সট API

`ctx` প্রদান করে:
- `lang`: `"bn"` | `"en"`
- `t(bn, en)`: ট্রান্সলেশন হেল্পার
- `theme`: `"dark"` | `"light"`
- `manifest`: মডিউল ম্যানিফেস্ট অবজেক্ট
- `ui`: UI হেল্পার (dropzone, fileList, progress, resultCard, downloadButton, toast, privacyBadge, errorBox)
- `lib(name)`: ভেন্ডর লাইব্রেরি লেজি-লোড
- `downloadBlob(blob, filename)`: ফাইল ডাউনলোড ট্রিগার
- `worker(url)`: ওয়েব ওয়ার্কার তৈরি
- `api.convert(form)`: সার্ভার কনভার্টারে POST (যদি সক্ষম থাকে)
- `api.serverEnabled()`: সার্ভার কনভার্টার উপলব্ধ কিনা চেক
- `signal`: বাতিলের জন্য AbortSignal
- `trackUrl(url)`: ক্লিনআপের জন্য object URL ট্র্যাক

### স্টাইলিং

বিদ্যমান CSS ক্লাস ব্যবহার করুন:
- `.panel` - কার্ড কন্টেইনার
- `.btn` - বাটন
- `.btn-primary` - প্রাইমারি বাটন
- `.module-dropzone` - ড্রপজোন
- `.module-file-list` - ফাইল লিস্ট
- `.module-progress` - প্রোগ্রেস বার
- `.module-result` - রেজাল্ট কার্ড
- `.module-error` - এরর মেসেজ
- `.module-toast` - টোস্ট নোটিফিকেশন
- `.module-privacy-client` / `.module-privacy-server` - প্রাইভেসি ব্যাজ

### নিরাপত্তা

- মডিউলগুলি সাইট মালিকের দ্বারা আপলোড করা বিশ্বস্ত কোড
- অবৈধ `module.json` ফাইলগুলি নিরাপদে স্কিপ করা হয় (লগ করা হয়, সাইট ক্র্যাশ হয় না)
- ক্লায়েন্ট-সাইড মডিউলগুলি সম্পূর্ণ ব্রাউজারে চলে (সার্ভারে ফাইল আপলোড হয় না)
- সার্ভার-সাইড মডিউল (যদি সক্ষম থাকে) `config.php`-এ স্পষ্ট কনফিগারেশন প্রয়োজন
