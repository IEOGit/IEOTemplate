import React, {Component} from 'react';
import esriLoader from 'esri-loader';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import ManageRoles from "../StaticDevTools/ManageRoles.jsx";
import './EsriMap.css';
// import Cookies from 'js-cookie';

const conf = require('./widgetconfig.json');
const appconf = require('../../appconf.json');

export default class EsriMap extends Component {

  componentDidMount() {

    var thisWidget = this;

    esriLoader.loadModules([
      'esri/Map',
      'esri/views/MapView',
      'esri/layers/FeatureLayer',
      'esri/layers/TileLayer',
      'esri/layers/WMSLayer',
      "esri/layers/MapImageLayer",
      "esri/layers/ImageryLayer",
      "esri/layers/CSVLayer",
      "esri/widgets/Home",
      "esri/widgets/BasemapGallery",
      "esri/widgets/Expand",
      "esri/widgets/ScaleBar",
      "esri/widgets/Fullscreen",
      "esri/widgets/Compass",
      "esri/config",
      "esri/core/urlUtils",
      'react-dom'

    ], appconf.esriversion).then(([
      Map,
      MapView,
      FeatureLayer,
      TileLayer,
      WMSLayer,
      MapImageLayer,
      ImageryLayer,
      CSVLayer,
      Home,
      BasemapGallery,
      Expand,
      ScaleBar,
      Fullscreen,
      Compass,
      esriConfig,
      urlUtils,
      ReactDOM
    ]) => {
      let map = new Map({basemap: conf.basemap});

      //esriConfig.request.corsEnabledServers.push("localhost:60859");
      esriConfig.request.proxyUrl = appconf.proxyurl;
      esriConfig.request.forceProxy = false;
      // console.log(esriConfig.request.httpsDomains);
      // esriConfig.request.httpsDomains.push("adsfsaf.es");

      let view = new MapView({map: map, container: "mapContainer", center: conf.initdata.center, zoom: conf.initdata.zoom});

      view.onClickTools = [];
      view.deactivateTools = thisWidget.deactivateTools;
      view.when(function() {
        //console.log("Map loaded");
        //BaseMapGallery Widget
        if (conf.basemapGallery) {
          thisWidget.loadbasemapGallery(BasemapGallery, Expand, view);
        }
        //HomeButtom Widget
        if (conf.homeButtom.visible) {
          thisWidget.homeButtom(Home, view);
        }
        //ScaleBar Widget
        if (conf.scalebar.visible) {
          thisWidget.loadScaleBar(ScaleBar, view);
        }
        //FullScreen Widget
        if (conf.fullScreenButtom.visible) {
          thisWidget.loadFullScreenButton(Fullscreen, view);
        }
        //Compass Widget
        if (conf.compass.visible) {
          thisWidget.loadCompass(Compass, view);
        }
        thisWidget.props.widgets.forEach(function(ele) {
          let Component = require("../" + ele + "/" + ele + ".jsx").default;
          let componentConf = require("../" + ele + "/widgetconfig.json");
          let id_widget = componentConf.definition.id;

          ManageRoles.isWidgetAllowed(id_widget, function(permited) {
            if (componentConf.definition.onviewloaded === true && permited === "true") {
              let mountingnode = "";
              if (componentConf.definition.custom.inPanel === true) {
                mountingnode = 'widgetContent_' + componentConf.definition.id;
              } else {
                mountingnode = componentConf.definition.custom.mountingnode;
              }

              if (componentConf.definition.layers) {
                ReactDOM.render(<Component key={ele} view={view} layers={conf.layers}/>, document.getElementById(mountingnode));
              } else {
                ReactDOM.render(<Component key={ele} view={view}/>, document.getElementById(mountingnode));
              }
            }
          });

        });

        thisWidget.loadLayers(map);

      }, function(error) {
        // This function will execute if the promise is rejected due to an error
      });

    }).catch(err => {
      console.error(err);
    });

  }

  loadCompass(Compass, view) {
    let compass;
    compass = new Compass({view: view});
    view.ui.add(compass, {position: conf.compass.position});
  }

  loadFullScreenButton(Fullscreen, view) {
    let applicationDiv = document.getElementById('mapContainer');
    view.ui.add(new Fullscreen({view: view, element: applicationDiv}), conf.fullScreenButtom.position);
  }

  loadScaleBar(ScaleBar, view) {
    let scaleBar = new ScaleBar({id: "scalebarWidget", view: view});
    view.ui.add([
      {
        component: scaleBar,
        position: conf.scalebar.position
      }
    ]);
  }
  homeButtom(Home, view) {
    let home;
    home = new Home({view: view});
    view.ui.add(home, {position: conf.homeButtom.position});
  }

  loadLayers(map) {
    Object.keys(conf.layers).map(function(objectKey, index) {
      let layer = conf.layers[objectKey];
      StaticDevTools.getESRILayer(layer.type, layer.options, function(layerObject) {
        layerObject != null && map.add(layerObject);
      });
      return null;
    });
  }

  loadbasemapGallery(BasemapGallery, Expand, view) {
    let basemapGallery = new BasemapGallery({view: view, container: document.createElement("div")});
    let bgExpand = new Expand({view: view, content: basemapGallery.domNode, expandIconClass: "esri-icon-basemap"});
    view.ui.add(bgExpand, "top-right");
  }

  deactivateTools() {

    for (var i = 0; i < this.onClickTools.length; i++) {
      let tool = this.onClickTools[i];
      tool.deactivateTool();
    }
  }

  render() {
    return (<div id="mapContainer">

      <div id="coords" className="sidebarMargin"></div>

      <div id="datatablepanel"></div>
    </div>);
  }
}
