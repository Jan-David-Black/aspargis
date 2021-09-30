import React, { Component } from 'react';
import { ReactComponent as Template } from './assets/damm.svg'
import { ReactComponent as Thermometer } from './assets/thermometer.svg'
import './assets/damm.css'
class Damm extends Component {
    render() {
        var temps = this.props.temp.map((temp, idx)=>{if(idx) return <p key={idx} className={"damm-elem damm-temp damm-temp"+idx}>{temp.toFixed(2)}°C</p>});
        return (
            <div className="damm-container">
                <Template className="damm-elem damm-bg"/>

                <h3 className="damm-elem damm-name">{this.props.pos}</h3>
                <h4 className="damm-elem damm-sub">{this.props.type}</h4>

                <Thermometer className="damm-elem damm-thermo damm-thermo1"/>
                <Thermometer className="damm-elem damm-thermo damm-thermo2"/>
                <Thermometer className="damm-elem damm-thermo damm-thermo3"/>
                <Thermometer className="damm-elem damm-thermo damm-thermo4"/>
                <p className="damm-elem damm-label damm-label1">0<br/>cm</p>
                <p className="damm-elem damm-label damm-label2">-5<br/>cm</p>
                <p className="damm-elem damm-label damm-label3">-25<br/>cm</p>
                <p className="damm-elem damm-label damm-label4">-40<br/>cm</p>

                {temps}
                
            </div>
        );
    }
}

export default Damm;
    