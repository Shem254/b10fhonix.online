@echo off
echo === SESE b10fhonix.online - ONE CLICK DEPLOY ===
cd /d "%~dp0"
echo Current folder: %CD%

:: Ensure CNAME exists for your domain
if not exist CNAME (
  echo b10fhonix.online > CNAME
  echo Created CNAME
)

:: Show what changed
git status

:: Pull first to avoid conflict
git pull --rebase origin main

:: Add everything
git add .

:: Commit with timestamp
for /f "tokens=2 delims==" %%I in ('wmic os get localdatetime /value') do set datetime=%%I
set timestamp=%datetime:~0,4%-%datetime:~4,2%-%datetime:~6,2% %datetime:~8,2%:%datetime:~10,2%
git commit -m "Update b10fhonix.online - %timestamp%" 2>nul
if %errorlevel% neq 0 (
  echo No new changes to commit
)

:: Push
git branch -M main
git push -u origin main

echo.
echo === DONE ===
echo Check: https://github.com/YOURUSERNAME/b10fhonix.online/actions
echo Live at: https://b10fhonix.online in 1-2 mins
pause