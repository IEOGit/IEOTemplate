import React from 'react';
import './ComponentTemplate.css';
//import esriLoader from 'esri-loader';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";

const conf = require('./widgetconfig.json');

export default class ComponentTemplate extends React.Component {
  constructor(props) {
    super(props);

    this.state = {view:props.view, labels:conf.labels}
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this,conf));

  }

  componentWillUpdate(nextProps, nextState) {
  }

  componentWillMount() {
  }

  componentDidMount () {
  }

  render(){
    return(
      <div>{StaticDevTools._getLabel(0,conf)}</div>
    );
  }
}
