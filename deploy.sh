#!/bash/bin

echo "transfer started..."
rsync -r --delete-after $TRAVIS_BUILD_DIR/dist deploy@104.248.18.71:dist
echo "content transfered"

ssh -t deploy@104.248.18.71 'cd dist/dist; npm i; pm2 restart be-app || pm2 start ./main.js --name="be-app"; rm -rf dist; exit'
