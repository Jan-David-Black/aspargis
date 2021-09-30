import React, { Component } from 'react';
import gql from 'graphql-tag';
import { Query } from 'react-apollo';
import SGroup from './SGroup.js';

const GROUPS_OVERVIEW= gql`
query Overview {
  SGroups {
    SGroup
    Position
    Spargelsorten {
      Name
    }
    Sensors {
      Correction_Sensorpositions {
        pos
      }
      Type
      Sensor_Values(limit: 1, order_by: {Timestamp: desc}) {
        Timestamp
        Value
      }
    }
  }
}
`

class App extends Component {
  render() {
    return (
        <Query query={GROUPS_OVERVIEW}>
          {
            ({data, error, loading}) => {
              if (error) {
                console.error(error);
                return "Error";
              }
              if (loading) {
                return "Loading";
              }

              console.log({data});
              const overview = data.SGroups.map((group)=><SGroup key={group.SGroup} group={group}/>);
              return (
                <div className="overview-container">
                  {overview}
                </div>
              );
            }
          }
        </Query>
    );
  }
}

export default App;
