#!/bin/bash

# cPanel ডিপ্লয়মেন্টের জন্য ফাইল প্রস্তুতকরণ স্ক্রিপ্ট

echo "cPanel ডিপ্লয়মেন্টের জন্য ফাইল প্রস্তুত করা হচ্ছে..."

# ডিপ্লয়মেন্ট ফোল্ডার তৈরি
rm -rf cpanel-deploy
mkdir -p cpanel-deploy

# .output ফোল্ডার কপি করা
echo ".output ফোল্ডার কপি করা হচ্ছে..."
cp -r .output cpanel-deploy/

# cPanel এর জন্য package.json কপি করা
echo "package.json কপি করা হচ্ছে..."
cp cpanel-package.json cpanel-deploy/package.json

# .gitignore তৈরি (node_modules বাদ দিতে)
echo "node_modules" > cpanel-deploy/.gitignore

echo ""
echo "✅ ফাইল প্রস্তুত সম্পন্ন!"
echo ""
echo "এখন cpanel-deploy ফোল্ডারটি আপনার cPanel এ আপলোড করুন:"
echo "  - File Manager ব্যবহার করে cpanel-deploy ফোল্ডারটি zip করে আপলোড করুন"
echo "  - অথবা FTP/SFTP ব্যবহার করুন"
echo ""
echo "আপলোড করার পর CPANEL_DEPLOYMENT.md ফাইলের নির্দেশনা অনুসরণ করুন"
