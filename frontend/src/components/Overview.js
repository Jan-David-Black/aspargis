import React from 'react';
import { useQuery, gql } from "@apollo/client";
import SGroup from './SGroup.js';
import '../assets/fab.css';
import QrAddDialog from './QrAddDialog.js';
import {LinearProgress} from "@mui/material";

const GROUPS_OVERVIEW = gql`
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

function Overview() {
  const { loading, error, data } = useQuery(GROUPS_OVERVIEW);
  if (error) {
    console.error(error);
    return "Error";
  }
  if (loading) {
    return <LinearProgress/>
  }

  console.log({ data });
  const overview = data.SGroups.map((group) => <SGroup key={group.SGroup} group={group} />);
  return (
    <div className="overview-container">
      {overview}
      <QrAddDialog/>
    </div>
  );
}

export default Overview;
