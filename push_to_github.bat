@echo off
echo ==========================================
echo Livia App - GitHub Update Script
echo ==========================================
echo.

echo 1. Adding all changes...
git add .

echo.
echo 2. Committing changes...
git commit -m "Update Livia App: Guest Mode Fix & Financial Overview"

echo.
echo 3. Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo Update Complete!
echo ==========================================
pause
