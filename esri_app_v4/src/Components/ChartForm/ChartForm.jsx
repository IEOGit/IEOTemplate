import React from 'react';
import ReactDOM from 'react-dom';
import Highcharts from 'highcharts';
import Moment from 'moment';
import Select2 from 'react-select2-wrapper';
import { Button } from 'react-bootstrap';
import ChartsPanel from '../ChartsPanel/ChartsPanel.jsx';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import './ChartForm.css';

const conf = require('./widgetconfig.json');

export  default class ChartForm extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      labels:conf.labels,
      fieldsNames: [],
      numericFieldNames: []
    }
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this,conf));

    this._handleChangeKindGraphic = this._handleChangeKindGraphic.bind(this);
    this._createChart = this._createChart.bind(this);
  }

  componentWillMount() {
    let fieldsNames = [];
    let numericFieldNames = [];
    this.props.layerFields.forEach(function(field){
      fieldsNames.push(field.name);
    });

    this.props.layerNumericFields.forEach(function(field){
      numericFieldNames.push(field.name);
    });


    this.setState({
      "fieldsNames": fieldsNames,
      "numericFieldNames": numericFieldNames
    });
  }

  componentDidMount (){
  }

  _handleChangeKindGraphic(event){
    console.log(event.target.value);
    console.log(this.state.fieldsNames);
    console.log(this.state.numericFieldNames);
  }

  _createChart () {
    let  typeChart, typeHighChart, XAxis, YAxis, layerFieldX, layerFieldY, XAxisCodedValue, YAxisCodedValue, sublayerSelected, dataX, dataY, dataSerie;

    sublayerSelected = this.props.sublayer;
    typeChart = this.refs.TypeChartInput.el[0].value;
    XAxis = this.refs.XAxisInput.el[0].value;
    YAxis = this.refs.YAxisInput.el[0].value;
    dataX = [];
    dataY = [];
    dataSerie = [];

    let query = sublayerSelected.createQuery();
    query.where = "1=1";
    query.outFields = [ XAxis, YAxis ];
    query.returnGeometry = false;

    this.props.layerFields.forEach(function(field){
      layerFieldX = field.name === XAxis ? field: "";
      layerFieldY = field.name === YAxis ? field: "";
      // (field.name === XAxis) ? layerFieldX = field : "";
      // (field.name === YAxis) ? layerFieldY = field : "";
    });

    if (layerFieldY.domain) {
      YAxisCodedValue = [];
      layerFieldY.domain.codedValues.forEach(function(codedVal){
        YAxisCodedValue.push(codedVal.name);
      });
    }

    else{
      YAxisCodedValue = "";
    }

    if (layerFieldX.domain) {
      XAxisCodedValue = [];
      layerFieldX.domain.codedValues.forEach(function(codedVal){
        XAxisCodedValue.push(codedVal.name);
      });
    }

    else{
      XAxisCodedValue = "";
    }

    sublayerSelected.queryFeatures(query).then(function(data){
      data.features.forEach(function(graphic) {
        dataX.push(graphic.attributes[XAxis]);
        dataY.push(graphic.attributes[YAxis]);
        dataSerie.push([graphic.attributes[XAxis], graphic.attributes[YAxis]]);
      });

      if (document.getElementById("orderFieldX").checked) {
        dataSerie = StaticDevTools.sortObjectByValue(dataSerie, 0, "MintoMax");
      }

      let plotOptions, typeSeries, typeXaxis;

      switch (typeChart) {
        case "line":
        typeHighChart  = "HighChart";
        plotOptions = {
          series: {
            label: {
              connectorAllowed: false
            }
          }
        };
        typeSeries = "";
        typeXaxis = "";
        break;
        case "column":
        typeHighChart  = "HighChart";
        plotOptions = {}
        break;
        case "scatter":
        typeHighChart  = "HighChart";
        plotOptions = {}
        break;
        case "datetime":
        typeHighChart  = "HighStock";
        typeChart = "";
        dataSerie.forEach(function(val){
          val[0] = Moment.utc(val[0])._i;
        });
        plotOptions = {
          area: {
            fillColor: {
              linearGradient: {
                x1: 0,
                y1: 0,
                x2: 0,
                y2: 1
              },
              stops: [
                [0, Highcharts.getOptions().colors[0]],
                [1, Highcharts.Color(Highcharts.getOptions().colors[0]).setOpacity(0).get('rgba')]
              ]
            },
            marker: {
              radius: 2
            },
            lineWidth: 1,
            states: {
              hover: {
                lineWidth: 1
              }
            },
            threshold: null
          }
        };
        typeSeries = 'area';
        typeXaxis = "datetime";
        break;
        default:
        //Sentencias_def ejecutadas cuando no ocurre una coincidencia con los anteriores casos
        break;
      }

      let graphicOptions = {
        chart: {
          type: typeChart,
          zoomType: 'x'
        },
        title: {
          text: sublayerSelected.title
        },

        subtitle: {
          text: 'Información Marina'
        },
        xAxis: {
          title: {
            text: XAxis
          },
          categories: dataX,
          type: typeXaxis
        },
        yAxis: {
          title: {
            text: YAxis
          },
          categories: YAxisCodedValue
        },
        legend: {
          layout: 'vertical',
          align: 'right',
          verticalAlign: 'middle'
        },

        credits: {
          enabled: false
        },

        plotOptions: plotOptions,

        series: [{
          type: typeSeries,
          name: sublayerSelected.title,
          data: dataSerie
        }],

        responsive: {
          rules: [{
            condition: {
              maxWidth: 500
            },
            chartOptions: {
              legend: {
                layout: 'horizontal',
                align: 'center',
                verticalAlign: 'bottom'
              }
            }
          }]
        }
      }

      let chartPanel = React.createElement(ChartsPanel, {
        options: graphicOptions,
        Chartype: typeHighChart,
      });

      ReactDOM.render(chartPanel, document.getElementById("graphsPanel"));
      let tableElement = document.querySelectorAll('[href="#graphsPanel"]');
      tableElement[0].click();
      document.getElementById("cancel-btn").click();
      if(!document.getElementById("dataTableContainer").classList.contains('open')){
        document.getElementById("button_splitter").click()
      }
      // (document.getElementById("dataTableContainer").classList.contains('open')) ? "" : document.getElementById("button_splitter").click();
    });

  }

  render() {
    //let fieldsNames = this.state.fieldsNames;

    return (
      <form onSubmit={this._createChart}>
        <div className="row row-ChartForm">
          <div className="col-md-5">
            <label >{StaticDevTools._getLabel(0,conf)}</label>
        </div>
        <div className="col-md-4 col-ChartForm">
          <Select2 ref="TypeChartInput" className="select2container" onSelect={this._handleChangeKindGraphic} data={[
            { text: 'Lineas', id: "line" },
            { text: 'Columnas', id: "column" },
            { text: 'Dispersion XY', id: "scatter"},
            { text: 'Serie Temporal', id: "datetime"}
          ]} options={{placeholder: StaticDevTools._getLabel(4,conf), width: '100%'}}>Seleccionar tipo gráfico:
        </Select2>
        </div>
      </div>
      <div className="row row-ChartForm">
        <div className="col-md-4">
          <label>{StaticDevTools._getLabel(1,conf)}</label>
        </div>
        <div className="col-md-4">
          <Select2 ref="XAxisInput" className="select2container" data={this.state.fieldsNames} options={{placeholder: StaticDevTools._getLabel(6,conf), width: '100%'}}>{StaticDevTools._getLabel(1,conf)}</Select2>
        </div>
        <div className="col-md-4">
          <input id="orderFieldX" type="checkbox" defaultChecked></input>
          <label className="labelChartForm">{StaticDevTools._getLabel(5,conf)}</label>
        </div>
      </div>
      <div className="row row-ChartForm">
        <div className="col-md-4">
          <label>{StaticDevTools._getLabel(2,conf)}</label>
        </div>
        <div className="col-md-4">
          <Select2 ref="YAxisInput" className="select2container" data={this.state.numericFieldNames} options={{placeholder: StaticDevTools._getLabel(6,conf), width: '100%'}}>Seleccionar campo Y</Select2>
        </div>
      </div>
      <div className="row row-ChartForm">
        <div className="col-md-12 text-center">
          <Button className="btn btn-primary" type="button" onClick={this._createChart} >{StaticDevTools._getLabel(3,conf)}</Button>
        </div>
      </div>
    </form>
  )}
}
