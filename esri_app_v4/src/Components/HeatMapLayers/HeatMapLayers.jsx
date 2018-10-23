import React from 'react';
import './HeatMapLayers.css';
import esriLoader from 'esri-loader';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import 'font-awesome/css/font-awesome.css'
import h337 from 'heatmapjs/heatmap.js'
import $ from 'jquery';
import 'select2/dist/css/select2.min.css'
import 'select2/dist/js/select2.min.js'

const appconf = require('../../appconf.json');

const conf = require('./widgetconfig.json');

export default class HeatMapLayers extends React.Component {
  constructor(props) {
    super(props);

    //let token = window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    this.state = {
      layersOptions: null,
      pointLayers: [],
      labels: conf.labels,
      fieldsoptions: null,
      maxvalue: null,
      minvalue: null
    };
    //this.currentZoom = this.props.view.zoom;
    this._createHeatMapAndUpdateSelector();
    this.layerLoaded = false;

  }

  _getZoomRadiusInPixels() {

    if(this.props.view.viewpoint) //Oly used in 2D views;
    {

      let centerX = this.props.view.viewpoint.targetGeometry.x;
      let centerY = this.props.view.viewpoint.targetGeometry.y;
      let radiusValue = parseFloat($("#radius").val()) * 1000;

      // console.log("radiusValue");
      // console.log(radiusValue);

      let atCenterPoint = new this.Point({x: centerX, y: centerY, spatialReference: this.props.view.spatialReference});
      let atRadiusPoint = new this.Point({
        x: centerX + radiusValue,
        y: centerY,
        spatialReference: this.props.view.spatialReference
      });

      let screenPointCenter = this.props.view.toScreen(atCenterPoint);
      let screenPointRadius = this.props.view.toScreen(atRadiusPoint);

      let screenRaidus = parseInt((screenPointRadius.x - screenPointCenter.x), 10);
      if (screenRaidus === 0) {
        screenRaidus = 1;
      }
      return screenRaidus;
    }


  }

  _createHeatMapAndUpdateSelector() {

    let thisWidget = this;
    esriLoader.loadModules([
      "esri/layers/FeatureLayer", "esri/tasks/support/Query", "esri/geometry/Point", "esri/core/watchUtils"
    ], appconf.esriversion).then(([FeatureLayer, Query, Point, watchUtils]) => {

      thisWidget.FeatureLayer = FeatureLayer;
      thisWidget.Query = Query;
      thisWidget.Point = Point;
      thisWidget._getZoomRadiusInPixels = thisWidget._getZoomRadiusInPixels.bind(thisWidget);

      if (!this.featureLayer) {

        thisWidget._createInstance();
      }

      watchUtils.whenTrue(thisWidget.props.view, "stationary", function() {

        if (thisWidget.props.view && thisWidget.featureLayer) {
          //console.log("Map ready...");
          thisWidget._updateHeatMapData();
        }
      });

      //When zoom changes... we need to recalculate radius...
      watchUtils.watch(this.props.view, "zoom", function() {
        if (thisWidget.props.view.zoom === parseInt(thisWidget.props.view.zoom, 10) && thisWidget.featureLayer) {
          //console.log("Zoom...")
          thisWidget._updateInstance();
        }

      });

      this.props.view.on("drag", function(evt) {

        if (evt.action === "start" && thisWidget.featureLayer) {
          //console.log("Drag...")
          thisWidget.heatmapInstance.setData({data: []});
        }
      });

      this.props.view.on("resize", function(evt) {
        //We need to recreate the heatMap instance...
        //But not while resizing is performed...
        if (!evt.target.resizing) {
          if (thisWidget.featureLayer && thisWidget.layerLoaded) {
            //console.log("Resize...");
            thisWidget._updateInstance();

          }
        }
      });

      this._checkAllPointLayerAndUpdateSelectors(); //Check current layers
      //And assure added layers in the future will updte the selector...
      this.props.view.on("layerview-create", this._checkPointLayerAndUpdateSelectors.bind(this));

    }).catch(err => {
      console.error(err);
    });
  }

  _deleteInstance() {
    //console.log("Deleting...");
    var canvas = this.heatmapInstance._renderer.canvas;
    $(canvas).remove();

  }

  _createInstance() {

    //console.log("creating instance...");
    let config = conf.HeatmapConfig;
    config.container = document.querySelector('.esri-overlay-surface');
    config.radius = this._getZoomRadiusInPixels();
    //console.log(config.radius);
    this.heatmapInstance = h337.create(config);

  }

  _checkAllPointLayerAndUpdateSelectors(){
    this.props.view.map.layers.items.map((layer,index) => {
      let evt = {};
      evt.layer = layer;
      this._checkPointLayerAndUpdateSelectors(evt);
      return null;
    });

  }

  _checkPointLayerAndUpdateSelectors(evt) {

    let layer = evt.layer;
    if ((layer.type === "feature" && layer.geometryType === "point") || (layer.type === "graphics" && layer.graphics.items[0].geometry.type === "point")) {
      //eles.push(layer);
      let pointlayers = this.state.pointLayers;
      if(pointlayers.indexOf(layer) === -1){
        pointlayers.push(layer);
        this.setState({"pointLayers": pointlayers});
        this._updateLayerSelector();
      }

    } else if (layer.sublayers && layer.type !== "wms") {
      let url = layer.url;
      layer.sublayers.items.map((sublayer, index2) => {
        if(sublayer.sublayers){

          //TODO Importar subsbulayers...

        return null;

        }
        else{


        let wfsurl = url + "/" + sublayer.id;
        let flayer = new this.FeatureLayer({"url": wfsurl});
        let q = new this.Query();
        q.where = "1=0";
        q.outFields = "*"
        q.returnGeometry = true;
        flayer.queryFeatures(q).then(function(response) {

          if (response.geometryType === "point") {
            let pointlayers = this.state.pointLayers;

            if(pointlayers.indexOf(flayer) === -1){
              pointlayers.push(flayer);
              this.setState({"pointLayers": pointlayers});
              this._updateLayerSelector();
            }
          }
        });
        return null;
      }
      });
    }

  }

  _intiLayerSelector() {

    //let eles = [];
    this.setState({"pointLayers": []});
    this.props.view.map.layers.items.map((layer, index) => {
      if ((layer.type === "feature" && layer.geometryType === "point") || (layer.type === "graphics" && layer.graphics.items[0].geometry.type === "point")) {
        //eles.push(layer);
        let pointlayers = this.state.pointLayers;
        pointlayers.push(layer);
        this.setState({"pointLayers": pointlayers});
        this._updateLayerSelector();

      } else if (layer.sublayers && layer.type !== "wms") {
        let url = layer.url;
        layer.sublayers.items.map((sublayer, index2) => {
          let wfsurl = url + "/" + sublayer.id;
          let flayer = new this.FeatureLayer({"url": wfsurl});
          let q = new this.Query();
          q.where = "1=0";
          q.outFields = "*"
          q.returnGeometry = true;
          flayer.queryFeatures(q).then(function(response) {

            if (response.geometryType === "point") {
              let pointlayers = this.state.pointLayers;
              pointlayers.push(flayer);
              this.setState({"pointLayers": pointlayers});
              this._updateLayerSelector();

            }
          });
          return null;
        });
      }
      return null;
    });

  }

  _layerChanged() {
    let thisWidget = this;

    let index = $("#selectorPointLayer").val();
    let layer = this.state.pointLayers[index];
    if (layer !== undefined && layer.type === "graphics") {
      let attributes = layer.graphics.items[0].attributes;
      //this.featureLayer = layer;
      let numeric_fields = [];
      Object.keys(attributes).forEach(function(key) {
        if (!isNaN(attributes[key])) {
          numeric_fields.push(key);
        }
      });

      let options = numeric_fields.map((field, index) => {
        return <option key={index} value={field}>{field}</option>
      });

      thisWidget.setState({"fieldsoptions": options});

      $(".select2input").select2({width: "100%"});

    } else if (layer !== undefined && layer.type === "feature") {
      //let url = layer.parsedUrl.path;

      //this.featureLayer = layer;
      let q = new this.Query();
      q.where = "1=0";
      q.outFields = "*"
      q.returnGeometry = false;

      //let options;


      layer.queryFeatures(q).then(function(response) {
        let options = response.fields.map((field, index) => {

          if (field.type === "integer" || field.type === "double") {
            let alias = field.alias;
            let name = field.name;
            return <option key={index} value={name}>{alias}</option>
          } else
            return null;
          }
        );
        thisWidget.setState({"fieldsoptions": options});
      });
    }
  }

  _updateFields() {}

  _updateLayerSelector() {

    let options = this.state.pointLayers.map((layer, index) => {
      let title = layer.name
        ? layer.name
        : layer.source.layerDefinition.name;
      return <option key={index} value={index}>{title}</option>
    });
    options.unshift(<option key="-1" value="-1" selected="selected"></option>);

    this.setState({layersOptions: options});

    $(".select2input").select2({width: "100%"});

  }

  _updateInstance() {
    //console.log("Updating instance...");
    this._deleteInstance();
    this._createInstance();

  }

  _updateInstanceAndMap() {

    this.heatmapInstance.setData({data: []});
    this._updateInstance();

    this._updateHeatMapData();
  }

  _updateHeatmap(){


    let index = $("#selectorPointLayer").val();
    let layer = this.state.pointLayers[index];
    this.featureLayer = layer;
    this._updateInstanceAndMap();
  }

  _updateHeatMapData() {

    //console.log("Updating DATA...");
    let thisWidget = this;
    this.layerLoaded = true;
    if (this.featureLayer) {
      if (this.featureLayer.type === "graphics") {
        let max = -9999999;
        let min = 999999;
        let points = this.featureLayer.graphics.items.map(function(feature) {

          let p = new thisWidget.Point(feature.geometry);
          let field = $("#fieldSelector").val();
          let value = feature.attributes[field];
          max = Math.max(max, value);
          min = Math.min(min, value);
          let screen_point = thisWidget.props.view.toScreen(p);
          //console.log(screen_point);
          let point = {
            x: screen_point.x,
            y: screen_point.y,
            value: value
          };
          return point;
        });
        let datas = {
          max: max,
          data: points
        }

        thisWidget.setState({maxvalue: max, minvalue: min});

        thisWidget.heatmapInstance.setData(datas);
      } else {

        let q = new this.Query();
        q.where = "1=1";
        q.returnGeometry = true;
        let selectedfield = $("#fieldSelector").val();
        //console.log(selectedfield);
        q.outFields = selectedfield;

        let currentExtent = this.props.view.extent;
        q.geometry = currentExtent;
        q.spatialRelationship = "envelope-intersects";
        this.featureLayer.queryFeatures(q).then(function(data) {
          let max = -9999999;
          let min = 99999999;
          let points = data.features.map(function(feature) {
            //console.log(feature);

            let p = new thisWidget.Point(feature.geometry);
            let field = $("#fieldSelector").val();
            let value = feature.attributes[field];
            max = Math.max(max, value);
            min = Math.min(min, value);
            let screen_point = thisWidget.props.view.toScreen(p);
            //console.log(screen_point);
            let point = {
              x: screen_point.x,
              y: screen_point.y,
              value: value
            };
            return point;
          });
          let datas = {
            max: max,
            data: points
          }
          thisWidget.setState({maxvalue: max, minvalue: min});

          thisWidget.heatmapInstance.setData(datas);
        });
      }
    }
  }

  _deleteLayer() {
    this.heatmapInstance.setData({data: []});
    this.featureLayer = null;
    this.layerLoaded = false;
    //jQuery("#selectorPointLayer").val(jQuery("#selectorPointLayer option:first").val());
    $("#selectorPointLayer").select2("val", "-1");
  }

  componentWillUpdate(nextProps, nextState) {}

  componentWillMount() {}

  componentDidMount() {

    $(".select2input").select2({width: "100%"});
    $('#selectorPointLayer').on('select2:select', this._layerChanged.bind(this));
  }

  render() {
    return (<div className="container" id="heatmapForm">
      <div className="row">
        <div className="col-xs-12">
          <div className="form-group">
            <label className="control-label">{StaticDevTools._getLabel(0, conf)}</label>
            <select id="selectorPointLayer" className="select2input">
              {this.state.layersOptions}
            </select>
          </div>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-12">
          <div className="form-group">
            <label className="control-label">{StaticDevTools._getLabel(2, conf)}</label>
            <select id="fieldSelector" className="select2input">
              {this.state.fieldsoptions}
            </select>
          </div>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-12">
          <div className="form-group">
            <label className="control-label">{StaticDevTools._getLabel(7, conf)}</label>
            <input id="radius" type="numeric" name="radius" defaultValue="100" className="form-control"/>
          </div>
        </div>
      </div>

      <hr/>

      <div className="row pd5">
        <div className="col-xs-12">
          <button className="btn btn-success btn-block" onClick={this._updateHeatmap.bind(this)}>{StaticDevTools._getLabel(1, conf)}</button>
        </div>
      </div>
      <div className="row pd5">
        <div className="col-xs-12">
          <button className="btn btn-danger btn-block" onClick={this._deleteLayer.bind(this)}>{StaticDevTools._getLabel(4, conf)}</button>
        </div>
      </div>
      <div className="row pd5">
        <div className="col-xs-12">
          <button className="btn btn-default btn-block" onClick={this._checkAllPointLayerAndUpdateSelectors.bind(this)}>{StaticDevTools._getLabel(3, conf)}</button>
        </div>
      </div>

      <div className="row pd5">
        <div className="col-xs-6">
          <div className="panel panel-default">
            <div className="panel-heading">{StaticDevTools._getLabel(5, conf)}</div>
            <div className="panel-body">
              <p>{this.state.minvalue}</p>
            </div>
          </div>

        </div>
        <div className="col-xs-6">
          <div className="panel panel-default">
            <div className="panel-heading">{StaticDevTools._getLabel(6, conf)}</div>
            <div className="panel-body">
              <p>{this.state.maxvalue}</p>
            </div>
          </div>
        </div>
      </div>
    </div>);
  }
}
