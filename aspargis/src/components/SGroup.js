import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import Damm from './Damm';

class SGroup extends Component {
  render() {
    var temps = [0,0,0,0];
    this.props.group.Sensors.forEach((sensor) => {
      let pos = sensor.Correction_Sensorpositions[0]?.pos
      pos = pos ? pos : sensor.Type.charAt(4);
      temps[pos] = sensor.Sensor_Values[0].Value;
    });

    return (
      <Link to={`/details/${this.props.group.SGroup}`}>
        <Damm 
          temp={temps} 
          pos={this.props.group.Position} 
          type={this.props.group.Spargelsorten?.Name}
        />
      </Link>
    );
  }
}

export default SGroup;
