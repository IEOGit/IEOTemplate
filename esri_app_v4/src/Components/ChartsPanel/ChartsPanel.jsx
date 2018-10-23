import React from 'react';
// import ReactDOM from 'react-dom';
import Charts from '../Charts/Charts.jsx';
import { Panel } from 'react-bootstrap';
import './ChartsPanel.css';

// const conf = require('./widgetconfig.json');

export  default class ChartsPanel extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      Chartype: props.Chartype,
      options: props.options,
    };
  }

  componentWillMount() {

  }

  componentDidMount (){

 	}

  componentWillReceiveProps(newProps) {
    this.setState({
      options: newProps.options,
      Chartype: newProps.Chartype
    });
  }

  render(){
    return (
      <Panel id="graphPanelId" className="graphPanel">
        <Charts container='chartPanelGraphic' Chartype={this.state.Chartype} options={this.state.options} />
      </Panel>
    )
  }
}
