import React from 'react';
import esriLoader from 'esri-loader';
import $ from 'jquery';
import 'datatables.net';
import 'datatables.net-bs/js/dataTables.bootstrap';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './DataTable.css';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import ManageRoles from "../StaticDevTools/ManageRoles.jsx";
const appconf = require('../../appconf.json');

const conf = require('./widgetconfig.json');


export default class DataTable extends React.Component {
  // When the DOM is ready, create the chart.
  constructor(props) {
    super(props);

    this.highlightGraphics = []; //
    this.filteredGraphics = []; //

    this.pointMarker = conf.highligthSymbols.pointMarker
      ? conf.highligthSymbols.pointMarker
      : {
        type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
        style: "square",
        color: "blue",
        size: "8px", // pixels
        outline: { // autocasts as new SimpleLineSymbol()
          color: "#ffff66",
          width: 3 // points
        }
      };

    this.polygonSymbol = conf.highligthSymbols.polygonSymbol
      ? conf.highligthSymbols.polygonSymbol
      : {
        type: "simple-fill", // autocasts as new SimpleFillSymbol()
        color: [
          255, 255, 102, 0.5
        ],
        outline: { // autocasts as new SimpleLineSymbol()
          color: "#ffff66",
          width: 4
        }
      };

    this.lineSymbol = conf.highligthSymbols.lineSymbol
      ? conf.highligthSymbols.lineSymbol
      : {
        type: "simple-line", // autocasts as SimpleLineSymbol()
        color: "#ffff66",
        width: 4
      };

    this.filtered = [];

  }
  componentDidMount() {
    let thisWidget = this;

    // let sublayername = this.props.container.substring(0,this.props.container.length - 6);
    // let lastunderscore = sublayername.lastIndexOf("_")
    // let layerid = sublayername.substr(0,lastunderscore);
    // console.log(layerid);
    this.sublayerid = StaticDevTools.getIdFromEsriLayer(this.props.layer, this.props.view.map)
    this.layer = this.props.layer;
    let opt = this.props.options;
    opt.select = true;
    //console.log(opt);

    this.table = $('#' + this.props.container).DataTable(opt);
    let t = this.table;
    this.table.on('search.dt', function(evt) {
      let data = t.rows({filter: 'applied'}).data().toArray();

      thisWidget.filtered = [];
      thisWidget.filteredGraphics = [];

      thisWidget.filtered = data.map((ele, index) => {
        let id = ele[0];
        return id;
      });

      thisWidget._queryFLayerIds(thisWidget.filtered, true, function(data) {
        //let g = data.features[0].geometry.toJSON();
        let graphics = data.features.map((ele, index) => {
          var g = new thisWidget.Graphic({geometry: ele.geometry, symbol: null});
          return g;
        });

        thisWidget.filteredGraphics = graphics;
      });

    });
    // Onclick event in rows
    $('#' + this.props.container + ' tbody').on('click', 'tr', function() {
      $(this).toggleClass('selected');
      let dataselected = t.rows('.selected').data().toArray();
      //console.log(dataselected);
      thisWidget.props.view.graphics.removeAll();
      thisWidget.highlightGraphics = [];

      let selectedids = dataselected.map((ele, index) => {
        let fid = ele[0]
        return fid;
      });

      thisWidget._queryFLayerIds(selectedids, true, function(data) {
        data.features.map((f, index) => {
          let g = f.geometry.toJSON();
          //console.log(f);
          thisWidget._highlightGeometry(f.attributes.OBJECTID, g);
          return null;
        });

      });
    });

    esriLoader.loadModules([
      "esri/layers/FeatureLayer",
      "esri/tasks/support/Query",
      "esri/geometry/Polygon",
      "esri/geometry/Polyline",
      "esri/geometry/Point",
      "esri/Graphic",
      "esri/geometry/Extent",
      "esri/tasks/Geoprocessor",
      "esri/geometry/projection",
      "esri/geometry/SpatialReference"

    ], appconf.esriversion).then(([
      FeatureLayer,
      Query,
      Polygon,
      Polyline,
      Point,
      Graphic,
      Extent,
      Geoprocessor,
      projection,
      SpatialReference
    ]) => {

      thisWidget.FeatureLayer = FeatureLayer;
      thisWidget.Query = Query;
      thisWidget.Polygon = Polygon;
      thisWidget.Polyline = Polyline;
      thisWidget.Point = Point;
      thisWidget.Graphic = Graphic;
      thisWidget.Extent = Extent;
      thisWidget.SpatialReference = SpatialReference;
      thisWidget.projection = projection;
      thisWidget._download_gp = new Geoprocessor(conf.downloadshpservice);

    }).catch(err => {
      console.error(err);
    });
  }

  _getGraphicsExtent(graphics, callback) {
    //console.log(graphics);
    let xmin,
      ymin,
      xmax,
      ymax,
      srs;
    let extent = new this.Extent();
    let selected = graphics.filter(function(x) {
      return typeof(x) !== "undefined";

    });

    //let toBeProjected = false;
    for (var i = 0; i < selected.length; i++) {
      let g = selected[i];

      if (g.geometry.type === "point") {

        if (i === 0) {

          srs = g.geometry.spatialReference;
          xmin = g.geometry.x;
          ymin = g.geometry.y;
          xmax = g.geometry.x;
          ymax = g.geometry.y;
        } else {
          if (g.geometry.x < xmin) {
            xmin = g.geometry.x;
          }
          if (g.geometry.x > xmax) {
            xmax = g.geometry.x;
          }
          if (g.geometry.y < ymin) {
            ymin = g.geometry.y;
          }
          if (g.geometry.y > ymax) {
            ymax = g.geometry.y;
          }
        }
      } else {
        if (i === 0) {
          srs = g.geometry.extent.spatialReference;
          xmin = g.geometry.extent.xmin;
          ymin = g.geometry.extent.ymin;
          xmax = g.geometry.extent.xmax;
          ymax = g.geometry.extent.ymax;
        } else {
          if (g.geometry.extent.xmin < xmin) {
            xmin = g.geometry.extent.xmin;
          }
          if (g.geometry.extent.xmax > xmax) {
            xmax = g.geometry.extent.xmax;
          }
          if (g.geometry.extent.ymin < ymin) {
            ymin = g.geometry.extent.ymin;
          }
          if (g.geometry.extent.ymax > ymax) {
            ymax = g.geometry.extent.ymax;
          }
        }
      }
    }

    extent.xmin = xmin;
    extent.xmax = xmax;
    extent.ymin = ymin;
    extent.ymax = ymax;
    extent.spatialReference = srs;

    callback(extent);
  }

  _projectGeometryToWkid(g,wkid,callback){

    let prj = this.projection.load();
    let thisWidget = this;
    prj.then(function(){
      console.log("Projecting to web mercator....");
      let webmercator = new thisWidget.SpatialReference({
              wkid: wkid
            });
      let outg = thisWidget.projection.project(g,
          webmercator);
      callback(outg);
    });

  }
  _highlightGeometry(fid, geometryjson) {

    let thisWidget = this;
    let geometry;
    let symbol;
    if (geometryjson.rings) {
      geometry = this.Polygon.fromJSON(geometryjson);

      symbol = this.polygonSymbol;
    } else if (geometryjson.paths) {
      geometry = this.Polyline.fromJSON(geometryjson);

      symbol = this.lineSymbol;
    } else if (geometryjson.x) {
      geometry = this.Point.fromJSON(geometryjson);
      symbol = this.pointMarker;
    } else {
      console.log("geometry type not defined...");
    }


    if(geometry.spatialReference.isWebMercator === false && geometry.spatialReference.isGeographic === false){
      this._projectGeometryToWkid(geometry,3857,function(outgeometry){
        let g = new thisWidget.Graphic({geometry: outgeometry, symbol: symbol});
        thisWidget.highlightGraphics[fid] = g;
        thisWidget.props.view.graphics.add(thisWidget.highlightGraphics[fid]);

      });
    }
    else{
      let g = new this.Graphic({geometry: geometry, symbol: symbol});
      this.highlightGraphics[fid] = g;
      this.props.view.graphics.add(this.highlightGraphics[fid]);
    }


  }

  _zoomToSelected() {
    let thisWidget = this;

    if(this.highlightGraphics.length === 0){
      alert(StaticDevTools._getLabel(4,conf));
      return;
    }
    this._getGraphicsExtent(this.highlightGraphics, function(extent) {
      thisWidget.props.view.goTo(extent);
    });

  }

  _zoomToFiltered() {

    let thisWidget = this;
    if(this.filteredGraphics.length === 0){
      alert(StaticDevTools._getLabel(6,conf));
      return;
    }
    this._getGraphicsExtent(this.filteredGraphics, function(extent) {
      thisWidget.props.view.goTo(extent);
    });

  }

  _downloadSelected() {

    let thisWidget = this;
    let ids = [];
    for (var i = 0; i < this.highlightGraphics.length; i++) {
      if (this.highlightGraphics[i] !== undefined) {
        ids.push(i);
      }
    }

    if (ids.length === 0) {
      alert(StaticDevTools._getLabel(4, conf));
      return;
    }

    let mapserviceurl = this.layer.url;
    if (this.layer.type === "feature") {
      mapserviceurl = this.layer.parsedUrl.path;
    }
    let query = "1=1";
    let objectsIds = ""
    if (ids.length > 0) {
      objectsIds = ids.join(",");
    }

    let params = {
      "mapsevice": mapserviceurl,
      "query": query,
      "objectIds": objectsIds
    };

    //console.log(params);

    ManageRoles.getRole(function(role) {
      if (role === "sa" || role === "Administrador" || role === "Editor" || role === "Usuario") {

        thisWidget._download_gp.execute(params).then(thisWidget._download_resultgp);
      } else {
        alert("Operación no permitida");
      }
    });

  }

  _downloadAll() {

    let thisWidget = this;

    let mapserviceurl = this.layer.url;
    if (this.layer.type === "feature") {
      mapserviceurl = this.layer.parsedUrl.path;
    }
    let query = "1=1";
    let objectsIds = "0"

    let params = {
      "mapsevice": mapserviceurl,
      "query": query,
      "objectIds": objectsIds
    };

    //console.log(params);

    ManageRoles.getRole(function(role) {
      if (role === "sa" || role === "Administrador" || role === "Editor" || role === "Usuario") {
        thisWidget._download_gp.execute(params).then(thisWidget._download_resultgp);
      } else {
        alert("Operación no permitida");
      }
    });

  }

  _downloadFiltered() {

    let thisWidget = this;

    if (this.filtered.length === 0) {
      alert(StaticDevTools._getLabel(4, conf));
      return;
    }

    let mapserviceurl = this.layer.url;
    if (this.layer.type === "feature") {
      mapserviceurl = this.layer.parsedUrl.path;
    }
    let query = "";

    let objectsIds = ""
    if (this.filtered.length > 0) {
      objectsIds = this.filtered.join(",");
    }

    let params = {
      "mapsevice": mapserviceurl,
      "query": query,
      "objectIds": objectsIds
    };

    //console.log(params);

    ManageRoles.getRole(function(role) {
      if (role === "sa" || role === "Administrador" || role === "Editor" || role === "Usuario") {
        thisWidget._download_gp.execute(params).then(thisWidget._download_resultgp);
      } else {
        alert("Operación no permitida");
      }
    });

  }

  _download_resultgp(result) {
    //console.log(result);
    if (result.results.length > 0) {
      let downloadurl = result.results[0].value;

      window.open(downloadurl);
    } else {
      console.log("No results");
    }
  }

  _queryFLayerIds(ids, returnGeometry, callback) {

    let featureLayer,
      query;
    let thisWidget = this;
    if (this.layer.layer && this.layer.layer.type === "map-image") {
      let url = thisWidget.layer.url + "/" + thisWidget.sublayerid;

      featureLayer = new this.FeatureLayer({url: url});
    } else if (this.layer && this.layer.type === "feature") {
      featureLayer = thisWidget.layer;
    } else if (thisWidget.layer.type === "graphics") {

      let graphics = ids.map(function(fid) {
        let g = thisWidget.layer.graphics.items.filter(function(x) {
          return x.attributes.__OBJECTID === fid;
        });
        return g[0];
      });

      let data = {};
      data.features = graphics;
      callback(data);
      return;

    }

    query = new this.Query();
    query.objectIds = ids;
    query.returnGeometry = returnGeometry;
    query.outFields = "OBJECTID"

    featureLayer.queryFeatures(query).then(function(data) {

      callback(data);
    });

  }

  //Destroy chart before unmount.
  componentWillUnmount() {
    this.table.destroy();
  }

  render() {
    return (<div>
      <div className="row">
        <div className="col-xs-2 col-xs-push-1">
          <button className="btn btn-primary" onClick={this._zoomToSelected.bind(this)}>{StaticDevTools._getLabel(0, conf)}</button>
        </div>
        <div className="col-xs-2 col-xs-push-1">
          <button className="btn btn-primary" onClick={this._zoomToFiltered.bind(this)}>{StaticDevTools._getLabel(5, conf)}</button>
        </div>
        <div className="col-xs-2 col-xs-push-1">
          <button className="btn btn-primary" onClick={this._downloadAll.bind(this)}>{StaticDevTools._getLabel(1, conf)}</button>
        </div>
        <div className="col-xs-2 col-xs-push-1">
          <button className="btn btn-primary" onClick={this._downloadSelected.bind(this)}>{StaticDevTools._getLabel(2, conf)}</button>
        </div>
        <div className="col-xs-2 col-xs-push-1">
          <button className="btn btn-primary" onClick={this._downloadFiltered.bind(this)}>{StaticDevTools._getLabel(3, conf)}</button>
        </div>

      </div>
      <div className="row" id="tablerow">
        <table id={this.props.container}></table>
      </div>
    </div>)
  }
}
