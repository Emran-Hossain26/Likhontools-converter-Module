# cPanel ডিপ্লয়মেন্ট গাইড

এই প্রজেক্টটি cPanel হোস্টিং এ ডিপ্লয় করার সম্পূর্ণ ইন্সট্রাকশন।

## প্রয়োজনীয় পূর্বশর্ত

- cPanel হোস্টিং অ্যাকাউন্ট
- SSH অ্যাক্সেস (অপশনাল, কিন্তু সুবিধাজনক)
- Node.js সাপোর্ট (cPanel এ "Setup Node.js App" অপশন থাকতে হবে)
- Supabase অ্যাকাউন্ট (ডাটাবেসের জন্য)

## ধাপ ১: লোকাল মেশিনে বিল্ড করা

আপনার লোকাল মেশিনে নিচের কমান্ড রান করুন:

```bash
npm install
npm run build
```

বিল্ড সফল হলে `.output` ফোল্ডার তৈরি হবে।

## ধাপ ২: ফাইলগুলি আপলোড করা

আপনার cPanel এ `public_html` এর ভেতর একটি সাবফোল্ডার তৈরি করুন (যেমন: `likhon-tools` বা সরাসরি `public_html` এ)।

নিচের ফাইলগুলি আপলোড করুন:

```
cPanel:
├── public_html/
│   ├── package.json           (নতুন তৈরি করা, নিচে দেওয়া আছে)
│   ├── .output/               (পুরো ফোল্ডার)
│   └── node_modules/          (cPanel এ ইন্সটল হবে)
```

**আপলোড করার পদ্ধতি:**
- File Manager ব্যবহার করে `.output` ফোল্ডারটি আপলোড করুন
- অথবা FTP/SFTP ব্যবহার করুন

## ধাপ ৩: package.json তৈরি করা

cPanel এ `package.json` ফাইল তৈরি করুন (নিচের কন্টেন্ট দিয়ে):

```json
{
  "name": "likhon-tools",
  "version": "1.0.0",
  "main": "server/index.mjs",
  "scripts": {
    "start": "node server/index.mjs"
  },
  "dependencies": {
    "h3": "^1.12.0"
  }
}
```

## ধাপ ৪: Node.js অ্যাপ সেটআপ করা

cPanel এ যান:

1. **Software** সেকশনে গিয়ে **"Setup Node.js App"** এ ক্লিক করুন
2. **"Create Application"** বাটনে ক্লিক করুন
3. নিচের তথ্য দিন:

   - **Node.js version:** 20.x বা উচ্চতর (প্রজেক্টের রিকোয়ারমেন্ট অনুযায়ী)
   - **Application mode:** Production
   - **Application root:** `public_html` (বা আপনার সাবফোল্ডার)
   - **Application URL:** আপনার ডোমেইন (যেমন: `yourdomain.com` বা `subdomain.yourdomain.com`)
   - **Application startup file:** `server/index.mjs`

4. **"Create"** বাটনে ক্লিক করুন

## ধাপ ৫: Dependencies ইন্সটল করা

1. অ্যাপ তৈরি হওয়ার পর **"Run NPM Install"** বাটনে ক্লিক করুন
2. অপেক্ষা করুন যতক্ষণ না ইন্সটলেশন সম্পূর্ণ হয়

## ধাপ ৬: Environment Variables সেট করা

Supabase কনফিগারেশনের জন্য:

1. cPanel এর **"Setup Node.js App"** এ আপনার অ্যাপে ক্লিক করুন
2. **"Environment Variables"** সেকশনে যান
3. নিচের ভেরিয়েবলগুলি যোগ করুন:

   ```
   VITE_SUPABASE_URL = https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY = YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

   **গুরুত্বপূর্ণ:** আপনার Supabase প্রজেক্ট থেকে এই ভ্যালুগুলি সংগ্রহ করুন।

4. **"Save"** বাটনে ক্লিক করুন

## ধাপ ৭: Supabase ডাটাবেস সেটআপ

1. Supabase ড্যাশবোর্ডে যান
2. **SQL Editor** এ যান
3. প্রজেক্টের `supabase/contact-messages.sql` ফাইলের কন্টেন্ট রান করুন
4. অথবা লোকাল প্রজেক্ট থেকে `supabase/contact-messages.sql` ফাইলটি কপি করে Supabase SQL Editor এ পেস্ট করুন এবং রান করুন

## ধাপ ৮: অ্যাপ রিস্টার্ট করা

1. cPanel এর **"Setup Node.js App"** এ আপনার অ্যাপে যান
2. **"Restart"** বাটনে ক্লিক করুন

## ধাপ ৯: ভেরিফাই করা

আপনার ব্রাউজারে আপনার ডোমেইন অ্যাক্সেস করুন:
- `https://yourdomain.com` বা `https://subdomain.yourdomain.com`

সবকিছু ঠিক থাকলে অ্যাপটি লোড হবে।

## সমস্যা সমাধান

### অ্যাপ রান হচ্ছে না?
- cPanel এ **"Setup Node.js App"** এ গিয়ে **"Error Log"** চেক করুন
- Node.js ভার্সন সঠিক কিনা যাচাই করুন
- package.json এ `main` ফিল্ড সঠিক কিনা দেখুন

### 404 এরর আসছে?
- `.output/server/index.mjs` ফাইল আছে কিনা যাচাই করুন
- অ্যাপ startup file পাথ সঠিক কিনা দেখুন

### Supabase কাজ করছে না?
- Environment variables সঠিকভাবে সেট করা হয়েছে কিনা যাচাই করুন
- Supabase প্রজেক্ট URL এবং Key সঠিক কিনা দেখুন

## SSH দিয়ে ডিপ্লয় (অপশনাল, দ্রুত পদ্ধতি)

যদি SSH অ্যাক্সেস থাকে:

```bash
# cPanel এ SSH করুন
ssh username@yourdomain.com

# প্রজেক্ট ফোল্ডারে যান
cd public_html

# package.json তৈরি করুন
cat > package.json << 'EOF'
{
  "name": "likhon-tools",
  "version": "1.0.0",
  "main": "server/index.mjs",
  "scripts": {
    "start": "node server/index.mjs"
  },
  "dependencies": {
    "h3": "^1.12.0"
  }
}
EOF

# এরপর cPanel UI থেকে Node.js অ্যাপ সেটআপ করুন
```

## আপডেট করার পদ্ধতি

যখন নতুন কোড আপডেট করবেন:

1. লোকালে `npm run build` রান করুন
2. `.output` ফোল্ডার cPanel এ আপলোড করুন (পুরানোটি রিপ্লেস করুন)
3. cPanel এ অ্যাপ রিস্টার্ট করুন

## নোট

- এই প্রজেক্টটি SSR (Server-Side Rendering) ব্যবহার করে, তাই সাধারণ static HTML ফাইলের মতো ডিপ্লয় করা যাবে না
- Node.js সার্ভার সবসময় রান করতে হবে
- cPanel এর Node.js অ্যাপ ফিচার ব্যবহার করা হয়েছে যা অ্যাপকে অটোমেটিক রান রাখে

---

## Static + PHP Deployment (মডিউল সিস্টেমের জন্য রেকমেন্ডেড)

মডিউল সিস্টেম ব্যবহার করার জন্য এই পদ্ধতি ব্যবহার করুন। Node.js সার্ভার প্রয়োজন নেই, শুধু PHP প্রয়োজন।

### প্রয়োজনীয় পূর্বশর্ত

- cPanel হোস্টিং অ্যাকাউন্ট (PHP সহ)
- Supabase অ্যাকাউন্ট (ডাটাবেসের জন্য)

### ধাপ ১: লোকাল মেশিনে বিল্ড করা

আপনার লোকাল মেশিনে নিচের কমান্ড রান করুন:

```bash
npm install
npm run build
```

বিল্ড সফল হলে `.output/public/` ফোল্ডার তৈরি হবে।

### ধাপ ২: ফাইলগুলি আপলোড করা

cPanel File Manager এ যান এবং `public_html` এ নিচের ফাইলগুলি আপলোড করুন:

```
public_html/
├── index.html           (বিল্ড থেকে .output/public/index.html)
├── assets/              (বিল্ড থেকে .output/public/assets/)
├── api/                 (প্রজেক্ট থেকে public/api/)
│   ├── modules.php
│   ├── sitemap.php
│   ├── _lib.php
│   └── .cache/          (অটোমেটিক তৈরি হবে)
├── modules/             (প্রজেক্ট থেকে public/modules/)
│   ├── _vendor/
│   └── <your-modules>/
├── tool-seo.php         (প্রজেক্ট থেকে public/tool-seo.php)
├── .htaccess            (প্রজেক্ট থেকে public/.htaccess)
├── config.php           (config.sample.php থেকে কপি করে এডিট করুন)
├── favicon.png
├── robots.txt
└── sitemap.xml
```

**আপলোড করার পদ্ধতি:**
- File Manager ব্যবহার করে ফোল্ডারগুলি আপলোড করুন
- অথবা FTP/SFTP ব্যবহার করুন

### ধাপ ৩: config.php কনফিগার করা

`public_html/config.sample.php` কপি করে `config.php` নামে সেভ করুন এবং এডিট করুন:

```php
<?php
return [
  'site_url' => 'https://www.likhontools.com',  // আপনার ডোমেইন
  'cache_ttl_seconds' => 60,                    // মডিউল ক্যাশ TTL
  'convert_enabled' => false,                  // সার্ভার কনভার্টার ডিসেবল (ডিফল্ট)
  'convert_url' => '',                          // Gotenberg/LibreOffice URL (যদি সক্ষম করেন)
  'convert_key' => '',                          // API key (যদি থাকে)
  'convert_max_upload_mb' => 20,               // ম্যাক্স আপলোড সাইজ
  'convert_rate_limit_per_minute' => 8,        // রেট লিমিট
  'convert_timeout_seconds' => 120,            // টাইমআউট
];
```

### ধাপ ৪: Supabase ডাটাবেস সেটআপ

1. Supabase ড্যাশবোর্ডে যান
2. **SQL Editor** এ যান
3. প্রজেক্টের `supabase/contact-messages.sql` ফাইলের কন্টেন্ট রান করুন
4. অথবা লোকাল প্রজেক্ট থেকে `supabase/contact-messages.sql` ফাইলটি কপি করে Supabase SQL Editor এ পেস্ট করুন এবং রান করুন

### ধাপ ৫: ফোল্ডার পারমিশন সেট করা

cPanel File Manager এ:

1. `public_html/api/.cache/` ফোল্ডারে পারমিশন সেট করুন: `755`
2. অন্য সব ফোল্ডারের পারমিশন: `755`
3. ফাইলের পারমিশন: `644`

### ধাপ ৬: মডিউল ক্যাশ ক্লিয়ার করা

মডিউল আপডেট করার পর ক্যাশ ক্লিয়ার করতে:

1. File Manager এ যান
2. `public_html/api/.cache/modules.json` ফাইল ডিলিট করুন
3. অথবা ৬০ সেকেন্ড অপেক্ষা করুন (অটোমেটিক রিফ্রেশ হবে)

### ধাপ ৭: ভেরিফাই করা

আপনার ব্রাউজারে আপনার ডোমেইন অ্যাক্সেস করুন:
- `https://yourdomain.com` বা `https://subdomain.yourdomain.com`

সবকিছু ঠিক থাকলে অ্যাপটি লোড হবে।

### নতুন মডিউল যোগ করা

1. লোকালে `npm run new-module <slug>` দিয়ে মডিউল তৈরি করুন
2. মডিউল ইমপ্লিমেন্ট করুন
3. `npm run pack-module <slug>` দিয়ে প্যাক করুন
4. `.zip` ফাইল cPanel এ আপলোড করুন
5. `public_html/modules/` এ এক্সট্র্যাক্ট করুন
6. `api/.cache/modules.json` ডিলিট করুন
7. হোম পেজে মডিউল দেখা যাবে

### আপডেট করার পদ্ধতি

যখন নতুন কোড আপডেট করবেন:

1. লোকালে `npm run build` রান করুন
2. `.output/public/` এর কন্টেন্ট cPanel এ আপলোড করুন (পুরানোটি রিপ্লেস করুন)
3. যদি `api/`, `modules/`, `.htaccess` পরিবর্তন হয়, সেগুলিও আপলোড করুন
4. `api/.cache/modules.json` ডিলিট করুন

### মডিউল সমস্যা সমাধান

### মডিউল দেখা যাচ্ছে না?
- `public_html/modules/` ফোল্ডারে মডিউল আছে কিনা চেক করুন
- `module.json` ফাইল সঠিক কিনা ভ্যালিডেট করুন
- `api/.cache/modules.json` ডিলিট করুন
- PHP এরর লগ চেক করুন (cPanel Error Logs)

### API এরর আসছে?
- PHP ভার্সন 7.4 বা উচ্চতর আছে কিনা চেক করুন
- `api/.cache/` ফোল্ডারে লেখার পারমিশন আছে কিনা চেক করুন
- `config.php` সঠিকভাবে কনফিগার করা আছে কিনা চেক করুন
