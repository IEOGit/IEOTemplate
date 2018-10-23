import React from 'react';
import esriLoader from 'esri-loader';
import './LegendComponent.css';

// const conf = require('./widgetconfig.json');

const appconf = require('../../appconf.json');



export  default class LegendComponent extends React.Component {

  constructor(props) {
    super(props);
    this.state = {value:'', view:props.view, legend:null};

    esriLoader.loadModules([
      "esri/widgets/Legend",
      'react-dom'

    ], appconf.esriversion)
    .then(([Legend, ReactDOM]) => {

      var legend = new Legend({
        view: this.props.view,
        container: "leyenda_container"
      });
      this.setState({"legend": legend});
      legend.renderNow();

    }).catch(err => {
        console.error(err);
      });

  }

  componentDidMount(){


  }

  render(){
    return(
      <div id="leyenda_container"></div>
    );
  }
}
