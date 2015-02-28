# Install on /assets
echo "Running NPM on /assets..."    
(npm install .)

# Loop in the apps folder
for i in $(find js/apps/ -type d -maxdepth 1)
do
    if [ -a "$i/package.json" ] # Only run on folders that have a package.json
    then
        echo "Running NPM on $i..."    
        (cd "$i"; npm install .)
    fi
done
echo "Done!"