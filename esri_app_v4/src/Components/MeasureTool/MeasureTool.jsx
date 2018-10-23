import React from 'react';
import './MeasureTool.css';
import esriLoader from 'esri-loader';
import $ from 'jquery';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";

require('select2/dist/css/select2.min.css');
require('select2/dist/js/select2.full.min.js');

const conf = require('./widgetconfig.json');
const appconf = require('../../appconf.json');

export default class MeasureTool extends React.Component {

  constructor(props) {
    super(props);

    let availableAreaUnits = ["square-meters", "hectares", "square-kilometers"];
    let availableLengthUnits = ["nautical-miles", "kilometers", "meters", "miles"];

    this.areaOptions = availableAreaUnits.map((u, i) => {
      return <option key={i} value={u}>{this.translateUnit(u)}</option>
    });

    this.lengthOptions = availableLengthUnits.map((u, i) => {
      return <option key={i} value={u}>{this.translateUnit(u)}</option>
    });

    this.state = {
      view: props.view,
      active: false,
      tool: null,
      labels: conf.labels,
      units: this.areaOptions
    }
    this.activateTool = this.activateTool.bind(this);
    this.deactivateTool = this.deactivateTool.bind(this);
    this.drawPolygon = this.drawPolygon.bind(this);
    this.drawPolyline = this.drawPolyline.bind(this);
    this.removeLast = this.removeLast.bind(this);
    this.state.meassures = [];
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));
    this.gcount = -1;

    this.props.view.onClickTools.push(this);

    var thisWidget = this;

    esriLoader.loadModules([
      'esri/geometry/geometryEngine',
      'esri/layers/GraphicsLayer',
      "esri/Graphic",
      "esri/geometry/Point",
      "esri/geometry/Polygon",
      "esri/geometry/Polyline",
      "esri/views/2d/draw/Draw",
      'react-dom'

    ], appconf.esriversion).then(([
      geometryEngine,
      GraphicsLayer,
      Graphic,
      Point,
      Polygon,
      Polyline,
      Draw,
      ReactDOM
    ]) => {

      thisWidget.geometryEngine = geometryEngine;
      thisWidget.measureLayer = new GraphicsLayer({"title": "Medicion"});
      thisWidget.Point = Point;
      thisWidget.Polygon = Polygon;
      thisWidget.Polyline = Polyline;
      thisWidget.Graphic = Graphic;
      thisWidget.draw = new Draw({view: thisWidget.props.view});
    }).catch(err => {
      console.error(err);
    });
  }

  enableCreateGeometry(draw, view, geometrytype, thisWidget) {
    // create() will return a reference to an instance of PolygonDrawAction
    thisWidget.action = draw.create(geometrytype);

    view.focus();

    if (geometrytype === "polygon") {

      thisWidget.action.on("vertex-add", thisWidget.drawPolygon);
      thisWidget.action.on("cursor-update", thisWidget.drawPolygon);
      thisWidget.action.on("vertex-remove", thisWidget.drawPolygon);
      thisWidget.action.on("draw-complete", thisWidget.drawPolygon);
    } else if (geometrytype === "polyline") {

      thisWidget.action.on("vertex-add", thisWidget.drawPolyline);
      thisWidget.action.on("cursor-update", thisWidget.drawPolyline);
      thisWidget.action.on("vertex-remove", thisWidget.drawPolyline);
      thisWidget.action.on("draw-complete", thisWidget.drawPolyline);
    }

  }

  drawPolygon(evt) {

    var vertices = evt.vertices;
    this.removeLast("polygon");

    let esriunit = $("#measureUnit").val();
    let unit = this.translateUnit(esriunit);

    var polygon = this.createPolygon(vertices);
    var graphic = this.createGraphic(polygon, conf.polygonSymbol);

    if (evt.type === "draw-complete") {
      this.gcount += 1;
      graphic.attributes = {
        finished: true,
        meassureindex: this.gcount
      }
    } else {
      graphic.attributes = {
        finished: false
      }
    }
    this.props.view.graphics.add(graphic);

    let area = 0;
    var simplifiedPolygon;
    if (this.measuretype === "geodesic") {

      area = this.geometryEngine.geodesicArea(polygon, esriunit);
      if (area < 0) {
        // simplify the polygon if needed and calculate the area again
        simplifiedPolygon = this.geometryEngine.simplify(polygon);
        if (simplifiedPolygon) {
          area = this.geometryEngine.geodesicArea(simplifiedPolygon, esriunit);
        }
      }
    } else if (this.measuretype === "planar") {
      area = this.geometryEngine.planarArea(polygon, esriunit);
      if (area < 0) {
        // simplify the polygon if needed and calculate the area again
        simplifiedPolygon = this.geometryEngine.simplify(polygon);
        if (simplifiedPolygon) {
          area = this.geometryEngine.planarArea(simplifiedPolygon, esriunit);
        }
      }
    }

    if (evt.type === "draw-complete") {
      let meassures = this.state.meassures;
      let medida = area.toLocaleString() + " " + unit;
      let gindex = this.gcount;
      meassures[gindex] = (<div className="alert  alert-success" key={gindex}>({gindex}) {medida}
        <span className="glyphicon glyphicon-remove" onClick={this.removeMeassure.bind(this, gindex)}></span>
      </div>)
      this.setState({meassures: meassures});
      this.labelGeometry(polygon, area,unit, true, this.gcount);
    } else {
      this.labelGeometry(polygon, area, unit, false, null);
    }
  }

  drawPolyline(evt) {

    let esriunit = $("#measureUnit").val();
    let unit = this.translateUnit(esriunit);

    var vertices = evt.vertices;
    this.removeLast("polyline");
    var polyline = this.createPolyline(vertices);

    var graphic = this.createGraphic(polyline, conf.lineSymbol);
    if (evt.type === "draw-complete") {
      this.gcount += 1;
      graphic.attributes = {
        finished: true,
        meassureindex: this.gcount
      }
    } else {
      graphic.attributes = {
        finished: false
      }
    }

    this.props.view.graphics.add(graphic);
    let length = 0;
    var simplifiedPolyline;
    if (this.measuretype === "geodesic") {
      length = this.geometryEngine.geodesicLength(polyline, esriunit);
      if (length < 0) {
        // simplify the polygon if needed and calculate the area again
        simplifiedPolyline = this.geometryEngine.simplify(polyline);
        if (simplifiedPolyline) {
          length = this.geometryEngine.geodesicLength(simplifiedPolyline, esriunit);
        }
      }
    } else if (this.measuretype === "planar") {
      length = this.geometryEngine.planarLength(polyline, esriunit);
      if (length < 0) {
        // simplify the polygon if needed and calculate the area again
        simplifiedPolyline = this.geometryEngine.simplify(polyline);
        if (simplifiedPolyline) {
          length = this.geometryEngine.planarLength(simplifiedPolyline, esriunit);
        }
      }
    }

    if (evt.type === "draw-complete") {
      let meassures = this.state.meassures;
      let medida = length.toLocaleString() + " " + unit;
      let gindex = this.gcount;
      meassures[gindex] = (<div className="alert  alert-success" key={gindex}>({gindex}) {medida}
        <span className="glyphicon glyphicon-remove" onClick={this.removeMeassure.bind(this, gindex)}></span>
      </div>)
      this.setState({meassures: meassures});
      this.labelGeometry(polyline, length, unit, true, this.gcount);
    } else {
      this.labelGeometry(polyline, length, unit, false, null);
    }

  }

  createPolygon(vertices) {
    return new this.Polygon({rings: vertices, spatialReference: this.props.view.spatialReference});
  }

  createPolyline(vertices) {
    return new this.Polyline({paths: vertices, spatialReference: this.props.view.spatialReference});
  }

  removeMeassure(index) {
    //console.log("Romving graphic index: " + index);
    let meassures = this.state.meassures;
    meassures[index] = null;
    this.setState({meassures: meassures});
    //Removing graphics, graphic element and label...
    let gindex = this.props.view.graphics.items.filter(function(g) {

      return g.attributes.meassureindex === index;
    });

    this.props.view.graphics.remove(gindex[0]);
    this.props.view.graphics.remove(gindex[1]);

  }
  // create a new graphic representing the polygon that is being drawn on the view
  createGraphic(geometry, symbol) {

    var graphic = new this.Graphic({geometry: geometry, symbol: symbol});
    return graphic;
  }

  labelGeometry(geom, measure, units, last, meassureindex) {
    var targetpoint;
    if (geom.type === "polygon") {
      targetpoint = geom.centroid
    } else if (geom.type === "polyline") {
      targetpoint = new this.Point({spatialReference: geom.spatialReference, x: geom.paths[0][geom.paths[0].length - 1][0], y: geom.paths[0][geom.paths[0].length - 1][1]
      })
    }


    var graphic = new this.Graphic({
      geometry: targetpoint,
      attributes: {
        finished: last,
        meassureindex: meassureindex
      },
      symbol: {
        type: "text",
        color: "black",
        haloColor: "black",
        haloSize: "1px",
        text: measure.toLocaleString() + " " + units,
        xoffset: 3,
        yoffset: 3,
        font: { // autocast as Font
          size: 14,
          family: "sans-serif"
        }
      }
    });
    this.removeLast("point");

    this.props.view.graphics.add(graphic);
  }

  removeLast(type) {
    let graphics = this.props.view.graphics;

    //console.log(graphics);
    for (var i = graphics.items.length - 1; i >= 0; i--) {
      if (graphics.items[i].geometry.type === type && graphics.items[i].attributes.finished === false) {
        this.props.view.graphics.remove(this.props.view.graphics.items[i]);
        return;
      }
    }
  }

  translateUnit(esriunit) {

    let locale = StaticDevTools._getLocale();
    let unit;
    if (locale === "es") {
      switch (esriunit) {
        case "square-meters":
          unit = "Metros²";
          break;
        case "hectares":
          unit = "Hectáreas²"
          break;
        case "square-kilometers":
          unit = "Kilometros²"
          break;
        case "nautical-miles":
          unit = "Millas náuticas"
          break;
        case "kilometers":
          unit = "Kilometros"
          break;
        case "meters":
          unit = "Metros"
          break;
        case "miles":
          unit = "Millas"
          break;

        default:

      }
    } else {
      switch (esriunit) {
        case "square-meters":
          unit = "Meters²";
          break;
        case "hectares":
          unit = "Hectares²"
          break;
        case "square-kilometers":
          unit = "Kilometers²"
          break;
        case "nautical-miles":
          unit = "Nautical miles"
          break;
        case "kilometers":
          unit = "Kilometers"
          break;
        case "meters":
          unit = "Meters"
          break;
        case "miles":
          unit = "Miles"
          break;
        default:
      }
    }
    return unit;
  }
  activateTool(evt) {

    let geometrytype = $("#measureSelector").val();
    this.measuretype = $("#measureType").val();

    if (window.innerWidth <= 768) {
      $("#" + conf.definition.id + " a")[0].click();
    }
    this.enableCreateGeometry(this.draw, this.props.view, geometrytype, this);
  }

  deactivateTool(evt) {
    if (this.action !== undefined) {
      this.props.view.graphics.removeAll();
      this.setState({meassures: []})
      this.draw.reset();
    }
  }

  updateUnits() {
    console.log("Updating units...");
  }

  componentDidMount() {

    let thisWidget = this;

    $('.select2Selector').select2();
    $('#measureSelector').on("select2:select", function(e) {
      let selected = $(e.target).val();
      switch (selected) {
        case "polygon":
          thisWidget.setState({units: thisWidget.areaOptions});
          $('#measureUnit').select2();
          break;
        case "polyline":
          thisWidget.setState({units: thisWidget.lengthOptions});
          $('#measureUnit').select2();
          break;
        default:
      }

    });
  }
  render() {
    return (<div className="measureToolDiv container-fluid">
      <div className="row">
        <div className="col-xs-5">
          <label>{StaticDevTools._getLabel(7, conf)}:
          </label>
        </div>
        <div className="col-xs-7">
          <select className="select2Selector" id="measureSelector">
            <option value="polygon">{StaticDevTools._getLabel(3, conf)}</option>
            <option value="polyline">{StaticDevTools._getLabel(4, conf)}</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-5">
          <label>{StaticDevTools._getLabel(8, conf)}:
          </label>
        </div>
        <div className="col-xs-7">
          <select className="select2Selector" id="measureType">
            <option value="geodesic">{StaticDevTools._getLabel(5, conf)}</option>
            <option value="planar">{StaticDevTools._getLabel(6, conf)}</option>
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-5">
          <label>{StaticDevTools._getLabel(9, conf)}:
          </label>
        </div>
        <div className="col-xs-7">
          <select className="select2Selector" id="measureUnit">
            {this.state.units}
          </select>
        </div>
      </div>
      <div className="row">
        <div className="col-xs-6">
          <button className="btn btn-success" onClick={this.activateTool}>{StaticDevTools._getLabel(0, conf)}</button>
        </div>
        <div className="col-xs-6">
          <button className="btn btn-success" onClick={this.deactivateTool}>{StaticDevTools._getLabel(1, conf)}</button>
        </div>
      </div>

      <div className="row" id="measureToolResultDiv">
        {this.state.meassures}
      </div>
    </div>);
  }
}
