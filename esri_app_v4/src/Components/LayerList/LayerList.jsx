import React from 'react';
import ReactDOM from 'react-dom';
import esriLoader from 'esri-loader';
// import DataTable from '../DataTable/DataTable.jsx';
import CustomModal from '../CustomModal/CustomModal.jsx';
import ChartForm from '../ChartForm/ChartForm.jsx';
import SymbologyForm from '../SymbologyForm/SymbologyForm.jsx';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import ManageRoles from "../StaticDevTools/ManageRoles.jsx";
import 'datatables.net';
import 'datatables.net-bs/js/dataTables.bootstrap';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './LayerList.css';

const conf = require('./widgetconfig.json');
const options = {
  url: 'https://js.arcgis.com/4.6'
};

export default class LayerList extends React.Component {

  constructor(props) {
    super(props);

    const thisWidget = this;

    window.PubSub.subscribe('updatelabels', this._updateLayerList.bind(this));

    esriLoader.loadModules([
      "esri/widgets/LayerList", "esri/geometry/Extent", "esri/tasks/Geoprocessor", 'react-dom'

    ], options).then(([LayerListDojo, Extent, Geoprocessor, ReactDOM]) => {

      thisWidget.Extent = Extent;
      thisWidget.LayerListDojo = LayerListDojo;

      let node = document.createElement("div");
      let listcontainer = document.getElementById("LayerlistDiv").appendChild(node);

      thisWidget.layerList = new LayerListDojo({view: props.view, container: listcontainer, listItemCreatedFunction: thisWidget._defineActions.bind(thisWidget)});

      thisWidget.layerList.on("trigger-action", thisWidget._triggerActions.bind(thisWidget));

      thisWidget._download_gp = new Geoprocessor(conf.downloadshpservice);
    });
  }

  _triggerActions(event) {
    let id,
      layer,
      mainLayer,
      confItem,
      layerid;
    //console.log(event);
    layerid = event.item.layer.id;
    id = event.action.id;

    //Check if is a FeatureLayer or a MapImageLayer service
    if (typeof(event.item.layer.name) !== "undefined") {
      layer = event.item.layer;
      mainLayer = layer;
      confItem = conf.LayerList.filter(x => x.layer === event.item.title);
    }else if(event.item.layer.type === "feature" && event.item.source !== null){
        layer = event.item.layer;
        mainLayer = layer;
        confItem = conf.LayerList.filter(x => x.layer === event.item.title);
    }
     else {
      layer = event.item.layer.layer;
      mainLayer = event.item.layer;
      confItem = conf.LayerList.filter(x => x.sublayer === event.item.title);
    }
    //console.log(confItem);
    switch (id) {
      case "full-extent":
      //console.log(layer);
        if (layer.type === "graphics") {
          let extent = this._getGraphicsExtent(layer.graphics.items);
          this.props.view.goTo(extent);
        } else if (layer.type  === "feature" && layer.source !== null){

          let extent = this._getGraphicsExtent(layer.source.items);
          this.props.view.goTo(extent);
        }
        else {
          this.props.view.goTo(layer.fullExtent);
        }
        break;
      case "information":

        this.openInformationPage(layer, confItem[0]);
        break;
      case "increase-opacity":
        this.setOpacityLayer(layer, true);
        break;
      case "decrease-opacity":
        this.setOpacityLayer(layer, false);
        break;
      case "load-table":
        this.loadDataTable(mainLayer);
        break;
      case "generate-chart":
        this.loadChart(layer, confItem, StaticDevTools.getCleanedString);

        break;
      case "generate-simbology":
        this.openSymbologyPanel(layer, confItem);
        break;
      case "download-layer":
        let thisWidget = this;
        ManageRoles.getRole(function(role) {
          if (role === "sa" || role === "Administrador" || role === "Editor" || role === "Usuario") {
            thisWidget._downloadLayer(layer, confItem, layerid);
          } else {
            alert("Operación no permitida");
          }
        });

        break;
      default:
        break;
    }
  }

  _downloadLayer(layer, confItem, layerid) {
    console.log("Downloading layer...");

    let mapserviceurl = layer.url + "/" + layerid;
    let query = "1=1";

    let params = {
      "mapsevice": mapserviceurl,
      "objectIds": 0,
      "query": query
    };

    this._download_gp.execute(params).then(this._download_resultgp);

  }

  _download_resultgp(result) {
    //console.log(result);
    if (result.results.length > 0) {
      let downloadurl = result.results[0].value;
    //  console.log("dsfadsfadsf dsfasf");
      window.open(downloadurl);
    } else {
      console.log("No results");
    }
  }
  _defineActions(event) {

    let item,
      confItem;
    item = event.item;

    let layertype = StaticDevTools.getLayerType(event.item.layer);
    conf.LayerList.forEach(function(layer) {
      if (typeof item.layer.name !== "undefined") {
        confItem = conf.LayerList.filter(
          x => (x.layer !== undefined)
          ? x.layer.toUpperCase() === item.layer.name.toUpperCase()
          : "");
      } else if (typeof(item.sublayer) !== "undefined") {
      //  console.log(item.sublayer);
        confItem = conf.LayerList.filter(
          x => (x.sublayer !== undefined)
          ? x.sublayer.toUpperCase() === item.layer.title.toUpperCase()
          : "");
      }
    });

    let actions = [];
    if (typeof (confItem) !== "undefined" && typeof(confItem[0]) !== "undefined") {
      confItem[0].actions.forEach(function(actionButton) {
        let action = conf["actionsSections"][actionButton];
        if (typeof(action.title) === "string") {} else {
          let locale = StaticDevTools._getLocale();
          action.title = action.title[locale];
        }
        action.id = actionButton;
        if (!(action.nonvalidtypes && action.nonvalidtypes.indexOf(layertype) > -1)) {
          actions.push(action);
        }
      });
      item.actionsSections = [actions];
    } else {

      for (var [key, action] of Object.entries(conf.actionsSections)) {
        if (typeof(action.title) === "string") {} else {
          let locale = StaticDevTools._getLocale();
          action.title = action.title[locale];
        }
        action.id = key;

        if (!(action.nonvalidtypes && action.nonvalidtypes.indexOf(layertype) > -1)) {
          actions.push(action);
        }
      }
      item.actionsSections = [actions];
    }

  }

  _updateLayerList() {

    this.layerList.destroy();
    let node = document.createElement("div");
    let listcontainer = document.getElementById("LayerlistDiv").appendChild(node);
    this.layerList = new this.LayerListDojo({view: this.props.view, container: listcontainer, listItemCreatedFunction: this._defineActions.bind(this)});

    this.layerList.on("trigger-action", this._triggerActions.bind(this));

    window.temp = this.layerList;
  }
  _getContainer() {
    let container;
    if (conf.definition.custom.intoc === true) {
      container = document.getElementById("widgetContent_" + conf.definition.id);
    } else {
      container = document.getElementById(conf.definition.custom.mountingnode);
    }
    return container;
  }

  _getGraphicsExtent(graphics) {

    let xmin,
      ymin,
      xmax,
      ymax,
      srs;
    let extent = new this.Extent();
    for (var i = 0; i < graphics.length; i++) {
      let g = graphics[i];
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
        //TODO get extent from non point geoemtries
        if (i === 0) {
          srs = g.geometry.spatialReference;
          xmin = g.geometry.extent.xmin;
          ymin = g.geometry.extent.ymin;
          xmax = g.geometry.extent.xmax;
          ymax = g.geometry.extent.ymax;
        }
        else {
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

    return extent;
  }

  setOpacityLayer(layer, increase) {
    if (increase) {
      if (layer.opacity < 1) {
        layer.opacity += 0.25
      }
    } else {
      if (layer.opacity > 0) {
        layer.opacity -= 0.25
      }
    }
  }

  openInformationPage(layer, confItem) {

    (confItem && confItem.urlInfo)
      ? window.open(confItem.urlInfo)
      : window.open(layer.url);
  }

  loadDataTable(layer) {
    let id,
      datatablesTab,
      tableElement,
      attributeExpanded;
    if (layer.type === "tile") {} else {
      id = StaticDevTools.getIdFromEsriLayer(layer);

      if (!document.getElementById("dataTableContainer").classList.contains('open')) {
        document.getElementById("button_splitter").click();
      }
      datatablesTab = document.querySelectorAll('[href="#dataTablesPanel"]');
      datatablesTab[0].click();
      //console.log('[href="#' + id + '_panel' + '"]');
      tableElement = document.querySelectorAll('[href="#' + id + '_panel"]');
      attributeExpanded = tableElement[0].getAttribute("aria-expanded");
      if (attributeExpanded === null || attributeExpanded === "false") {
        tableElement[0].click()
      }
    }

  }

  loadChart(layer, confItem, getCleanedString) {

    let sublayerSelected,
      sublayerSelected_url,
      layerFields,
      layerNumericFields,
      fieldtypes,
      body,
      elementModal,
      title;

    if (layer.sublayers !== undefined) {
      sublayerSelected = layer.sublayers.find(function(sublayer) {
        return sublayer.title === confItem[0].sublayer;
      });

      sublayerSelected_url = sublayerSelected.url;
    } else {
      sublayerSelected = layer;
      sublayerSelected_url = layer.url + "/0"
    }

    esriLoader.loadModules([
      "esri/layers/FeatureLayer", "esri/tasks/support/Query"
    ], options).then(([FeatureLayer, Query]) => {
      let featureLayer,
        query;
      featureLayer = new FeatureLayer({url: sublayerSelected_url});

      query = new Query();
      query.where = "1=1";
      query.outFields = "*";
      query.start = 1;
      query.num = 1;
      query.returnGeometry = false;
      featureLayer.queryFeatures(query).then(function(data) {
        layerFields = [];
        layerNumericFields = [];
        let numericFieldtypes =  [
          "small-integer",
          "integer",
          "single",
          "double",
          "long"
        ];
        fieldtypes = [
          "small-integer",
          "integer",
          "single",
          "double",
          "long",
          "date",
          "string"
        ];


        featureLayer.fields.forEach(function(field) {
          if (fieldtypes.includes(field.type)) {
            layerFields.push({name: field.name, type: field.type, domain: field.domain});
          }
          if (numericFieldtypes.includes(field.type)) {
            layerNumericFields.push({name: field.name, type: field.type, domain: field.domain});
          }
        });

        body = React.createElement(ChartForm, {
          layerFields: layerFields,
          layerNumericFields: layerNumericFields,
          sublayer: featureLayer
        });

        (confItem[0])
          ? title = confItem[0].tilte
          : title = layer.title;

        elementModal = React.createElement(CustomModal, {
          showModal: true,
          headerTitle: conf.actionsSections["generate-chart"].label_panel[StaticDevTools._getLocale()] + title,
          bodyModal: body
        });

        ReactDOM.render(elementModal, document.getElementById("App-Modal"));
      });

    });

  }

  openSymbologyPanel(layer, confItem) {
    let sublayerSelected,
      body,
      elementModal;

    if (layer.type === "tile") {} else {

      if (layer.sublayers) {
        sublayerSelected = layer.sublayers.find(function(sublayer) {
          return sublayer.title === confItem[0].sublayer;
        });
      } else {
        sublayerSelected = layer;
      }

      if (sublayerSelected.type === "graphics") {

        let layerFields = Object.keys(sublayerSelected.graphics.getItemAt(0).attributes);
        body = React.createElement(SymbologyForm, {
          sublayer: sublayerSelected,
          fields: layerFields,
          geometryType: "point"
        });
        elementModal = React.createElement(CustomModal, {
          showModal: true,
          headerTitle: conf.actionsSections["generate-simbology"].label_panel[StaticDevTools._getLocale()],
          bodyModal: body
        });
        ReactDOM.render(elementModal, document.getElementById("App-Modal"));
      } else {
        esriLoader.loadModules([
          "esri/layers/FeatureLayer", "esri/tasks/support/Query"
        ], options).then(([FeatureLayer, Query]) => {
          let featureLayer,
            query;
          featureLayer = new FeatureLayer({url: sublayerSelected.url});
          query = new Query();
          query.where = "1=1";
          query.outFields = "*";
          query.start = 1;
          query.num = 1;
          query.returnGeometry = false;
          featureLayer.queryFeatures(query).then(function(data) {
            let layerFields = []
            data.fields.forEach(function(field) {
              layerFields.push(field.name);
            });
            body = React.createElement(SymbologyForm, {
              sublayer: sublayerSelected,
              fields: layerFields,
              geometryType: featureLayer.geometryType
            });
            elementModal = React.createElement(CustomModal, {
              showModal: true,
              headerTitle: conf.actionsSections["generate-simbology"].label_panel[StaticDevTools._getLocale()],
              bodyModal: body
            });
            ReactDOM.render(elementModal, document.getElementById("App-Modal"));
          });
        });
      }
    }
  }

  componentDidMount() {}

  render() {
    return (<div id='LayerlistDiv'></div>);
  }
}
