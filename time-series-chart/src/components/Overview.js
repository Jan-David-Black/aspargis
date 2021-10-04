import React from 'react';
import { useQuery, gql } from "@apollo/client";
import SGroup from './SGroup.js';
import { Fab } from '@mui/material';
import '../assets/fab.css';
import AddIcon from '@mui/icons-material/Add';

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
    return "Loading";
  }

  console.log({ data });
  const overview = data.SGroups.map((group) => <SGroup key={group.SGroup} group={group} />);
  return (
    <div className="overview-container">
      {overview}
      <Fab color="primary" aria-label="add" className="fab">
        <AddIcon />
      </Fab>
    </div>
  );
}

export default Overview;
