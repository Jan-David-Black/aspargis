import React, { useState } from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery, gql } from "@apollo/client";
import moment from 'moment';
import 'chartjs-adapter-moment';
import { useParams } from "react-router-dom";
import { Tab, Tabs, Box } from '@mui/material';

const PLOTABLE_DATA = gql`
query PlotData($SGroup: Int!) {
  SGroups_by_pk(SGroup: $SGroup) {
    Position
    Sorte
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

  const handleChange = (event, newValue) => {
    setTab(newValue);
  };

  if (!SGroupID) return ("Something has gone wrong")

  if (error) {
    console.error(error);
    return "Error";
  }
  if (loading) {
    return "Loading";
  }

  let sensors = data.SGroups_by_pk?.Sensors;

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs value={tab} onChange={handleChange}>
        <Tab label="Averages" />
        <Tab label="Min-Max" />
        <Tab label="Full" />
        <Tab label="Battery" />
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
    </Box>);
}

export default Details;


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


