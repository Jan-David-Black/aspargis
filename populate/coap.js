const coap = require('coap')
const server = coap.createServer()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

server.on('request', function (req, res) {
    const randomTemp = (Math.random() * 5) + 10;
    const where = req.url.split('/')[1];
    fetch(
      `http://localhost:8080/v1alpha1/graphql`,
      {
        method: 'POST',
        headers: {"X-Hasura-Admin-Secret":"mylongsecretkey"},
        body: JSON.stringify({
          query: `
            mutation ($temp: numeric, $where: String) {
              insert_temperature (
                objects: [{
                  temperature: $temp
                  location: $where
                }]
              ) {
                returning {
                  recorded_at
                  temperature
                }
              }
            }
          `,
          variables: {
            temp: randomTemp,
            where: where
          }
        })
      }
    ).then((resp) => resp.json().then((respObj) => {
        console.log(JSON.stringify(respObj, null, 2));
        res.end(JSON.stringify(respObj, null, 2));
    }));
})

// the default CoAP port is 5683
server.listen(function () {
    console.log('server started')
})
