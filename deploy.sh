#!/bash/bin

echo "transfer started..."
rsync -r --delete-after $TRAVIS_BUILD_DIR/dist deploy@46.101.209.6:dist
echo "content transfered"
ls -la
whoami

