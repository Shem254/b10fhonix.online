@echo off
cd /d "%~dp0"
echo === SESE V3 CLEAN FIX ===
rmdir /s /q src 2>nul
del /q src.zip 2>nul
del /q SESE_V3.zip 2>nul
echo b10fhonix.online > CNAME
git add -A
git status
git commit -m "SESE V3 clean - single file engine - fix nested src"
git push -u origin main
echo === DONE - Check https://shem254.github.io/b10fhonix.online/ after 60s ===
pause