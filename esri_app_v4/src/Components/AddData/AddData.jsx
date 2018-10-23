import React from 'react';
import ReactDOM from 'react-dom';
import esriLoader from 'esri-loader';
import {Panel} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import {Tooltip} from 'react-bootstrap';
import {OverlayTrigger} from 'react-bootstrap';
import CustomModal from '../CustomModal/CustomModal.jsx';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import Select2 from 'react-select2-wrapper';


import './AddData.css';
const appconf = require('../../appconf.json');
const conf = require('./widgetconfig.json');




export default class AddData extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      open: true,
      view: props.view,
      data: "",
      inputNameValue: "csvLayer",
      inputSeparatorCharValue: ",",
      filesAdded: [],
      labels: conf.labels
    };

    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    this._loadURL = this._loadURL.bind(this);
    this._handleFileSelect = this._handleFileSelect.bind(this);
    this._handleDragOver = this._handleDragOver.bind(this);
    this._readCSVfile = this._readCSVfile.bind(this);
    this._selectLatLonFields = this._selectLatLonFields.bind(this);
    this._addCSVfiletoLayer = this._addCSVfiletoLayer.bind(this);
    this._CSVtoJSON = this._CSVtoJSON.bind(this);
    this._generateFeatureCollectionTemplate = this._generateFeatureCollectionTemplate.bind(this);
    this._generateFeatureCollection = this._generateFeatureCollection.bind(this);
    this._createModal = this._createModal.bind(this);
    this._updateNameLayerValue = this._updateNameLayerValue.bind(this);
    this._updateSeparatorCharValue = this._updateSeparatorCharValue.bind(this);

    let thisWidget = this;
    esriLoader.loadModules([
      "dojo/on", "dojo/dom", "dojo/sniff","esri/config"

    ], appconf.esriversion).then(([on, dom, sniff,esriConfig]) => {

      thisWidget.on = on;
      thisWidget.dom = dom;
      thisWidget.sniff = sniff;

      // esriConfig.request.interceptors.push({
      //     // set the `urls` property to the URL of the FeatureLayer so that this
      //     // interceptor only applies to requests made to the FeatureLayer URL
      //     urls: "http://ideo-manager.ieo.es/proxy/DotNet/proxy.ashx?https://barretosm.md.ieo.es/portal/sharing/rest/content/features/generate",
      //     // use the BeforeInterceptorCallback to check if the query of the
      //     // FeatureLayer has a maxAllowableOffset property set.
      //     // if so, then set the maxAllowableOffset to 0
      //     // before: function(params) {
      //     //   if (params.requestOptions.query.maxAllowableOffset) {
      //     //     params.requestOptions.query.maxAllowableOffset = 0;
      //     //   }
      //     // },
      //     // use the AfterInterceptorCallback to check if `ssl` is set to 'true'
      //     // on the response to the request, if it's set to 'false', change
      //     // the value to 'true' before returning the response
      //     after: function(response) {
      //     console.log(response)
      //     }
      //   });


    }).catch(err => {
      console.error(err);
    });

  }

  _openFile() {
    document.getElementById('selectedFile').click();
  }

  _handleFileSelect(evt) {

    evt.stopPropagation();
    evt.preventDefault();

    let files;

    (evt.dataTransfer !== undefined)
      ? files = evt.dataTransfer.files
      : files = evt.target.files;

    // files is a FileList of File objects. List some properties.
    // let output = [];
    for (var i = 0; i < files.length; i++) {
      let f = files[i];

      switch (f.type) {
        case "application/vnd.ms-excel":
          this._readCSVfile(f);
          break;
        case "application/zip":
          this._readZipFile(f);
          break;
        default:
          console.log("Data type not valid");
          console.log(f.type);
          break;
      }

    }
  }

  _readZipFile(f) {
    //TODO https://developers.arcgis.com/javascript/3/sandbox/sandbox.html?sample=portal_addshapefile&share=false

  }
  _handleDragOver(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
  }
  _readCSVfile(file) {
    // let addCSVfiletoLayer = this._addCSVfiletoLayer;
    let selectLatLonFields = this._selectLatLonFields;
    let reader = new FileReader();
    // Closure to capture the file information.
    reader.onload = (function(theFile) {
      return function(e) {
        selectLatLonFields(e.target.result);
      };
    })(file);
    // Read in the image file as a data URL.
    reader.readAsText(file);
  }

  _selectLatLonFields(store) {
    this.setState({data: store});
    let JSONfile = this._CSVtoJSON(store);
    let fields;
    // let fields, body, elementModal;
    fields = [];

    Object.entries(JSONfile[0]).forEach(([key, value]) => {
      var parsedValue = Number(value);
      if (!isNaN(parsedValue)) { //check first value and see if it is a number
        fields.push({text: key, id: key});
      }
    });

    this._createModal(fields);
  }

  _createModal(fields) {

    let bodyModal = React.createElement("form", {
      onSubmit: this._addCSVfiletoLayer
    }, React.createElement("div", {
      className: 'row row-ModalForm'
    }, React.createElement("div", {
      className: 'col-md-5'
    }, React.createElement("label", {}, "Selecciona campo longitud")), React.createElement("div", {
      className: 'col-md-4'
    }, React.createElement(Select2, {
      className: "select2container",
      id: "longitudeSelector",
      options: {
        placeholder: 'Selecccionar Campo',
        width: '100%'
      },
      data: fields
    }))), React.createElement("div", {
      className: 'row row-ModalForm'
    }, React.createElement("div", {
      className: 'col-md-5'
    }, React.createElement("label", {}, "Selecciona campo latitud")), React.createElement("div", {
      className: 'col-md-4'
    }, React.createElement(Select2, {
      className: "select2container",
      id: "latitudeSelector",
      options: {
        placeholder: 'Selecccionar Campo',
        width: '100%'
      },
      data: fields
    }))), React.createElement("div", {
      className: 'row row-ModalForm'
    }, React.createElement("div", {
      className: 'col-md-5'
    }, React.createElement("label", {
      className: 'labelModalForm'
    }, "Introduce un nombre de capa")), React.createElement("div", {
      className: 'col-md-4',
      id: 'nameLayerContain'
    })), React.createElement("div", {
      className: 'row row-ModalForm'
    }, React.createElement("Button", {
      className: "btn center-block btn-primary",
      type: "submit"
    }, "Añadir capa")));

    let new_content = <CustomModal id="customModal" showModal={true} headerTitle={StaticDevTools._getLabel(7, conf)} bodyModal={bodyModal}></CustomModal>;

    this.setState({modal: new_content});

    ReactDOM.render(<input placeholder="Solo texto, números o símbolo _" className='input-ModalForm' onChange={this._updateNameLayerValue}/>, document.getElementById("nameLayerContain"));
  }

  _addCSVfiletoLayer(e) {
    e.preventDefault();
    let longitudeSelect,
      latitudeSelect,
      longitudeFieldValue,
      latitudeFieldValue,
      nameLayerValue,
      JSONfile,
      featureCollection,
      view;

    longitudeSelect = document.getElementById('longitudeSelector');
    latitudeSelect = document.getElementById('latitudeSelector');
    nameLayerValue = this.state.inputNameValue;

    if (longitudeSelect.options[longitudeSelect.selectedIndex] !== undefined && latitudeSelect.options[latitudeSelect.selectedIndex] !== undefined) {
      longitudeFieldValue = longitudeSelect.options[longitudeSelect.selectedIndex].value;
      latitudeFieldValue = latitudeSelect.options[latitudeSelect.selectedIndex].value;

      document.getElementById("cancel-btn").click();

      let liElement = document.createElement("li");
      let strongElement = document.createElement("strong");
      let textnode = document.createTextNode(nameLayerValue);
      strongElement.appendChild(textnode);
      liElement.appendChild(strongElement);
      this.state.filesAdded.push(liElement);
      document.getElementById('listFilesAddData').appendChild(liElement);

      JSONfile = this._CSVtoJSON(this.state.data);
      featureCollection = this._generateFeatureCollectionTemplate(JSONfile);
      view = this.props.view;

      esriLoader.loadModules([
        "esri/geometry/support/webMercatorUtils",
        "esri/Graphic",
        "esri/geometry/Point",
        "esri/layers/GraphicsLayer",
        "esri/layers/FeatureLayer",
        "react-dom"

      ], appconf.esriversion).then(([
        webMercatorUtils,
        Graphic,
        Point,
        GraphicsLayer,
        FeatureLayer,
        ReactDOM
      ]) => {
        let objectId = 0;

        Object.entries(JSONfile).forEach(([key, item]) => {
          let attrs = Object.keys(item);
          let attributes = {};
          attributes["__OBJECTID"] = objectId;
          attrs.forEach(function(attr) {
            attributes[attr] = item[attr];
          });

          objectId++;

          var latitude = parseFloat(attributes[latitudeFieldValue]);
          var longitude = parseFloat(attributes[longitudeFieldValue]);

          if (isNaN(latitude) || isNaN(longitude)) {
            return;
          }
          //let spatialReference;
          //let geometry = webMercatorUtils.geographicToWebMercator(new Point(longitude, latitude));
          //spatialReference = geometry.toJSON().spatialReference;

          // First create a point geometry
          let point = {
            type: "point", // autocasts as new Point()
            longitude: longitude,
            latitude: latitude
          };

          // Create a symbol for drawing the point
          let markerSymbol = {
            type: "simple-marker", // autocasts as new SimpleMarkerSymbol()
            color: [226, 119, 40]
          };

          // Create a graphic and add the geometry and symbol to it
          let pointGraphic = new Graphic({geometry: point, symbol: markerSymbol, attributes: attributes});

          featureCollection.featureSet.features.push(pointGraphic);

        });

        let graphicLayer = new GraphicsLayer({graphics: featureCollection.featureSet.features, id: nameLayerValue, name: nameLayerValue, title: nameLayerValue, visible: true});

        view.map.layers.add(graphicLayer);

        view.goTo(graphicLayer.graphics, {animate: false}).then(function(response) {
          var zoomView = {};
          zoomView = view.extent.expand(2.0);
          view.goTo(zoomView);
        });

      });
    }
  }

  _CSVtoJSON(csv) {

    let lines = csv.split("\n");

    let result = [];

    let headers = lines[0].split(this.state.inputSeparatorCharValue);
    headers[headers.length - 1] = headers[headers.length - 1].slice(0, -1);
    for (let i = 1; i < lines.length; i++) {

      let obj = {};
      let currentline = lines[i].split(",");
      currentline[currentline.length - 1] = currentline[currentline.length - 1].slice(0, -1);

      for (let j = 0; j < headers.length; j++) {
        obj[headers[j]] = currentline[j];
      }

      result.push(obj);
    }

    return result; //JavaScript object
    // return JSON.stringify(result); JSON
  }

  _generateFeatureCollectionTemplate(store) {
    //create a feature collection for the input csv file
    var featureCollection = {
      "layerDefinition": null,
      "featureSet": {
        "features": [],
        "geometryType": "esriGeometryPoint"
      }
    };
    featureCollection.layerDefinition = {
      "geometryType": "esriGeometryPoint",
      "objectIdField": "__OBJECTID",
      "type": "Feature Layer",
      "typeIdField": "",
      "fields": [
        {
          "name": "__OBJECTID",
          "alias": "__OBJECTID",
          "type": "esriFieldTypeOID",
          "editable": false,
          "domain": null
        }
      ],
      "types": [],
      "capabilities": "Query"
    };

    //let fields = Object.keys(store[0]);

    Object.entries(store[0]).forEach(([key, value]) => {
      var parsedValue = Number(value);
      if (isNaN(parsedValue)) { //check first value and see if it is a number
        featureCollection.layerDefinition.fields.push({"name": key, "alias": key, "type": "esriFieldTypeString", "editable": true, "domain": null});
      } else {
        featureCollection.layerDefinition.fields.push({"name": key, "alias": key, "type": "esriFieldTypeDouble", "editable": true, "domain": null});
      }
    });

    return featureCollection;
  }

  _loadURL() {

    let urlWMS,
      map;
    map = this.state.view.map;
    urlWMS = document.getElementById('selectedURL').value;
    if (StaticDevTools.isURL(urlWMS)) {
      StaticDevTools.getESRILayer("WMSLayer", {
        "name": "prueba",
        "id": "prueba",
        "url": urlWMS,
        "visible": true
      }, function(layerObject) {
        layerObject != null && map.add(layerObject);
      });
    }
  }

  _updateNameLayerValue(evt) {
    this.setState({inputNameValue: evt.target.value});
  }

  _updateSeparatorCharValue(evt) {
    this.setState({inputSeparatorCharValue: evt.target.value});
  }

  _generateFeatureCollection(fileName) {
    // console.log(fileName);
    // console.log(this);

    var name = fileName.split(".");
    //Chrome and IE add c:\fakepath to the value - we need to remove it
    //See this link for more info: http://davidwalsh.name/fakepath
    name = name[0].replace("c:\\fakepath\\", "");

    let thisWidget = this;

    esriLoader.loadModules([
      "dojo/dom",
      "esri/request",
      "dojo/_base/array",
      "esri/PopupTemplate",
      "esri/layers/FeatureLayer",
      "esri/renderers/SimpleRenderer",
      "esri/geometry/Polygon",
      "esri/geometry/Polyline",
      "esri/geometry/Point",
      "esri/symbols/PictureMarkerSymbol",
      "esri/symbols/SimpleFillSymbol",
      "esri/symbols/SimpleLineSymbol",
      "esri/Color",
      "dojo/_base/lang",
      "dojo/parser"
    ], appconf.esriversion).then(([
      dom,
      request,
      arrayUtils,
      PopupTemplate,
      FeatureLayer,
      SimpleRenderer,
      Polygon,
      Polyline,
      Point,
      PictureMarkerSymbol,
      SimpleFillSymbol,
      SimpleLineSymbol,
      Color,
      lang,
      parser
    ]) => {

      parser.parse();

      dom.byId('upload-status').innerHTML = '<b>Loading… </b>' + name;

      //Define the input params for generate see the rest doc for details
      //http://www.arcgis.com/apidocs/rest/index.html?generate.html
      // var params = {
      //   'name': name
      //
      // };

      function getRender(type) {
        //change the default symbol for the feature collection for polygons and points
        let renderer;
        switch (type) {
          case 'esriGeometryPoint':
            renderer = {
              type: "simple",  // autocasts as new SimpleRenderer()
              symbol: {
                type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
                size: 6,
                color: "black",
                outline: {  // autocasts as new SimpleLineSymbol()
                  width: 0.5,
                  color: "white"
                }
              }
            };

            break;
          case 'esriGeometryPolygon':
            renderer = {
              type: "simple",  // autocasts as new SimpleRenderer()
              symbol: {
                type: "simple-fill",  // autocasts as new SimpleFillSymbol()
                color: [ 255, 128, 0, 0.5 ],
                outline: {  // autocasts as new SimpleLineSymbol()
                  width: 1,
                  color: "white"
                }
              }
            };

            break;
            case "esriGeometryPolyline":
            renderer = {
              type: "simple",  // autocasts as new SimpleRenderer()
              symbol: {
                type: "simple-line",  // autocasts as new SimpleFillSymbol()
                  width: 1,
                  color: "red"
              }
            };

              break;
          default:
            console.log("NO Renderer!!!!");
            console.log(type);
            break;
        }
        return renderer;

      }

      function addShapefileToMap(featureCollection) {

        //console.log(featureCollection);

        //let fields = [{alias: "FID", name: "FID", type: "oid"},{alias: "ESPECIES", name: "ESPECIES", type: "string"}]
        let features = featureCollection.featureSet.features;

        if (featureCollection.featureSet.geometryType === "esriGeometryPolygon"){
          features = featureCollection.featureSet.features.map((feat,index) => {
            let f = {
              geometry: new Polygon(
                {
                  rings: feat.geometry.rings,
                  spatialReference: featureCollection.featureSet.spatialReference
              }),
            attributes :feat.attributes
            }
            return f;
          });
        }

        if (featureCollection.featureSet.geometryType === "esriGeometryPoint"){
          features = featureCollection.featureSet.features.map((feat,index) => {
            let f = {
              geometry: new Point(
                {
                  x: feat.geometry.x,
                  y: feat.geometry.y,
                  spatialReference: featureCollection.featureSet.spatialReference
              }),
            attributes :feat.attributes
            }
            return f;
          });
        }

        if (featureCollection.featureSet.geometryType === "esriGeometryPolyline"){
          features = featureCollection.featureSet.features.map((feat,index) => {
            let f = {
              geometry: new Polyline(
                {
                  paths: feat.geometry.paths,
                  spatialReference: featureCollection.featureSet.spatialReference
              }),
            attributes :feat.attributes
            }
            return f;
          });
        }

        //console.log(features);
        //features.geometryType = "polygon";
        var l = new FeatureLayer({

   // create an instance of esri/layers/support/Field for each field object
           fields: featureCollection.layerDefinition.fields,
           objectIdField: featureCollection.layerDefinition.objectIdField,
           geometryType: featureCollection.featureSet.geometryType,
           spatialReference: featureCollection.featureSet.spatialReference,
           source: features,
           renderer: getRender(featureCollection.featureSet.geometryType),
           title: featureCollection.layerDefinition.name
            //  an array of graphics with geometry and attributes
                             // popupTemplate and symbol are not required in each graphic
                             // since those are handled with the popupTemplate and
                             // renderer properties of the layer
           //popupTemplate: pTemplate,
           //renderer: uvRenderer  // UniqueValueRenderer based on `type` attribute
        });


        // console.log(thisWidget);
        // console.log(l);
        thisWidget.props.view.map.add(l);
        ///thisWidget.props.view.map.setExtent(fullExtent.expand(1.25), true);

        dom.byId('upload-status').innerHTML = "";
      }

      request('https://barretosm.md.ieo.es/portal/sharing/rest/content/features/generate', {
        //query  : myContent,
        method : "post",
        useProxy : false,
        body: dom.byId('uploadForm'),
        responseType: 'json'
      }).then(function(response) {
        //console.log(response);
        addShapefileToMap(response.data.featureCollection.layers[0]);
        alert(StaticDevTools._getLabel(9, conf));
      });

    }).catch(err => {
      console.error(err);
    });

  }

  componentWillMount() {}

  componentDidMount() {
    // Setup the dnd listeners.
    let dropZone = document.getElementById('DragDropPanel');
    dropZone.addEventListener('dragover', this._handleDragOver, false);
    dropZone.addEventListener('drop', this._handleFileSelect, false);

    let thisWidget = this;
    esriLoader.loadModules([
      "dojo/on", "dojo/dom", "dojo/sniff"

    ], appconf.esriversion).then(([on, dom, sniff]) => {
      on(dom.byId("uploadForm"), "change", function(event) {
        var fileName = event.target.value.toLowerCase();

        if (sniff("ie")) { //filename is full path in IE so extract the file name
          var arr = fileName.split("\\");
          fileName = arr[arr.length - 1];
        }
        if (fileName.indexOf(".zip") !== -1) { //is file a zip - if not notify user
          thisWidget._generateFeatureCollection(fileName);
        } else {
          dom.byId('upload-status').innerHTML = '<p style="color:red">Add shapefile as .zip file</p>';
        }
      });

    }).catch(err => {
      console.error(err);
    });

  }

  render() {
    const tooltip = <Tooltip placement="top" className="tooltipTemplate" id="modal-tooltip">{StaticDevTools._getLabel(1, conf)}</Tooltip>;
    return (<div className='AddDataDiv'>
      <Panel id="addDataTabs"  expanded={this.state.open}>
        <div className="container">
          <ul className="nav nav-tabs">
            <li className="active">
              <a href="#files_AddData_Panel" data-toggle="tab">{StaticDevTools._getLabel(4, conf)}</a>
            </li>
            <li>
              <a href="#address_AddData_Panel" data-toggle="tab">{StaticDevTools._getLabel(5, conf)}</a>
            </li>
            <li>
              <a href="#shp_AddData_Panel" data-toggle="tab">{StaticDevTools._getLabel(8, conf)}</a>
            </li>
          </ul>
          <div className="tab-content ">
            <div className="tab-pane active" id="files_AddData_Panel">
              <Panel id="DragDropPanel">
                <h5>
                  <span>{StaticDevTools._getLabel(3, conf)}</span>
                </h5>
                <input type="file" id="selectedFile" style={{
                    display: "none"
                  }} accept=".csv" onChange={(event) => this._handleFileSelect(event)}/>
                <Button bsStyle="primary" className="btn-AddData center-block" onClick={() => this._openFile()}>{StaticDevTools._getLabel(0, conf)}</Button>
                <output>
                  <ol id="listFilesAddData"></ol>
                </output>
              </Panel>
              <div className='row'>
                <div className='col-md-12'>
                  <OverlayTrigger overlay={tooltip}>
                    <a className="linkTooltip" href="#tooltip">
                      <span className="glyphicon glyphicon-info-sign colorinfoIcons infoIconAddData" aria-hidden="true"></span>
                      <label className='label-AddDataCont'>{StaticDevTools._getLabel(2, conf)}
                        <input className='input-AddDataCont' onChange={this._updateSeparatorCharValue}/>
                      </label>
                    </a>
                  </OverlayTrigger>
                </div>
              </div>
            </div>
            <div className="tab-pane" id="address_AddData_Panel">
              <div className="form-group row">
                <label for="example-url-input" className="col-2 col-form-label">URL</label>
                <div className="col-10">
                  <input id="selectedURL" className="form-control" type="url" placeholder="http://wms.mapama.es/sig/Biodiversidad/OSPAR/wms.aspx?"/>
                </div>
                <div className="col-12 row-ModalForm">
                  <Button type="button" bsStyle="primary" className="center-block" onClick={() => this._loadURL()}>{StaticDevTools._getLabel(6, conf)}</Button>
                </div>
              </div>
            </div>
            <div className="tab-pane" id="shp_AddData_Panel">
              <div className="form-group row">
                <div className="col-xs-12">
                  <form enctype="multipart/form-data" method="post" id="uploadForm">
                    <div className="field">
                      <label class="file-upload">
                        <span>
                          <strong>Add File</strong>
                        </span>
                        <input type="file" name="file" id="inFile"/>
                        <input type="hidden" name="publishParameters" value="{'name':'test'}"/>
                        <input type="hidden" name="filetype" value="shapefile"/>
                        <input type="hidden" name="f" value="json"/>

                      </label>
                    </div>
                  </form>
                  <span className="file-upload-status" id="upload-status"></span>
                  <div id="fileInfo">&nbsp;</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Panel>
      {this.state.modal}
    </div>);
  }
}
