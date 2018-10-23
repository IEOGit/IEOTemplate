import React from 'react';
import './ViewEsri3D.css';
import esriLoader from 'esri-loader';
import 'font-awesome/css/font-awesome.css'
import $ from 'jquery';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";

import 'select2/dist/css/select2.min.css'
import 'select2/dist/js/select2.min.js'

const conf = require('./widgetconfig.json');
const appconf = require('../../appconf.json');


export  default class ViewEsri3D extends React.Component {

  constructor(props) {
    super(props);

    //console.log(props);
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this,conf));
    //bindings...
    this._open3DViewer = this._open3DViewer.bind(this);
    this._close3DViewer = this._close3DViewer.bind(this);
    this._changeVisible = this._changeVisible.bind(this);
    this._toggle3dSidebar = this._toggle3dSidebar.bind(this);

    this.viewContainer = this.props.view.container;
    this.threeDLayers = []
    this.uiElements = []
    this.state = {"threedbuttonDisabled": "disabled","content3d":null,"labels":conf.labels}


    $('#modalView3d').on('hidden.bs.modal', this.view3dclose);

    let thisWidget   = this;

     esriLoader.loadModules([
      "esri/Map",
      "esri/views/SceneView",
      "esri/layers/ElevationLayer",
      "esri/layers/BaseElevationLayer",
      "esri/layers/ImageryLayer",
      "esri/tasks/QueryTask", "esri/tasks/support/Query",
      "esri/geometry/Extent",
      "esri/config",
      "esri/core/urlUtils",
       'react-dom'

     ], appconf.esriversion)
     .then(([ Map, SceneView,ElevationLayer,BaseElevationLayer,ImageryLayer,QueryTask, Query,Extent,
       esriConfig,urlUtils,
       ReactDOM]) => {

         thisWidget.BaseElevationLayer = BaseElevationLayer;
         thisWidget.ImageryLayer = ImageryLayer;
         thisWidget.Extent = Extent;
         thisWidget.ElevationLayer = ElevationLayer;
         thisWidget.Query = Query;
         thisWidget.QueryTask = QueryTask;

         esriConfig.request.proxyUrl = appconf.proxyurl;
         esriConfig.request.forceProxy= false;

         var params = {
                 map: thisWidget.props.view.map,
                 zoom: thisWidget.props.view.zoom,
                 center: thisWidget.props.view.center,
                 container: null
               };

        thisWidget.sceneView = new SceneView(params);

        for (var i = 0 ; i < conf.groundlayers.length; i++){
          let glayer = conf.groundlayers[i];
          let urlname = thisWidget._extractHostname(glayer.url);
        //  console.log(urlname);
          urlUtils.addProxyRule({
            urlPrefix: urlname,
            proxyUrl: appconf.proxyurl
          });
          esriConfig.request.corsEnabledServers.push(urlname);
        }

        this.setState({"threedbuttonDisabled": ""});

     })
     .catch(err => {
       console.error(err);
     });
  }


  _extractHostname(url) {
    var hostname;
    //find & remove protocol (http, ftp, etc.) and get hostname
    if (url.indexOf("://") > -1) {
        hostname = url.split('/')[2];
    }
    else {
        hostname = url.split('/')[0];
    }
    //find & remove port number
    hostname = hostname.split(':')[0];
    //find & remove "?"
    hostname = hostname.split('?')[0];
    return hostname;
}

  _addThreeDLayers(){

    let thisWidget = this;
    esriLoader.loadModules([
     "esri/layers/FeatureLayer",
      'react-dom'
    ], appconf.esriversion)
    .then(([ FeatureLayer,
      ReactDOM]) => {

        this.threeDLayers = [];
        for (var i = 0 ; i < conf.threeDLayers.length; i++){
          let lconf = conf.threeDLayers[i];
          if (lconf.outFields === undefined){
            lconf.outFields = ["*"];
          }

          let flayer = new FeatureLayer(lconf);
          this.threeDLayers.push(flayer);
          this.sceneView.map.add(flayer)
        }
        thisWidget._update3dToc();
    })
    .catch(err => {
      console.error(err);
    });
  }

  _getFieldByName(fieldname,fields){
    for(var i = 0; i < fields.length; i++){
      if (fields[i].name === fieldname){
        return fields[i];
      }
    }
  }
  _update3dToc(){

    let thisWidget = this;
    this._readyFlayers(function(){

      let layerdiv = thisWidget.threeDLayers.map((flayer,index) =>{
        let title = flayer.title;
        let layerid = "3dlayer_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let fieldinputid = "3dfield_selector_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let mininputid = "mininput_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let maxinputid = "maxinput_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let visiblelayerid = "visibleLayer_" +  StaticDevTools.getIdFromEsriLayer(flayer);
        let colapse3d = "collapse3d_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let colapse3dref = "#" + colapse3d;
        let optionsSymbolPrimitives = ["sphere","cylinder","cone","cube","diamond","tetrahedron"];
        let primitiveid = "primitivesymbol_" + StaticDevTools.getIdFromEsriLayer(flayer);

        let width3did = "width3d_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let colormin = "mincolorid_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let colormax = "maxcolorid_" + StaticDevTools.getIdFromEsriLayer(flayer);

        let sizemin = "minsizeid_" + StaticDevTools.getIdFromEsriLayer(flayer);
        let sizemax = "maxsizeid_" + StaticDevTools.getIdFromEsriLayer(flayer);

        let symbolobtions = optionsSymbolPrimitives.map((primitive,index) => {
          return <option key={index} value={primitive}>{primitive}</option>
        });
        let fieldselectoroptions;
        if(flayer.outFields[0] !== "*"){
          fieldselectoroptions = flayer.outFields.map((fieldname,index2) => {

            let field = thisWidget._getFieldByName(fieldname,flayer.fields);
             let alias = field.alias;
             let name = field.name;
              if(field.type === "integer" || field.type ===  "double"){
                return <option key={index2} value={name}>{alias}</option>
              }
              else return null;
          });
        }
        else{

          fieldselectoroptions = flayer.fields.map((field,index2) => {

             let alias = field.alias;
             let name = field.name;
              if(field.type === "integer" || field.type ===  "double"){
                return <option key={index2} value={name}>{alias}</option>
              }
              else return null;
          });

        }
        return(
          <div key={index} className="panel panel-primary">
            <div className="panel-heading heading3dlayer">
                <a data-toggle="collapse" href={colapse3dref} >{title}</a>
                <input type="checkbox"  className="pull-right"onChange={thisWidget._changeVisibleLayer3d.bind(thisWidget,visiblelayerid)} defaultChecked id={visiblelayerid} />
          </div>
            <div className="panel-body collapse" id={colapse3d}>
              <div className="container" >

                  <div className="form-group">
                      <label className="control-label">{StaticDevTools._getLabel(4,conf)}</label>
                      <select className="select2input form-control" id={fieldinputid}>{fieldselectoroptions}</select>
                    </div>


                    <div className="row text-justify">
                      <div className="col-xs-4"><label className="control-label">{StaticDevTools._getLabel(5,conf)}</label></div>
                      <div className="col-xs-4"><input className="form-control" id={mininputid} type="number" step="any" /></div>
                      <div className="col-xs-4"><button className="btn btn-primary" onClick={thisWidget._calculateLimit.bind(thisWidget,layerid,"ASC")}>{StaticDevTools._getLabel(15,conf)}</button></div>

                    </div>


                    <div className="row text-justify">
                      <div className="col-xs-4"><label className="control-label">{StaticDevTools._getLabel(6,conf)}</label></div>
                      <div className="col-xs-4"><input className="form-control" id={maxinputid} type="number" step="any" /></div>
                      <div className="col-xs-4"><button className="btn btn-primary" onClick={thisWidget._calculateLimit.bind(thisWidget,layerid,"DESC")}>{StaticDevTools._getLabel(15,conf)}</button></div>
                    </div>


                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(7,conf)}</label>
                    <select className="form-control" id={primitiveid} defaultValue="cylinder">
                      {symbolobtions}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(8,conf)}</label>
                    <input className="form-control" id={width3did} type="number" step="1" defaultValue="5000" required/>
                  </div>
                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(9,conf)}</label>
                    <input className="form-control" id={colormin} type="text" defaultValue="yellow" required/>
                  </div>
                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(10,conf)}</label>
                    <input className="form-control" id={colormax} type="text" defaultValue="red" required/>
                  </div>
                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(11,conf)}</label>
                    <input className="form-control" id={sizemin} type="number" step="1" defaultValue="1000" required/>
                  </div>
                  <div className="form-group">
                    <label className="control-label">{StaticDevTools._getLabel(12,conf)}</label>
                    <input className="form-control" id={sizemax} type="number" step="1" defaultValue="100000" required/>
                  </div>
                  <div className="form-group">
                    <div className="col-xs-6">
                        <button className="btn btn-primary form-control" type="submit" onClick={thisWidget._updateRender.bind(thisWidget,layerid)}>{StaticDevTools._getLabel(13,conf)}</button>
                    </div>
                    <div className="col-xs-6">
                        <button className="btn btn-primary form-control" type="submit" onClick={thisWidget._goToLayer.bind(thisWidget,layerid)}>{StaticDevTools._getLabel(14,conf)}</button>
                    </div>


                  </div>

              </div>
            </div>
          </div>
          )
      });

      thisWidget.setState({content3d: layerdiv})
      $(".select2input").select2({width:"100%"});
    });
  }

  _calculateLimit(sender,order){

      let layerid = sender.split("3dlayer_")[1];
      let flayer = StaticDevTools.getLayerById(layerid,this.sceneView.map);
      let selectedfield = $("#3dfield_selector_" + layerid).val();
      let url = flayer.url + "/" + flayer.layerId ;
      let qtask = new this.QueryTask({
        url: url // URL of a feature layer representing U.S. cities
      });

      let query = new this.Query();

      query.where = "1=1";
      query.num = 2;
      query.outFields = [selectedfield];
      query.returnDistinctValues = true;
      query.returnGeometry = false;
      query.returnJSON = true;
      query.orderByFields= [selectedfield + " " + order]

      qtask.execute(query).then(function(result){
        let response;
        //console.log(result);
        if(result.features.length > 0){
          if(result.features[0].attributes[selectedfield] === null){
            response = result.features[1].attributes[selectedfield];
          }
          else{
            response = result.features[0].attributes[selectedfield]
          }
        }
        else{
          response = null;
        }
        if (response  === null){
          alert("Error al calcular el dato");
        }
        else{
          //console.log(response);
          if(order === "ASC"){
            $("#mininput_" + layerid).val(parseFloat(response));
          }
          else{
              $("#maxinput_" + layerid).val(parseFloat(response));
          }
        }
      });
  }
  _updateRender(sender){

    let layerid = sender.split("3dlayer_")[1];
    let selectedfield = $("#3dfield_selector_" + layerid).val();

    let minvalue = parseFloat($("#mininput_" + layerid).val());
    let maxvalue = parseFloat($("#maxinput_" + layerid).val());
    let primitive = $("#primitivesymbol_" + layerid).val();
    let width3d = parseInt($("#width3d_" + layerid).val(),10);
    let colormin = $("#mincolorid_" + layerid).val();
    let colormax = $("#maxcolorid_" + layerid).val();
    let sizemin = parseInt($("#minsizeid_" + layerid).val(),10);
    let sizemax = parseInt($("#maxsizeid_" + layerid).val(),10);
    let flayer = StaticDevTools.getLayerById(layerid,this.sceneView.map);

    let renderer = {
      "type": "simple",
      "symbol": {
        "type": "point-3d",
        "symbolLayers": [{
          "type": "object",
          "resource": {
            "primitive": primitive
          },
          "width": width3d
        }]
      },

      "visualVariables": [ {
        "type": "size",
        "field": selectedfield,
        "minDataValue": minvalue,
        "maxDataValue": maxvalue,
        "minSize": sizemin,
        "maxSize": sizemax,
        "axis": "height"
        },{
        "type": "size",
        "axis": "width-and-depth",
        "useSymbolValue": true
    },
    {
          "type": "color",
          "field": selectedfield,
          "stops": [{ "value": minvalue, "color": colormin },
                  { "value": maxvalue, "color": colormax }]
        }]
    }

  //  console.log(renderer);
    flayer.renderer = renderer;


  }

  _goToLayer(sender){

    let layerid = sender.split("3dlayer_")[1];
    let flayer = StaticDevTools.getLayerById(layerid,this.sceneView.map);
    let thisWidget = this;
    flayer.queryExtent()
          .then(function(response) {

            thisWidget.sceneView.goTo({
                target: response.extent,
                tilt: 45
              }, {
                animate: true
              });
          });
  }
  _readyFlayers(callback){

    let count = this.threeDLayers.length;
    let ready = 0;
    for (var i = 0; i < count ; i++){
      let flayer = this.threeDLayers[i];
      flayer.when(readyLayersFunction)
    }

    function readyLayersFunction (){
      ready +=1;
      if(ready === count){
        callback();
      }
    }

  }
  _addGroundLayers(){

    for (var i = 0 ; i < conf.groundlayers.length; i++){
      let layer = conf.groundlayers[i];

      let elevlayer;
      if (layer.zfactor && layer.zfactor > 1){
        elevlayer = this._GetElevLayerZFactor(layer);
        elevlayer.id = layer.id;

      }
      else{
        elevlayer = new this.ElevationLayer({
          // Custom elevation service
          id: layer.id,
          title: layer.title,
          url: layer.url,
          visible: layer.visible
        });
      }

      this.sceneView.map.ground.layers.add(elevlayer)
    }

  }

  _GetElevLayerZFactor(layer){

    let in_factor = layer.zfactor;
    let url = layer.url;

    let title = layer.title;
    let visible = layer.visible;

    let thisWidget = this;

    let elevLayerZFactor = thisWidget.BaseElevationLayer.createSubclass({
        properties: {
          factor: in_factor
        },
        load: function() {
          this._layer = new thisWidget.ImageryLayer(
            {
              url: url,
              visible:visible,
              format: "lerc",
              title: title
            });
          this.addResolvingPromise(this._layer.load());
        },

        fetchTile: function(level, row, col) {
          var bounds = this.getTileBounds(level, row, col);
          var tileSize = this.tileInfo.size[0] + 1;
          var extent = new thisWidget.Extent({
            xmin: bounds[0],
            ymin: bounds[1],
            xmax: bounds[2],
            ymax: bounds[3],
            spatialReference: this.spatialReference
          });
          var factor = this.factor;

          return this._layer.fetchImage(extent, tileSize,
              tileSize)
            .then(function(data) {
              var pixelBlock = data.pixelData.pixelBlock;
              var elevations = pixelBlock.pixels[0];
              var stats = pixelBlock.statistics[0];
              var noDataValue = stats.noDataValue;

              elevations.forEach(function(value, index, pixelData) {

                if (value !== noDataValue) {
                  pixelData[index] = value * factor;
                }
                else {

                 pixelData[index] = 0;
                }
              });

              return {
                values: elevations,
                width: pixelBlock.width,
                height: pixelBlock.height,
                noDataValue: noDataValue
              };
            });
        }
      });

      let layer3d = new elevLayerZFactor()


      return layer3d;

  }
  componentDidMount(){
  }


_changeVisible(sender){

  let layer = StaticDevTools.getGroundLayerById(sender.split("_visible")[0],this.sceneView.map);
  let checked = $("#" + sender).prop("checked");
  if(checked){
     layer.visible = true
  }
  else{
    layer.visible = false
  }
}

_changeVisibleLayer3d(sender){

  let layer = StaticDevTools.getLayerById(sender.split("visibleLayer_")[1],this.sceneView.map);

  let checked = $("#" + sender).prop("checked");
  if(checked){
     layer.visible = true
  }
  else{
    layer.visible = false
  }
}


// _updateUiElements(){
//
//   let components = this.props.view.ui._components;
//   for (var i = 0; i < components.length; i++){
//     if(components[i].widget.id === "scalebarWidget")
//       {
//         this.uiElements.push(components[i].widget);
//       }
//   }
// }

 // _removeIncompatibleUiElements(){
 //   for(var i = 0 ; i< this.uiElements.length; i++){
 //     this.uiElements[i].destroy();
 //     console.log("Incompatible widget with 3d View: ")
 //     console.log( this.uiElements[i]);
 //   }
 // }
 //
 // _addIncompatibleUiElements(){
 //   for(var i = 0 ; i< this.uiElements.length; i++){
 //     // this.uiElements[i].render();
 //     this.props.view.ui.add([{
 //       component: this.uiElements[i]
 //     }]);
 //   }
 // }

 _open3DViewer(){
    $("#modalView3d").modal("show");
    this.sceneView.viewpoint = this.props.view.viewpoint.clone();
    this.sceneView.container = "view3dContainer";
    this.props.view.container = null;
    this._addGroundLayers();
    this._addThreeDLayers();

 }

 _close3DViewer(){
   this.props.view.container = this.viewContainer;
   this._removeGroundLayers();
   this._removeTreeDLayers();
   this.sceneView.container = null;
 }

 _removeGroundLayers(){
     this.props.view.map.ground.layers = [];
 }

 _removeTreeDLayers(){
    for(var i = 0; i < this.threeDLayers.length; i++){
      this.sceneView.map.remove(this.threeDLayers[i]);
    }
 }

 _toggle3dSidebar(){
   //console.log("3d toogle...?")
   $(".container3d").toggleClass("open");
 }

  render(){

    let switchers =   conf.groundlayers.map((layer,index) =>{

        let layertitle = layer.title;
        let layervisible = layer.visible === true;

        let buttonid = layer.id + "_visible"
        let input;
        if (layervisible === true){
          input = <input type="checkbox" onChange={this._changeVisible.bind(this,buttonid)} defaultChecked id={buttonid}/>
        }
        else{
          input = <input type="checkbox" onChange={this._changeVisible.bind(this,buttonid)}  id={buttonid}/>
        }

        return(
          <div className="row" key={index}>
            <div className="col-xs-10">
              <label>{layertitle}</label>
            </div>
            <div className="col-xs-2">
              {input}
            </div>
          </div>
          )
      });
    return(
      <div className='ViewEsri3D'>
        <div id="modalView3d" className="modal fade" role="dialog">
            <div className="modal-dialog modal3d">
           <div className="modal-content modal3d" id="modal3dContent">
             <div className="modal-header">
               <button type="button" className="close"  onClick={this._close3DViewer} data-dismiss="modal">&times;</button>
               <h4 className="modal-title">{StaticDevTools._getLabel(0,conf)}</h4>
             </div>
             <div className="modal-body modal-body-3d">


               <div className="container3d open">
                <div id="close3dSidebarButton" onClick={this._toggle3dSidebar}><span className="esri-icon-globe"></span></div>
                 <div id="open3dSidebarButton"  onClick={this._toggle3dSidebar}><span className="fa fa-cube"></span></div>
                   <div id="sidePanel3d">
                     <div className="row">
                       <div className="col-xs-12">
                         <h4>{StaticDevTools._getLabel(1,conf)}</h4>
                         {switchers}
                       </div>
                      </div>
                      <hr />
                      <div className="row">
                        <div className="col-xs-12">
                          <h4>{StaticDevTools._getLabel(2,conf)}</h4>
                          {this.state.content3d}
                        </div>
                       </div>
                   </div>

                   <div id="div3d">
                     <div id="view3dContainer"></div>
                   </div>
                 </div>
                 </div>
               </div>
         </div>
       </div>
        <div className="container">
          <div className="row">
            <div  className="col-xs-10 col-xs-push-1">
              <button className="btn btn-primary form-control" id="open3dButton" onClick={this._open3DViewer} disabled={this.state.threedbuttonDisabled}>3D</button>
            </div>
          </div>
        </div>

      </div>
    );
  }
}
