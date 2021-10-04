import React from 'react';
import { Line } from 'react-chartjs-2';
import { useQuery, gql } from "@apollo/client";
import moment from 'moment';
import { useParams } from "react-router-dom";

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
  const { loading, error, data } = useQuery(PLOTABLE_DATA, {variables:{SGroup: SGroupID}});
  if (!SGroupID) return ("Something has gone wrong")

  if (error) {
    console.error(error);
    return "Error";
  }
  if (loading) {
    return "Loading";
  }

  let chartJSData = {
    labels: [],
    datasets: []
  };
  data.SGroups_by_pk?.Sensors.forEach((sensor, idx) => {
    let ds = {
      label: "test" + idx,
      data: [],
      fill: false,
      pointRadius: 0
    };
    if (sensor.Type === "v_bat") return;
    sensor.Sensor_Values.forEach((item) => {
      const humanReadableTime = moment(item.Timestamp).format('LTS');
      if (!idx) chartJSData.labels.push(humanReadableTime);
      ds.data.push(item.Value);
    })
    chartJSData.datasets.push(ds);

  });
  console.log(chartJSData);

  return (
    <div
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px' }}
    >
      <Line
        data={chartJSData}
        plugins={{
          colorschemes: {
            scheme: 'brewer.Paired12'
          }
        }}

        options={{
          scales: {
            xAxes: [{
              type: 'time',
              display: true,
              time: {
                unit: 'day',
                displayFormats: {
                  hour: 'MMM D'
                }
              },
              scaleLabel: {
                display: true
              },
              //ticks:{
              //  min: min_date
              //}
            }],
            yAxes: [{
              scaleLabel: {
                labelString: 'Temp in °C',
                display: true
              }
            }]
          }
        }}

      />
    </div>
  );
}

export default Details;
