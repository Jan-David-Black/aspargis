if ! command -v "npm -v" &> /dev/null
then
    echo "npm could not be found testung to source .bashrc"
    source ~/.bashrc
fi


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