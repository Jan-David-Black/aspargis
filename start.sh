#!/bin/bash 

cd time-series-chart
npm start &
echo "Started React app"
cd ..

cd populate
node -r dotenv/config coap.js &
echo "Started COAP server"
cd ..

wait