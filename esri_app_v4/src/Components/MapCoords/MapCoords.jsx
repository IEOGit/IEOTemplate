import React from 'react';
import './MapCoords.css';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
const conf = require('./widgetconfig.json');

export  default class MapCoords extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      x:0,
      y:0,
      units: (conf.EPSG === "4326") ? ["longitude", "latitude"] : ["x", "y"],
      measureUnits: (conf.EPSG === "4326") ? ["º", "º"] : ["m", "m"],
      view:props.view,
      position:"bottom-left"};
    this.props.view.on('pointer-move', this.mousemove.bind(this));
  }

  componentDidMount () {
    document.getElementsByClassName("MapCoords")[0].style.color = conf.color;
  }

  mousemove(e){
    let point;
    point = this.state.view.toMap({x: e.x, y: e.y});
    this.setState({x:point[this.state.units[0]].toFixed(conf.decimals) + this.state.measureUnits[0], y:point[this.state.units[1]].toFixed(conf.decimals) + this.state.measureUnits[1]});
  }

  render(){
    return(
      <div className='MapCoords'>
        <label>{conf.label_X[StaticDevTools._getLocale()]} {this.state.x} </label>
        <label className='coordY'>{conf.label_Y[StaticDevTools._getLocale()]} {this.state.y} </label>
      </div>
    );
  }
}
