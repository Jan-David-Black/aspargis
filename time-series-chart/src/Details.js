import React, { Component } from 'react';
import { Line } from 'react-chartjs-2';
import { Subscription } from 'react-apollo';
import gql from 'graphql-tag';
import moment from 'moment';

const PLOT_DATA_SUBSCRIPTION= gql`
subscription PlotData($SGroup: Int!) {
  SGroups_by_pk(SGroup: $SGroup) {
    Position
    Sorte
    Sensors {
      Type
      Correction_Sensorpositions {
        pos
      }
      Sensor_Values {
        Timestamp
        Value
      }
    }
  }
}
`

class Details extends Component {
  render() {
    return (
      <div
        style={{display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '20px'}}
      >
        <Subscription subscription={PLOT_DATA_SUBSCRIPTION} variables={{SGroup:1}}>
          {
            ({data, error, loading}) => {
              if (error) {
                console.error(error);
                return "Error";
              }
              if (loading) {
                return "Loading";
              }
              let chartJSData = {
                labels: [],
                datasets: [{
                  label: "0cm",
                  data: [],
                  pointBackgroundColor: [],
                  borderColor: 'brown',
                  fill: false
                }]
              };
              console.log({data});
              const sensor = data.SGroups_by_pk.Sensors[0];
              sensor.Sensor_Values.forEach((item) => {
                const humanReadableTime = moment(item.Timestamp).format('LTS');
                chartJSData.labels.push(humanReadableTime);
                chartJSData.datasets[0].data.push(item.Value);
              })
              return (
                <Line
                  data={chartJSData}
                />
              );
            }
          }
        </Subscription>
      </div>
    );
  }
}

export default Details;
