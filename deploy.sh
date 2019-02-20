#!/bash/bin

echo "transfer started..."
rsync -r --delete-after $TRAVIS_BUILD_DIR/dist deploy@46.101.209.6:dist
echo "content transfered"

ssh -t deploy@iot.itprof.sk 'cd dist/dist; npm i; pm2 restart ./main.js; pm2 monit'
