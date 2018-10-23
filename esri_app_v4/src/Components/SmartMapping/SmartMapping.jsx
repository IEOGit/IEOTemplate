import React from 'react';
import './SmartMapping.css';
import esriLoader from 'esri-loader';
import Select2 from 'react-select2-wrapper';
import {Panel} from 'react-bootstrap';
import {Button} from 'react-bootstrap';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import $ from 'jquery';

const conf = require('./widgetconfig.json');

const appconf = require('../../appconf.json');

export default class SmartMapping extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      contentPanel: "",
      geometryType: "",
      layerOptions: [],
      layers: [],
      layerSelectedTitle: StaticDevTools._getLabel(0, conf),
      labels: conf.labels
    }

    this.layerSelectedAsFeatureLayer = null;
    this.layerSelected = null;

    //this._handleChangeLayer = this._handleChangeLayer.bind(this);
    this._getcontentPanel = this._getcontentPanel.bind(this);
    this._applySymbology = this._applySymbology.bind(this);

    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    let thisWidget = this;
    esriLoader.loadModules([
      "esri/layers/FeatureLayer", "esri/tasks/support/Query"
    ], appconf.esrioptions).then(([FeatureLayer, Query]) => {

      thisWidget.props.view.on("layerview-create", thisWidget._updateSelector.bind(this));

    }).catch(err => {
      console.error(err);
    });

  }

  _updateSelector(evt) {

    let layer = evt.layer;
    //console.log(layer);
    layer.sublayers.items.map((sublayer, index) => {
      let layerOption = {
        text: sublayer.title,
        id: this.state.layerOptions.length
      };
      let layerOptions = this.state.layerOptions;
      let layers = this.state.layers;
      if (layerOptions.indexOf(layerOption) === -1) {
        layerOptions.push(layerOption);
        layers.push(sublayer);
        this.setState({"layerOptions": layerOptions, layers: layers});
      }
      return null;
    });
  }
  _handleChangeLayer(event) {

    let selectedindex = $("#layerSelector").val();

    let subLayerSelectedClone = this.state.layers[selectedindex];

    console.log(subLayerSelectedClone);
    let componentReact = this;

    StaticDevTools.getLayerByTitle(subLayerSelectedClone.title,this.props.view.map,function(response){


      componentReact.layerSelected = response;
    });

    componentReact = this;
    esriLoader.loadModules([
      "esri/layers/FeatureLayer", "esri/tasks/support/Query"
    ], appconf.esrioptions).then(([FeatureLayer, Query]) => {

      let featureLayer,
        query;

      if (subLayerSelectedClone.type === "feature") {
        console.log("Featurelayer type");

        featureLayer = subLayerSelectedClone;

      } else if (subLayerSelectedClone.source.type === "map-layer") {
        console.log("Sublayer type");
        //let mapImageLayer = subLayerSelected.layer;

        //var sublayer = mapImageLayer.findSublayerById(subLayerSelected.source.mapLayerId);

        //featureLayer = sublayer.createFeatureLayer();
        featureLayer = new FeatureLayer({url:subLayerSelectedClone.url });


      } else {

        console.log("Layer type not supported: " + subLayerSelectedClone.type);
        return;
      }

      this.layerSelectedAsFeatureLayer = featureLayer;

      query = new Query();
      query.where = "1=0";
      query.outFields = "*"
      query.returnGeometry = false;

      featureLayer.queryFeatures(query).then(function(data) {
        console.log("hydsfasdfas");
        console.log(featureLayer);
        let newcontentPanel;

        newcontentPanel = componentReact._getcontentPanel(data.fields, featureLayer.geometryType);
        componentReact.setState({
          contentPanel: newcontentPanel,
          //layerSelected: featureLayer,
          layerSelectedTitle: event.target.value,
          typeSymbol: featureLayer.geometryType
        });
      });

    });
  }

  _getcontentPanel(fields, geometryType) {
    let fieldsNames = [];
    fields.forEach(function(field) {
      fieldsNames.push(field.name)
    });

    let response;
    switch (geometryType) {
      case "point":
        response = (<div>
          <form onSubmit={this._applySymbology}>
            <div className="row">
              <div className="col-md-12">
                <Select2 className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(1, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(4, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <input defaultValue={1} min="0" type="number" className="form-control"></input>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 className="select2container" data={[]} options={{
                    placeholder: StaticDevTools._getLabel(3, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <Button className="btn btn-primary applySymbol-button" type="submit">{StaticDevTools._getLabel(2, conf)}</Button>
              </div>
            </div>
          </form>
        </div>);
        break;
      case "polyline":
        response = (<div>
          <form onSubmit={this._applySymbology}>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="fieldSelected" className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(1, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="fieldNormalizedSelected" className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(4, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <input id="stepsSelected" defaultValue={2} min="2" type="number" className="form-control"></input>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="themeSelected" className="select2container" data={["high-to-low", "above-and-below", "centered-on", "extremes"]} options={{
                    placeholder: StaticDevTools._getLabel(3, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <Button className="btn btn-primary applySymbol-button" type="submit">{StaticDevTools._getLabel(2, conf)}</Button>
              </div>
            </div>
          </form>
        </div>);
        break;
      case "polygon":
        response = (<div>
          <form onSubmit={this._applySymbology}>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="fieldSelected" className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(1, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="fieldNormalizedSelected" className="select2container" data={fieldsNames} options={{
                    placeholder: StaticDevTools._getLabel(4, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <input id="stepsSelected" defaultValue={2} min="2" type="number" className="form-control"></input>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12">
                <Select2 id="themeSelected" className="select2container" data={["high-to-low", "above-and-below", "centered-on", "extremes"]} options={{
                    placeholder: StaticDevTools._getLabel(3, conf),
                    width: '100%'
                  }}></Select2>
              </div>
            </div>
            <div className="row">
              <div className="col-md-12 text-center">
                <Button className="btn btn-primary applySymbol-button" type="submit">{StaticDevTools._getLabel(2, conf)}</Button>
              </div>
            </div>
          </form>
        </div>);
        break;
      default:
        response = <div></div>
        break;
    }

    return response;
  }

  _applySymbology(event) {
    event.preventDefault();
    let componentReact,
      fieldSelected,
      fieldSelectedValue,
      stepsHandleValue,
      themeSelected,
      themeSelectedValue;
    componentReact = this;
    fieldSelected = document.getElementById('fieldSelected');
    //let fieldNormalizedSelected = document.getElementById('fieldNormalizedSelected');
    stepsHandleValue = document.getElementById('stepsSelected').value;
    themeSelected = document.getElementById('themeSelected');

    fieldSelectedValue = fieldSelected.options[fieldSelected.selectedIndex].value;
    //let fieldNormalizedSelectedValue = fieldNormalizedSelected.options[fieldNormalizedSelected.selectedIndex].value;
    themeSelectedValue = themeSelected.options[themeSelected.selectedIndex].value;

    esriLoader.loadModules([
      "esri/renderers/smartMapping/creators/color", "esri/renderers/smartMapping/statistics/histogram", "esri/widgets/ColorSlider", "esri/core/lang", "dojo/on"
    ], appconf.esriverion).then(([colorRendererCreator, histogram, ColorSlider, lang, on]) => {
      let colorParams,
        sliderParams;

      console.log(componentReact.layerSelected);

      //componentReact.layerSelectedAsFeatureLayer = componentReact.layerSelected.createFeatureLayer();

      colorParams = {
        layer: componentReact.layerSelectedAsFeatureLayer,
        basemap: componentReact.props.view.map.basemap,
        field: fieldSelectedValue,
        //normalizationField: fieldNormalizedSelectedValue,
        theme: themeSelectedValue
      };

      sliderParams = {
        numHandles: stepsHandleValue,
        syncedHandles: true,
        container: "smartMappingSlider"
      };

      console.log(colorParams);




      colorRendererCreator.createContinuousRenderer(colorParams).then(function(response) {

        componentReact.layerSelected.renderer = response.renderer;
        //componentReact.layerSelectedAsFeatureLayer = response.renderer;
        sliderParams.statistics = response.statistics;
        sliderParams.visualVariable = response.visualVariable;
        let colorSlider = new ColorSlider(sliderParams);

        on(colorSlider, "data-change", function() {

          console.log("Color slider finished...");
          var renderer = componentReact.layerSelected.renderer.clone();
          renderer.visualVariables = [lang.clone(colorSlider.visualVariable)];
          componentReact.layerSelected.renderer = renderer;

          //
          //
          //
          // renderer.visualVariables = [lang.clone(componentReact.colorSlider.visualVariable)];
          //
          // console.log(componentReact.layerSelected);
          //
          // componentReact.props.view.map.layers.forEach(function(layer){
          //   if(layer.type === "map-image"){
          //     layer.sublayers.forEach(function(sublayer){
          //       if(sublayer.title === componentReact.layerSelected.title){
          //         console.log("dsfdsfadsfas");
          //         sublayer.renderer = renderer;
          //       }
          //     });
          //   }
          //   if(layer.type === "feature" &&  layer.title === componentReact.layerSelected.title){
          //    layer.renderer = renderer;
          //   }
          // });



          // componentReact.layerSelected.render = renderer;
          // let ly = StaticDevTools.getLayerByTitle(componentReact.layerSelected.title, componentReact.props.view.map);
          //
          // ly.renderer = renderer;

        });

      });

      // colorRendererCreator.createContinuousRenderer(colorParams).then(function(response) {
      //
      //   componentReact.layerSelected.renderer = response.renderer;
      //
      //   sliderParams.statistics = response.statistics;
      //   sliderParams.visualVariable = response.visualVariable;
      //
      //   let histogramparameters = {
      //     layer: componentReact.layerSelectedAsFeatureLayer,
      //     field: fieldSelectedValue
      //     normalizationField: fieldNormalizedSelectedValue
      //   };
      //   console.log(histogramparameters);
      //   return histogram(histogramparameters);
      //
      // }).then(function(histogram) {
      //
      //    when it resolves set the histogram in the slider parameters
      //   console.log(histogram);
      //   sliderParams.histogram = histogram;
      //
      //   console.log(sliderParams);
      //   console.log(componentReact.colorSlider);
      //   console.log(componentReact.colorSlider === undefined);
      //   if(componentReact.colorSlider === undefined) {
      //
      //     componentReact.colorSlider = new ColorSlider(sliderParams);
      //
      //   }
      //   else{
      //     console.log("destroying...");
      //     componentReact.colorSlider.destroy();
      //     $("containerDiv").append("<div id='smartMappingSlider'></div>");
      //     componentReact.colorSlider = new ColorSlider(sliderParams);
      //   }
      //
      //
      //    on(componentReact.colorSlider, "handle-value-change", function() {
      //
      //      console.log("Color slider finished...");
      //
      //      let renderer =componentReact.layerSelected.renderer.clone();
      //
      //      renderer.visualVariables = [lang.clone(componentReact.colorSlider.visualVariable)];
      //      componentReact.layerSelected.renderer = ly.renderer;
      //
      //    });
      // }).otherwise(function(err) {
      //   console.log("there was an error: ", err);
      // });

    });

  }

  componentWillMount() {}

  componentDidMount() {}

  render() {
    return (<div>
      <Panel>
        <div className="row">
          <div className="col-md-12 text-center">
            <Select2 id="layerSelector" defaultValue={this.state.layerSelectedTitle} className="select2container" data={this.state.layerOptions} onSelect={this._handleChangeLayer.bind(this)} options={{
                placeholder: StaticDevTools._getLabel(0, conf),
                width: '100%'
              }}></Select2>
          </div>
        </div>
        {this.state.contentPanel}
      </Panel>
      <Panel id="containerDiv">
        <div id="smartMappingSlider"></div>
      </Panel>
    </div>);
  }
}
