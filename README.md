# লিখন টুলস

বাংলা ও ইংরেজি লেখালেখি, কনভার্টার, ছবি সম্পাদনা, ক্যালকুলেটর এবং যোগাযোগের সুবিধাসহ একটি bilingual web app।

## লোকাল ডেভেলপমেন্ট

প্রয়োজন: Node.js এবং npm।

```sh
npm install
npm run dev
```

Production build:

```sh
npm run build
```

## Supabase কনফিগারেশন

1. `.env.example` কপি করে `.env.local` তৈরি করুন।
2. নিজের Supabase project-এর URL ও publishable key দিন:

   ```env
   VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
   VITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY
   ```

3. Supabase SQL Editor-এ `supabase/contact-messages.sql` চালান।
4. Admin account ও অব্যবহৃত ইমেইল পরিষ্কারের নির্দেশনার জন্য `supabase/SETUP.md` দেখুন।

`.env.local` Git-এ উপেক্ষা করা হয়। কোনো `service_role` বা secret key কখনো browser code বা `VITE_*` variable-এ দেবেন না।

## বাসা ও অফিসে কাজ

Private GitHub repository-তে কোড রাখার পর প্রতিটি কম্পিউটারে একবার clone করে dependencies install করুন। কাজ শুরু করার আগে `git pull`, আর কাজ শেষে পরিবর্তন commit করে `git push` করুন; অন্য কম্পিউটারে পরেরবার কাজের আগে আবার `git pull` করুন। একই সময়ে দুই জায়গায় একই ফাইল বদলালে Git merge conflict দেখাতে পারে—তাই একবারে এক জায়গায় কাজ করে push/pull করা সহজ।
