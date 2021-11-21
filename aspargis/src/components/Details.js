import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery, useMutation, gql } from "@apollo/client";
import moment from 'moment';
import 'chartjs-adapter-moment';
import { useParams } from "react-router-dom";
import { Tab, Tabs, Box, LinearProgress, TextField, Button } from '@mui/material';
import { useAuth0 } from "@auth0/auth0-react";
import ShareDialog from './ShareDialog';

const PLOTABLE_DATA = gql`
query PlotData($SGroup: Int!) {
  SGroups_by_pk(SGroup: $SGroup) {
    Position
    Sorte
    Owner
    Alarm
    shares {
      User
      userByUser {
        email
      }
      Alarm
    }
    Sensors {
      Type
      Correction_Sensorpositions {
        pos
      }
      Daily {
        avg
        max
        date_trunc
      }
      Sensor_Values{
        Timestamp
        Value
      }
    }
  }
}
`

function Details(props) {
  let { SGroupID } = useParams();
  const { loading, error, data } = useQuery(PLOTABLE_DATA, { variables: { SGroup: SGroupID } });
  const [tab, setTab] = useState(0);
  const { user } = useAuth0();

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  if (!SGroupID) return ("Something has gone wrong")

  if (error) {
    console.error(error);
    return "Error";
  }
  if (loading) {
    return <LinearProgress/>;
  }

  const sensors = data.SGroups_by_pk.Sensors;
  const owner = data.SGroups_by_pk.Owner;
  const owned = owner === user.sub;

  const shares = data.SGroups_by_pk.shares.map((share)=>({email:share.userByUser.email, user:share.User}))

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="Averages" />
        <Tab label="Min-Max" />
        <Tab label="Full" />
        <Tab label="Battery" />
        <Tab label="Alarm" />
      </Tabs>
        <TabPanel value={tab} index={0}>
          <AvgPlot sensors={sensors} />
        </TabPanel>
        <TabPanel value={tab} index={1}>
          TODO
        </TabPanel>
        <TabPanel value={tab} index={2}>
          <FullPlot sensors={sensors}/>
        </TabPanel>
        <TabPanel value={tab} index={3}>
          <BatPlot sensors={sensors}/>
        </TabPanel>
        <TabPanel value={tab} index={4}>
          <Alarm {...{owned, user, SGroupID}} alarm={
            owned?
              data.SGroups_by_pk.Alarm:
              data.SGroups_by_pk.shares.find((share)=>share.User===user.sub).Alarm}/>
        </TabPanel>
        {owned ? 
          <>
            <ShareDialog SGroupID={SGroupID} shares={shares}/> 
          </>
        : "shared with you"}
    </Box>);
}

export default Details;

const SET_OWNED_ALARM=gql`
mutation setOwnedAlarm($SGroup: Int!, $Alarm: float8!) {
  update_SGroups_by_pk(pk_columns: {SGroup: $SGroup}, _set: {Alarm: $Alarm}) {
    Alarm
  }
}
`

const SET_SHARED_ALARM=gql`
mutation setSharedAlarm($SGroup: Int!, $User: String!, $Alarm: float8!) {
  update_share_by_pk(pk_columns: {SGroup: $SGroup, User: $User}, _set: {Alarm: $Alarm}) {
    Alarm
  }
}

`

function Alarm(props){
  const [alarm, setAlarm] = useState(props.alarm)
  const [setOwnedAlarm] = useMutation(SET_OWNED_ALARM);
  const [setSharedAlarm] = useMutation(SET_SHARED_ALARM);

  const clear = () =>{
    setAlarm("");
    saveAlarm("");
  }
  const handleChange = (e) =>{
    setAlarm(e.target.value)
    saveAlarm(e.target.value)
  }
  const saveAlarm=(alarm)=>{
    let toSave = alarm;
    if(alarm==="") toSave=null;

    if(props.owned){
      setOwnedAlarm({variables:{SGroup:props.SGroupID, Alarm:toSave}})
    }else{
      setSharedAlarm({variables:{SGroup:props.SGroupID, Alarm:toSave, User:props.user.sub}})
    }
  }
  return(
      <>
        <TextField
          label="Temperature alarm"
          type="number"
          inputProps={{ min: "12", max: "30", step: ".1" }} 
          InputLabelProps={{shrink: true}}
          value = {alarm}
          onChange = {handleChange}
        />
        <Button onClick={clear}>Clear</Button>
      </>
  )
}

function AvgPlot(props) {
  let chartJSData = {
    labels: [],
    datasets: []
  };

  props.sensors.forEach((sensor, idx) => {
    if (sensor.Type === "v_bat") return;
    const pos = sensor.Correction_Sensorpositions.pos ?? idx;
    let ds = {
      label: "temp" + pos,
      data: []
    };
    sensor.Daily.forEach((item) => {
      const humanReadableTime = moment(item.date_trunc);
      if (!idx) chartJSData.labels.push(humanReadableTime);
      ds.data.push(item.max);
    })
    chartJSData.datasets.push(ds);
  });

  return (
    <Line
      data={chartJSData}
      options={{
        normalized: true,
        elements: { point: { radius: 0 } },
        scales: {
          x: { type: 'time' },
          y: { type: 'linear' }
        }
      }}
    />
  );
}

function BatPlot(props) {
  let chartJSData = {
    labels: [],
    datasets: []
  };

  props.sensors.forEach((sensor, idx) => {
    if (sensor.Type !== "v_bat") return;
    let ds = {
      label: "bat",
      data: []
    };
    sensor.Daily.forEach((item) => {
      const humanReadableTime = moment(item.date_trunc);
      chartJSData.labels.push(humanReadableTime);
      ds.data.push(item.max);
    })
    chartJSData.datasets.push(ds);
  });

  return (
    <Line
      data={chartJSData}
      options={{
        normalized: true,
        elements: { point: { radius: 0 } },
        scales: {
          x: { type: 'time' },
          y: { type: 'linear' }
        }
      }}
    />
  );
}

function FullPlot(props) {
  let chartJSData = {
    labels: [],
    datasets: []
  };
  props.sensors.forEach((sensor, idx) => {
    const pos = sensor.Correction_Sensorpositions.pos ?? idx;
    let ds = {
      label: "temp" + pos,
      data: []
    };
    if (sensor.Type === "v_bat") return;
    sensor.Sensor_Values.forEach((item) => {
      const humanReadableTime = moment(item.Timestamp);
      if (!idx) chartJSData.labels.push(humanReadableTime);
      ds.data.push(item.Value);
    })
    chartJSData.datasets.push(ds);
  });

  return (
    <Line
      data={chartJSData}
      options={{
        normalized: true,
        elements: { point: { radius: 0 } },
        scales: {
          x: { type: 'time' },
          y: { type: 'linear' }
        }
      }}
    />
  );
}



function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px' }}>
          {children}
        </div>
      )}
    </div>
  );
}


