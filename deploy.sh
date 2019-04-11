#!/bash/bin

echo "transfer started..."
rsync -r --delete-after $TRAVIS_BUILD_DIR/dist deploy@104.248.18.71:be-dist
echo "content transfered"

ssh -t deploy@104.248.18.71 'cd be-dist/dist; npm i; pm2 restart be-app || pm2 start ./main.js --name="be-app"; exit'
