#!/bin/bash
cd "$(dirname "$0")"
echo "=== SESE b10fhonix.online - ONE CLICK DEPLOY ==="
echo "Folder: $(pwd)"

# Ensure CNAME
if [ ! -f "CNAME" ]; then
  echo "b10fhonix.online" > CNAME
fi

git status
git pull --rebase origin main || true
git add .
git commit -m "Update b10fhonix.online - $(date '+%Y-%m-%d %H:%M')" || echo "No changes"
git branch -M main
git push -u origin main

echo "=== DONE - Live at https://b10fhonix.online ==="