@echo off
echo ==========================================
echo Livia App - GitHub Sync Fix
echo ==========================================
echo.
echo This script will download any changes from GitHub (like the README)
echo and merge them with your local code, then upload everything.
echo.

echo 1. Pulling remote changes...
git pull origin main --allow-unrelated-histories --no-edit

echo.
echo 2. Pushing to GitHub...
git push origin main

echo.
echo ==========================================
echo Sync Complete!
echo ==========================================
pause
