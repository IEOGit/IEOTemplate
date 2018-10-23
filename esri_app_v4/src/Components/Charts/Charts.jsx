import React from 'react';
import Highcharts from 'highcharts';
import Highstock from 'highcharts/highstock';
import exporting from 'highcharts/modules/exporting.js';
// const ReactHighstock = require('highcharts/highstock');

export  default class Charts extends React.Component {
  // When the DOM is ready, create the chart.
  componentDidMount () {
      // Extend Highcharts with modules
      if (this.props.modules) {
          this.props.modules.forEach(function (module) {
              module(Highcharts);
          });
      }

      switch (this.props.Chartype) {
        case "HighChart":
        exporting(Highcharts);
        // Set container which the chart should render to.
        this.chart = new Highcharts[this.props.type || "Chart"](
          this.props.container,
          this.props.options
        );
        break;
        case "HighStock":
        exporting(Highstock);
        // Set container which the chart should render to.
        this.chart = new Highstock.stockChart(
          this.props.container,
          this.props.options
        );
        break;
        default:

      }
  }
  //Destroy table before unmount.
  componentWillUnmount () {
      this.chart.destroy();
  }

  componentWillReceiveProps(newProps) {
    this.setState({container: newProps.container});
    this.setState({options: newProps.options});
    this.chart.update(newProps.options);
  }


  //Create the div which the table will be rendered to.
  render () {
    return React.createElement('div', { id: this.props.container });
  }
}
