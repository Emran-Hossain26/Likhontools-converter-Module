@echo off
REM cPanel ডিপ্লয়মেন্টের জন্য ফাইল প্রস্তুতকরণ স্ক্রিপ্ট (Windows)

echo cPanel ডিপ্লয়মেন্টের জন্য ফাইল প্রস্তুত করা হচ্ছে...

REM ডিপ্লয়মেন্ট ফোল্ডার তৈরি
if exist cpanel-deploy rmdir /s /q cpanel-deploy
mkdir cpanel-deploy

REM .output ফোল্ডার কপি করা
echo .output ফোল্ডার কপি করা হচ্ছে...
xcopy /E /I .output cpanel-deploy\.output

REM cPanel এর জন্য package.json কপি করা
echo package.json কপি করা হচ্ছে...
copy cpanel-package.json cpanel-deploy\package.json

REM .gitignore তৈরি (node_modules বাদ দিতে)
echo node_modules > cpanel-deploy\.gitignore

echo.
echo ✅ ফাইল প্রস্তুত সম্পন্ন!
echo.
echo এখন cpanel-deploy ফোল্ডারটি আপনার cPanel এ আপলোড করুন:
echo   - File Manager ব্যবহার করে cpanel-deploy ফোল্ডারটি zip করে আপলোড করুন
echo   - অথবা FTP/SFTP ব্যবহার করুন
echo.
echo আপলোড করার পর CPANEL_DEPLOYMENT.md ফাইলের নির্দেশনা অনুসরণ করুন
pause
