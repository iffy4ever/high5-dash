@echo off
echo Updating GitHub with timestamp...

git add .
git commit -m "Update: %date% %time%"
git push origin main

if %errorlevel% equ 0 (
    echo ✅ SUCCESS: GitHub updated!
    echo Vercel will auto-deploy shortly.
) else (
    echo ❌ ERROR: Push failed!
)

pause