docker kill $(docker ps -q)
docker rm $(docker ps -a -q)
docker-compose up -d

if [ ! -d time-series-chart/node_modules ]; then
    cd time-series-chart
    npm install
    cd ..
fi 

if [ ! -d populate/node_modules ]; then
    cd populate
    npm install
    cd ..
fi 

cd time-series-chart
npm start &
echo "here"
cd ..

cd populate
node -r dotenv/config coap.js &
echo "here2"
cd ..

wait