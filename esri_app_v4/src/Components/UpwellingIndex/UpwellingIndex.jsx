import React from 'react';
import ReactDOM from 'react-dom';
import moment from 'moment';
import './UpwellingIndex.css';
import esriLoader from 'esri-loader';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import Select2 from 'react-select2-wrapper';
import Charts from '../Charts/Charts.jsx';
import 'datatables.net';
import 'datatables.net-bs/js/dataTables.bootstrap';
import 'datatables.net-bs/css/dataTables.bootstrap.css';

import $ from 'jquery';

const appconf = require('../../appconf.json');

const conf = require('./widgetconfig.json');

export default class UpwellingIndex extends React.Component {
  constructor(props) {
    super(props);

    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    this._insertSerie = this._insertSerie.bind(this);
    this._removeSerie = this._removeSerie.bind(this);
    this._insertOneSerie = this._insertOneSerie.bind(this);
    this._insertCompareYears = this._insertCompareYears.bind(this);
    this._toogleSeveralyearsPanel = this._toogleSeveralyearsPanel.bind(this);
    this._showSeveralYearsPanel = this._showSeveralYearsPanel.bind(this);
    this._stationChanged = this._stationChanged.bind(this);
    this._createTable = this._createTable.bind(this);
    this._createGraph = this._createGraph.bind(this);
    this._getColor = this._getColor.bind(this);

    this.state = {
      labels: conf.labels,
      rgbColors: conf.UpwellingIndexConfig.colorSelected,
      colorSelected: 0,
      severalYears: false,
      stations: this._createComboStations(),
      years: this._createComboYears(),
      selectedStation: null,
      yearSelected: null,
      startYearSelected: null,
      endYearSelected: null,
      series: {},
      chartUpwelling: null
    };


  }

  _insertSerie(){
    (this.state.severalYears) ? this._insertCompareYears() : this._insertOneSerie();
  }

  _removeSerie(){
    console.log(this);
  }

  _insertOneSerie(){
    let selectedStation, urlxml;
    selectedStation = this.state.selectedStation;
    urlxml = "http://test1.2carto.com/utils/refrescaurl.php?url=http://www.indicedeafloramiento.ieo.es/xml/" + selectedStation + "_mensual.xml";

    fetch(urlxml, {
       method: 'post',
     })
     .then(response => response.text())
     .then(str => (new window.DOMParser()).parseFromString(str, "text/xml"))
     .then(data => this._createSerie(data));
  }

  _insertCompareYears(){
    console.log('insertCompareYears');
  }

  _toogleSeveralyearsPanel(event){
    this.setState({
      severalYears: !this.state.severalYears
    },
    () => {
      this._showSeveralYearsPanel();
    });
  }

  _showSeveralYearsPanel(){
    let yearsPanel, oneYearPanel;
    yearsPanel = document.getElementById('severalYearsPanel');
    oneYearPanel = document.getElementById('oneYearPanel');

    if (this.state.severalYears){
      yearsPanel.style.display = 'block';
      oneYearPanel.style.display = 'none';
    }
    else {
      yearsPanel.style.display = 'none';
      oneYearPanel.style.display = 'block';
    }
  }

  _createComboStations = () => {
    let options;
    options = [];
    conf.UpwellingIndexConfig.stations.forEach(function(element, index) {
      options.push({ text: element.name, id: element.id });
    });
    return options;

  }

  _createComboYears = () => {
    let actualYear, options;

    actualYear = moment().format('YYYY');
    options = [];
    for (var i = actualYear; i > 1966; i--)
    {
      // options.push(<option key={i} value={i}>{i}</option>);
      options.push({ text: i, id: i });
    }
    return options;
  }

  _stationChanged (event) {
    this.setState({
      selectedStation: event.params.data.id
    });
  }

  _oneYearChanged (event) {
    this.setState({
      yearSelected: event.params.data.id
    });
  }

  _startYearChanged (event) {
    this.setState({
      startYearSelected: event.params.data.id
    });
  }

  _endYearChanged(event){
    this.setState({
      endYearSelected: event.params.data.id
    });
  }

  _createTable() {
    console.log(document.getElementById("upwellingPanel"));
    // if (document.getElementById("upwellingPanel") === null) {
    //   let element = React.createElement(DataTable, {
    //     container: id + '_table',
    //     options: table_options,
    //     view: this.props.view,
    //     layer: sublayerSelected
    //   });
    //   ReactDOM.render(element, document.getElementById(id + "_panel"));
    // }

  }

  _createGraph() {
    let dataSeries = [];

    for (var key in this.state.series) {
      dataSeries.push(this.state.series[key]);
    }

    let optionsGraph = {
      chart: {
        type: 'line',
      },

      title: null,

      credits: {
        enabled: false
      },

      exporting: {
        chartOptions: {
          title: {
            text: ''
          }
        }
      },

      xAxis: {
        categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
      },

      yAxis: {
        title: {
          text: 'UI (m3*s-1*km-1)'
        },
        plotLines: [{
          value: 0,
          width: 1,
          color: '#808080'
        }]
      },
      tooltip: {
        formatter: function () {
          return this.series.name + ' ' + this.x +
          ': <b>' + this.y + '</b>' + ' UI (m3*s-1*km-1)';
        },
        //valueSuffix: 'UI(m3*s-1*km-1)'
      },
      legend: {
        layout: 'vertical',
        align: 'right',
        verticalAlign: 'middle',
        borderWidth: 0
      },
      plotOptions: {
        line: {
          marker: {
            enabled: false
          }
        },
        series: {
          events: {
            legendItemClick: function (event) {
              (this.graph.strokeWidth < 4) ? this.update({ lineWidth: 4 }) : this.update({ lineWidth: 2 });

              return false;
            }
          }
        }
      },
      series: dataSeries
    }

    let chart = React.createElement(Charts, {
      container: 'chartUpwellingIndex',
      Chartype: 'HighChart',
      options: optionsGraph
    });

    if(this.state.chartUpwelling !== null) {
      ReactDOM.unmountComponentAtNode(document.getElementById('upwellingGraph'));
    }
    let chartUpwelling = ReactDOM.render(chart, document.getElementById("upwellingGraph"));
    this.setState({chartUpwelling: chartUpwelling });
  }

  _createSerie(data) {
    let yearselected, selectedStation, dataserie, bb, newSeries;
    yearselected = this.state.yearSelected;
    selectedStation = this.state.selectedStation;

    bb = data.getElementsByTagName("ano").length;

    dataserie = [];

    for (let i = 0; i < bb; i++) {
        if (yearselected == parseFloat(data.getElementsByTagName("ano")[i].childNodes[0].nodeValue)) {
          (isNaN(parseFloat(data.getElementsByTagName("ui")[i].childNodes[0].nodeValue))) ? dataserie.push(null) : dataserie.push(parseFloat(data.getElementsByTagName("ui")[i].childNodes[0].nodeValue));
        }
    }

    newSeries = this.state.series;

    newSeries["serie_" + selectedStation + "_" + yearselected] = {
        name: selectedStation + " " + yearselected,
        data: dataserie,
        color: this._getColor()
    }
    this.setState({series: newSeries }, function() {
      this._createTable();
      this._createGraph();
    });
  }

  _getColor() {
    let text = 'rgba(' + this.state.rgbColors[this.state.colorSelected] + ')';
    let newColorState = this.state.colorSelected + 1;
    (this.state.colorSelected < 8) ? this.setState({colorSelected: newColorState }) : this.setState({colorSelected: 0 });
    return text;
  }

  componentWillUpdate(nextProps, nextState) {}

  componentWillMount() {}

  componentDidMount() {}

  // shouldComponentUpdate() {
  //   return false; // Will cause component to never re-render.
  // }

  render() {
    return (<div className="container" id="upwellinIndexForm">
      <div className="row pd5">
        <div className="col-xs-12">
          <div className="form-group">
            <Select2 id="stationSelector" defaultValue={this.state.selectedStation} className="select2container" data={this.state.stations} onSelect={this._stationChanged.bind(this)} options={{
                placeholder: StaticDevTools._getLabel(0, conf),
                width: '100%'}}>
            </Select2>
          </div>
        </div>
      </div>

      <div className="row pd5" id="oneYearPanel">
        <div className="col-xs-12">
          <div className="form-group">
            <Select2 id="yearSelector" defaultValue={this.state.yearSelected} className="select2container" data={this.state.years} onSelect={this._oneYearChanged.bind(this)} options={{
                placeholder: StaticDevTools._getLabel(1, conf),
                width: '100%'}}>
            </Select2>
          </div>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-12">
          <div className="form-group">
            <label>
            {StaticDevTools._getLabel(4, conf)}
            <input
              name="severalYearsCheck"
              type="checkbox"
              checked={this.state.severalYears}
              onChange={this._toogleSeveralyearsPanel} />
          </label>
          </div>
        </div>
      </div>

      <div className="row pd5" id="severalYearsPanel">
        <div className="col-xs-12">
          <div className="form-group">
            <Select2 id="startYearSelector" defaultValue={this.state.startYearSelected} className="select2container" data={this.state.years} onSelect={this._startYearChanged.bind(this)} options={{
                placeholder: StaticDevTools._getLabel(5, conf),
                width: '100%'}}>
            </Select2>
          </div>
        </div>
        <div className="col-xs-12">
          <div className="form-group">
            <Select2 id="startYearSelector" defaultValue={this.state.endYearSelected} className="select2container" data={this.state.years} onSelect={this._endYearChanged.bind(this)} options={{
                placeholder: StaticDevTools._getLabel(6, conf),
                width: '100%'}}>
            </Select2>
          </div>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-12">
          <button className="btn btn-success btn-block" onClick={this._insertSerie.bind(this)}>{StaticDevTools._getLabel(2, conf)}</button>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-12">
          <button className="btn btn-danger btn-block" onClick={this._removeSerie.bind(this)}>{StaticDevTools._getLabel(3, conf)}</button>
        </div>
      </div>
    </div>);
  }
}
