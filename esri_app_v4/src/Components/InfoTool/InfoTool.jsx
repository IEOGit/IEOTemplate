import React from 'react';
import './InfoTool.css';
import esriLoader from 'esri-loader';
import $ from 'jquery';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";



const conf = require('./widgetconfig.json');

const options = {
  url: 'https://js.arcgis.com/4.6'
};


export  default class InfoTool extends React.Component {

  constructor(props) {
    super(props);

    //console.log(props);
    this.state = {content: (<div>{StaticDevTools._getLabel(2,conf)}</div>),currentFeature:null, autoZoom:false,labels:conf.labels};
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this,conf));

    this.props.view.onClickTools.push(this);
    this.activateTool = this.activateTool.bind(this);
    this.deactivateTool = this.deactivateTool.bind(this);
    this.zoomToCurrrentFeature = this.zoomToCurrrentFeature.bind(this);
    this.identifyTasks = [];
    this.getFeatureInfos = [];
    this.identifyParams = [];

    //Make tabs responsive...
    $.fn.responsiveTabs = function() {
      this.addClass('responsive-tabs');
      this.append($('<span class="glyphicon glyphicon-triangle-bottom"></span>'));
      this.append($('<span class="glyphicon glyphicon-triangle-top"></span>'));

      this.on('click', 'li.active > a, span.glyphicon', function() {
        this.toggleClass('open');
      }.bind(this));

      this.on('click', 'li:not(.active) > a', function() {
        this.removeClass('open');
      }.bind(this));
    };

    //Default values for configuration
    this.pointMarker = conf.highligthSymbols.pointMarker ?  conf.highligthSymbols.pointMarker : {
      type: "simple-marker",  // autocasts as new SimpleMarkerSymbol()
      style: "square",
      color: "blue",
      size: "8px",  // pixels
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "#ffff66",
        width: 3  // points
      }
    };


    this.polygonSymbol = conf.highligthSymbols.polygonSymbol ?  conf.highligthSymbols.polygonSymbol : {
      type: "simple-fill",  // autocasts as new SimpleFillSymbol()
        color: [255, 255, 102, 0.5],
      outline: {  // autocasts as new SimpleLineSymbol()
        color: "#ffff66",
        width: 4
      }
    };


    this.lineSymbol = conf.highligthSymbols.lineSymbol ?  conf.highligthSymbols.lineSymbol :  {
      type: "simple-line",  // autocasts as SimpleLineSymbol()
      color: "#ffff66",
      width: 4
    };


    //Bindings...

    this.toogleAutoZoom = this.toogleAutoZoom.bind(this);
    let thisWidget = this;

    esriLoader.loadModules([
    "esri/tasks/IdentifyTask",
    "esri/tasks/support/IdentifyParameters",
     "esri/geometry/Geometry",
     "esri/geometry/Polygon",
     "esri/geometry/Polyline",
     "esri/geometry/Point",
     "esri/layers/GraphicsLayer",
     "esri/Graphic",
     "esri/request",
      'react-dom'

    ], options)
    .then(([ IdentifyTask,IdentifyParameters,Geometry,Polygon,Polyline,Point,GraphicsLayer,Graphic,esriRequest,
      ReactDOM]) => {

      thisWidget.IdentifyTask = IdentifyTask;
      thisWidget.IdentifyParameters = IdentifyParameters;
      this.Geometry = Geometry;
      this.Polygon = Polygon;
      this.Polyline = Polyline;
      this.Point = Point;
      this.Graphic = Graphic;
      this.esriRequest = esriRequest;

    })
    .catch(err => {
      console.error(err);
    });

  }

  updataIndentifyParamsAndGetFeatureInfos(){

    this.identifyParams = [];
    this.identifyTasks = [];
    this.getFeatureInfos = [];

    let layers = this.props.view.map.layers.items;


    for (var i =0; i < layers.length; i++){

        if(!layers[i].visible){
          continue;
        }
      let url = layers[i].url;


      if(layers[i].type === "wms"){
        for(var j=0; j < layers[i].sublayers.items.length; j++){
          if(layers[i].sublayers.items[j].visible && layers[i].sublayers.items[j].queryable){
              this.getFeatureInfos.push(layers[i].sublayers.items[j]);
          }
        }

      }


      else{
        let idtask = new this.IdentifyTask(url);

        this.identifyTasks.push(idtask);

        let params = new this.IdentifyParameters();
        params.tolerance = 3;
        params.layerIds = [];
        //If layer is a mapimage service, layerIds are all sublayers defined in the service


        if(layers[i].type === "map-image"){

          for(var k=0; k< layers[i].sublayers.items.length; k++){

            if(layers[i].sublayers.items[k].visible){
                params.layerIds.push(layers[i].sublayers.items[k].id);
            }
          }
        }
        params.returnGeometry = true;
        params.layerOption = "visible";
        params.mapExtent = this.props.view.extent;
        params.width = this.props.view.width;
        params.height = this.props.view.width;
        this.identifyParams.push(params);

      }


    }
  }

  activateTool(evt){

    this.props.view.deactivateTools();
      $(this.props.view.container).css( 'cursor', 'help' );
    if (window.innerWidth <= 768){
        $("#" + conf.definition.id + " a")[0].click();
    }
    var thisWidget = this;



    this.infoToolClickEvent = this.props.view.on("click", function(event){
       event.stopPropagation();
       $(thisWidget.props.view.container).css( 'cursor', 'progress' );
       thisWidget.emptyContent();

       thisWidget.updataIndentifyParamsAndGetFeatureInfos();

       let requests_total = thisWidget.identifyParams.length + thisWidget.getFeatureInfos.length;

       let request_n = 0;
       let content = [];


       let point = thisWidget.props.view.toMap({x: event.x, y: event.y})

       let margin = 1000;
       let xmin = point.x - margin;
       let xmax = point.x + margin;
       let ymin = point.y - margin;
       let ymax = point.y + margin;

       for (var i = 0 ; i < thisWidget.getFeatureInfos.length; i ++){

         let format = thisWidget.getFeatureInfos[i].layer.featureInfoFormat;
         let responseType;
         switch(format){
           case "text/html":
            responseType = "html";
            break;
          case "text/plain":
            responseType = "text"
            break;
          default:
            responseType = "text"
         }

         let url = thisWidget.getFeatureInfos[i].layer.url + "SERVICE=WMS&VERSION=1.3.0&REQUEST=GetFeatureInfo" +
          "&FORMAT=image%2Fpng&TRANSPARENT=true" +
          "&QUERY_LAYERS=" +  thisWidget.getFeatureInfos[i].name +
          "&LAYERS=" + thisWidget.getFeatureInfos[i].name +
          "&TILED=true" +
          "&INFO_FORMAT="+format+"&I=249&J=202&WIDTH=256&HEIGHT=256" +
          "&CRS=EPSG%3A3857&STYLES=" +
          "&BBOX="+xmin+","+ymin+","+xmax+","+ymax;

         thisWidget.esriRequest(url, {
            responseType: responseType,
            layer: thisWidget.getFeatureInfos[i],
            getfeatureinfourl:url,
            format: format,
            layerName: thisWidget.getFeatureInfos[i].name,
            title: thisWidget.getFeatureInfos[i].title
          }).then(responseFunction);

       }

       function responseFunction (response){

           let features = [{
             "layerName": response.requestOptions.layerName,
             "title": response.requestOptions.title,
             "type": "wms",
             "format": response.requestOptions.format,
             "layer": response.requestOptions.layer,
             "getfeatureinfourl": response.requestOptions.getfeatureinfourl
           }]

           request_n +=1;
           content.push(features);
           if (request_n === requests_total){
             thisWidget.updateContent(content);
             if (window.innerWidth <= 768){
                 $("#" + conf.definition.id + " a")[0].click();
               }
           }
       }

       for (var j = 0 ; j < thisWidget.identifyParams.length; j++){
         thisWidget.identifyParams[j].geometry = event.mapPoint;
         thisWidget.identifyParams[j].mapExtent = thisWidget.props.view.extent;
         thisWidget.identifyTasks[j].execute(thisWidget.identifyParams[j]).then(indetifyResult);
       }

      function indetifyResult (response) {

              request_n +=1;
              if (response.results.length > 0){
                  content.push(response.results);
                  }
              if (request_n === requests_total){
                thisWidget.updateContent(content);
                if (window.innerWidth <= 768){
                    $("#" + conf.definition.id + " a")[0].click();
                  }
              }
      }
    });
  }

  emptyContent(){
    this.setState({content: (<div>{StaticDevTools._getLabel(2,conf)}</div>)});
  }

  imageExists(image_url){
    //console.log(image_url);
    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();
    //console.log(http.status);
    return http.status !== 404;

    }

  mapObject(object, callback) {
    return Object.keys(object).map(function (key) {
      return callback(key, object[key]);
    });
  }

  updateContent(content){




    $(this.props.view.container).css( 'cursor', 'help' );

    let layersTabs = content.map((layer,index) =>{

      let finaltitle;
      if(layer[0].title !== undefined){
        finaltitle = layer[0].title;
      }
      else{
        finaltitle = layer[0].layerName;
      }


      let layertitle = finaltitle;
      let layernameref = "#" + StaticDevTools.getCleanedString("infotool_tab_layerName_" + layer[0].layerName);
      let active = "";
      if (index === 0){
        active = "active"
      };
      return(
        <li key={index} className={active}><a data-toggle="tab" href={layernameref}>{layertitle}</a></li>
        )
    });


    let layersContent = content.map((layer,index) =>{

      let layerid =StaticDevTools.getCleanedString("infotool_tab_layerName_" + layer[0].layerName);
      let layername_slider = StaticDevTools.getCleanedString("slider_layerName_" + layer[0].layerName);
      let carousel_id = "carousel_" + layername_slider;
      let carousel_id_ref = "#carousel_" + layername_slider;

      let carouselIndicators = content[index].map((feature,index2) =>{
        let cl = "";
          if (index2 === 0)
          {
            cl = "active"
          }

          if(feature.type === "wms"){
            return null;
          }

          else{
          return <li key={index2} data-target={carousel_id_ref} data-slide-to={index2} className={cl}></li>
          }
      });

      let thisWidget = this;
      let features = content[index].map((feature,index2) =>{

        let cl = "item";
        if(index2 === 0){
          cl = "item active"
        }

        if(feature.type === "wms"){

          let url = feature.getfeatureinfourl;

          return (
            <div className={cl} key={index2}>
              <div className="container">
              <div className="row">
                <div className="col-md-10 col-md-push-1">
                  <a href={url} className="btn btn-primary text-center" target="_blank">{StaticDevTools._getLabel(5,conf)}</a>
                  </div>
              </div>
              </div>
            </div>
              );
        }
        else{

          let geomstr = JSON.stringify(feature.feature.geometry.toJSON());

          let withimages = false;
          let layerWidthImages;
          StaticDevTools.getLayerByTitle(feature.layerName,this.props.view.map, function(layer){

            let layerid = layer.layer.id ;
            layerWidthImages = conf.imageFields.filter(function(x){
              return x.id_layer === layerid;
            });

            if (layerWidthImages.length > 0){
              //TODO
              withimages = true;
          }

          });
          // console.log(layer);
          let eles;
          if(withimages){
            eles =  this.mapObject(feature.feature.attributes, function (key, value) {
              if(layerWidthImages[0].fields.indexOf(key) > -1){
                let imgpath = layerWidthImages[0].serverbasepath + value;

                if (thisWidget.imageExists(imgpath) !== true){
                  return (
                    <tr key={key}>
                      <td>{key}</td>
                      <td>{StaticDevTools._getLabel(6,conf)}</td>
                    </tr>);
                }
                else{
                  return (
                    <tr key={key}>
                      <td>{key}</td>
                      <td><a href={imgpath} target="_blank"><img alt="IEO" className="infoImage" src={imgpath}></img></a></td>
                    </tr>);
                }

             }
             else {
               return (
                 <tr key={key}>
                   <td>{key}</td>
                   <td>{value}</td>
                 </tr>);
             }
           });
          }
          else{
            eles =  this.mapObject(feature.feature.attributes, function (key, value) {
             return (
               <tr key={key}>
                 <td>{key}</td>
                 <td>{value}</td>
               </tr>);
           });
          }


          return (
            <div className={cl} key={index2} data-geometry={geomstr}>
                <div className="carousel-caption">
                  <button className="btn btn-primary" onClick={this.zoomToCurrrentFeature}>{StaticDevTools._getLabel(7,conf)}</button>
                  <table className="table contentTable">
                    <thead>
                      <th scope="col">{StaticDevTools._getLabel(3,conf)}</th>
                      <th scope="col">{StaticDevTools._getLabel(4,conf)}</th>
                    </thead>
                    <tbody>
                        {eles}
                    </tbody>
                  </table>
              </div>
            </div>
              );

        }

      });

      let cl = "tab-pane fade"
      if (index === 0)
      {
        cl = "tab-pane fade in active"
      }

      if(layer[0].type === "wms"){
        return (
          <div key={index} id={layerid} className={cl}>
              {features}
          </div>)
      }
      else{

        return (
          <div key={index} id={layerid} className={cl}>
            <div  id={carousel_id} className="carousel slide" data-interval="false">
              <ol className="carousel-indicators">
                {carouselIndicators}
              </ol>
            <div className="carousel-inner">
              {features}
            </div>
            <a className="carousel-control left" href={carousel_id_ref} data-slide="prev">&lsaquo;</a>
            <a className="carousel-control right" href={carousel_id_ref} data-slide="next">&rsaquo;</a>
            </div>
          </div>)
      }

    });

    let newcontent = (
      <div>
        <ul className="nav nav-tabs infotool" id="infotooltabs">
          {layersTabs}
        </ul>
        <div className="tab-content">
          {layersContent}
        </div>
      </div>
    )


    this.setState({content: newcontent,labels:conf.labels});

    $("#infotooltabs").responsiveTabs();

    if(this.state.autoZoom){
        this.zoomToCurrrentFeature();
    }

    //Highliht all features..
    this.props.view.graphics.removeAll();

    for(var i = 0; i < content.length; i++){
      for (var j = 0; j < content[i].length; j++){
        this.highlightGeometry(content[i][j].feature.geometry.toJSON());
      }
    }

    let thisWidget = this;
    $('.carousel').on('slid.bs.carousel',function() {

      if(thisWidget.state.autoZoom){
        let geomtrystr = $($("#" + $(this)[0].id).find("div div.active")[0]).attr("data-geometry");
        let geometryjson = JSON.parse(geomtrystr);
      thisWidget.zoomToGeometry(geometryjson);
    }

    });


  }

  zoomToCurrrentFeature(){

    let i = $($($(".tab-pane.fade.in.active")[0].children[0].children[0]).find("li.active")[0]).attr("data-slide-to")
    let initgeometry = $($(".tab-pane.fade.in.active")[0].children[0].children[1].children[parseInt(i,10)]).attr("data-geometry");
    let initgeometryjson = JSON.parse(initgeometry);

    this.zoomToGeometry(initgeometryjson);

  }

 highlightGeometry(geometryjson){

   let geometry;
   let symbol;

   if (geometryjson.rings){
       geometry = this.Polygon.fromJSON(geometryjson);

       symbol = this.polygonSymbol;
   }
   else if (geometryjson.paths){
       geometry = this.Polyline.fromJSON(geometryjson);

       symbol = this.lineSymbol;
   }
   else if (geometryjson.x){
       geometry = this.Point.fromJSON(geometryjson);
       symbol = this.pointMarker;
   }
   else{
     console.log("geometry type not defined...");

   }

   var g = new this.Graphic({
     geometry: geometry,
     symbol: symbol
   });
   g.geometry = geometry;

   this.props.view.graphics.add(g);
 }


  zoomToGeometry(geometryjson){

    let geometry;


    if (geometryjson.rings){
        geometry = this.Polygon.fromJSON(geometryjson);
        this.props.view.goTo(geometry.extent);
    }
    else if (geometryjson.paths){
        geometry = this.Polyline.fromJSON(geometryjson);
        this.props.view.goTo(geometry.extent);
    }
    else if (geometryjson.x){
        geometry = this.Point.fromJSON(geometryjson);
        this.props.view.goTo(
          {
            target:geometry,
            zoom:12
          }
      );
    }
    else{
      console.log("geometry type not defined...");

    }

  }

  toogleAutoZoom (){

    if (this.state.autoZoom){
      this.setState({autoZoom: false});
    }
    else{
      this.setState({autoZoom: true});
    }
  }


  deactivateTool (){
    if(this.infoToolClickEvent !== undefined){
      $(this.props.view.container).css( 'cursor', 'default' );
      this.emptyContent();
      this.props.view.graphics.removeAll();
      this.infoToolClickEvent.remove();


    }
  }

  render(){

    return(
      <div className="infoToolDiv">
        <div className="row">
        <div className="col-xs-12">

        </div>
      </div>
        <div className="row">
          <div className="col-xs-4">
            <button className="btn btn-success" onClick={this.activateTool}>{StaticDevTools._getLabel(0,conf)}</button>
          </div>
          <div className="col-xs-4">
            <button className="btn btn-success" onClick={this.deactivateTool}>{StaticDevTools._getLabel(1,conf)}</button>
          </div>
          <div className="col-xs-4">
            <label>{StaticDevTools._getLabel(8,conf)}: </label><input type="checkbox" checked={this.state.autoZoom} onClick={this.toogleAutoZoom}/>
          </div>
        </div>
        <div className="row">
            {this.state.content}
        </div>
      </div>
    );
  }
}
