#!/usr/bin/env node

const coap = require('coap');
const process = require('process');
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

const query = `query readAlarms($SGroup: Int!) {
  SGroups_by_pk(SGroup: $SGroup) {
    Alarm
    shares {
      Alarm
      userByUser {
        subscriptions
      }
    }
    User {
      subscriptions
    }
    Position
  }
}`

function IsJsonString(str) {
  try {
      JSON.parse(str);
  } catch (e) {
      return false;
  }
  return true;
}

server.on('request', async function (req, res) { //TODO add alarms to new format also
    console.log("request received");
    let payloadStr = req.payload.toString();

    let SGroup, Sensors;

    if(IsJsonString(payloadStr)){
      console.log("Old request format");
      const payload = JSON.parse(payloadStr);
      SGroup = req.url.split("/")[2];

      let response = await fetch(
        process.env.HASURA_API,
        {
          method: 'POST',
          headers: {"X-Hasura-Admin-Secret":process.env.HASURA_GRAPHQL_ACCESS_KEY},
          body: JSON.stringify({
            query: query,
            variables: {
              SGroup: SGroup
            }
          })
        }
      )

      response = await response.json();

      console.log("alert query respone: ",response);
      const al_resp = response.data.SGroups_by_pk;
      let alarms = []
      if(al_resp.Alarm){
        alarms.push({alarm: al_resp.Alarm, sub: al_resp.User.subscriptions, triggered:false})
      }
      al_resp.shares.forEach((share) => {
        if(share.Alarm){
          alarms.push({alarm: share.Alarm, sub: share.userByUser.subscriptions, triggered:false})
        }
      });

      const addresses = payload.sensAddr ? payload.sensAddr : [];
      const vals = payload.payload[0].Values;
      Sensors = [];
      const typeToNum = {"temp1":0, "temp2":1, "temp3":2, "temp4":3};

      //console.log({vals, addresses});

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
        Sensors.push(sens);
        if(type.includes("temp")){
          alarms.forEach((alarm)=>{
            if(vals[type]>alarm.alarm){
              alarm.triggered = true;
            }
          });
        }
      }

      console.log({alarms});
      alarms.forEach((alarm)=>{
        if(alarm.triggered && alarm.sub){
          fetch(
            process.env.PUSHER,
            {
              method: 'POST',
              headers: {"content-type": "application/json"},
              body: JSON.stringify({
                sub: alarm.sub, name: al_resp.Position, id:SGroup
              })
            }
          ).then((resp)=>{console.log("resp: ", resp)}).catch((e)=>{console.log("error: ", e)})
        }
      });
    } else {
      console.log("New request Format");
      const slices={
        dev : [4,12],
        ver: [12,16],
        bat: [16,20],
        sig: [20,22],
        mod: [22,24],
        adc: [24,28],
        temp1 : [28, 32],
        temp2 : [32, 36],
        temp3 : [36, 40],
        temp4 : [40, 44],
        time: [44,52]
      }
      let payload = {};
      for (const prop in slices){
        const slice = slices[prop];
        payload[prop] = payloadStr.slice(slice[0], slice[1]);
        if(prop!=="dev") payload[prop] = parseInt(Number("0x"+payload[prop]), 10)
        if(prop.includes("temp")) payload[prop] = payload[prop] / 10
      }
      console.log({payload});
  
      Sensors = [];
      //console.log(vals);
      for(type in payload){
        if(type in ['dev', 'time', 'ver', 'mod']) continue;
        const sens = {
          Type: type, 
          Sensor_Values: {
            data: {
              Value: payload[type]
            }
          }
        }
        //console.log(sens);
        Sensors.push(sens);
      }
      SGroup = Number(payload["dev"]);
    }

    console.log({Sensors});

    fetch(
      process.env.HASURA_API,
      {
        method: 'POST',
        headers: {"X-Hasura-Admin-Secret":process.env.HASURA_GRAPHQL_ACCESS_KEY},
        body: JSON.stringify({
          query: mutation,
          variables: {
            Sensors: Sensors,
            SGroup: SGroup
          }
        })
      }
    ).then((resp) => resp.json().then((respObj) => {
      console.log("Hasura has responded:")
      console.log(JSON.stringify(respObj, null, 2));
      res.end("Transmission Success");
    })).catch(function(e) {
      console.log("transmission error:", e);
      res.end("Transmission Error");
    });    
})

// the default CoAP port is 5683
server.listen(5683, function () {
    console.log('v1.0.0')
    console.log('server started. PID:', process.pid)
})
