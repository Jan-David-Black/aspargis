const coap = require('coap')
const dotenv = require('dotenv');
dotenv.config();
const server = coap.createServer()
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const mutation = `mutation InsertTempsFully ($SGroup: Int!, $Sensors: [Sensors_insert_input!]!){
  insert_SGroups(
    objects:{
      SGroup: $SGroup, 
      Sensors: {
        data: $Sensors, on_conflict:{constraint: Sensors_SGroup_Type_key, update_columns: SGroup}
      }
    }, on_conflict:{constraint: SGroups_pkey, update_columns: SGroup}
  ){
    affected_rows
  }
}`

const typeToNum = {"temp1":0, "temp2":1, "temp3":2, "temp4":3}
server.on('request', function (req, res) {
    const payload = JSON.parse(req.payload.toString());
    const SGroup = req.url.split("/")[2];
    res.end("Transmission Success");
    const addresses = payload.sensAddr ? payload.sensAddr : [];
    const vals = payload.payload[0].Values;
    let Sensors = [];
    console.log(vals);
    for(type in vals){
      const sens = {
        Address: addresses[typeToNum[type]], 
        Type: type, 
        Sensor_Values: {
          data: {
            Value: vals[type]
          }
        }
      }
      console.log(sens);
      Sensors.push(sens);
    }
    console.log({Sensors});
    fetch(
      `http://localhost:8080/v1alpha1/graphql`,
      {
        method: 'POST',
        headers: {"X-Hasura-Admin-Secret":process.env.SECRET},
        body: JSON.stringify({
          query: mutation,
          variables: {
            Sensors: Sensors,
            SGroup: SGroup
          }
        })
      }
    ).then((resp) => resp.json().then((respObj) => {
        console.log(JSON.stringify(respObj, null, 2));
    }));
})

// the default CoAP port is 5683
server.listen(function () {
    console.log('server started')
})
