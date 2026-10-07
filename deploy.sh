cd "C:/Users/Osena/Downloads/kenya  Copy/b10fhonix.online"

# Rename correctly
ren index index.html 2>nul
# or if already index.html, skip
dir

# Make sure CNAME is correct
echo b10fhonix.online > CNAME

# Force add with correct name
git add index.html CNAME --force
git commit -m "Fix: rename index to index.html - OpenArt design"
git push -u origin main