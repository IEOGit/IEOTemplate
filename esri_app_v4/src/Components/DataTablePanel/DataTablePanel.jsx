import React from 'react';
import ReactDOM from 'react-dom';
import esriLoader from 'esri-loader';
import DataTable from '../DataTable/DataTable.jsx';
// import ChartsPanel from '../ChartsPanel/ChartsPanel.jsx';
import {Button} from 'react-bootstrap';
import {Panel} from 'react-bootstrap';
import 'datatables.net';
import 'datatables.net-bs/js/dataTables.bootstrap';
import 'datatables.net-bs/css/dataTables.bootstrap.css';
import './DataTablePanel.css';
import 'jquery-ui/themes/base/theme.css'

import $ from 'jquery';


//Resizable
import 'jquery-ui/themes/base/core.css';
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/resizable.css';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/mouse';
import 'jquery-ui/ui/widgets/resizable';

//Do resizable available on mobile devices..
import 'jquery-ui-touch-punch/jquery.ui.touch-punch.min.js';

import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";

const moment = require('moment');

const conf = require('./widgetconfig.json');

const appconf = require('../../appconf.json');

export default class DataTablePanel extends React.Component {

  constructor(props) {
    super(props);

    this.moment = moment;

    this.state = {
      tabs: "",
      sublayers: [],
      tabsContent: "",
      labels: conf.labels
    }
    window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));

    this._getCodedValue = this._getCodedValue.bind(this);
    this._uptadateViewsEvent = this._uptadateViewsEvent.bind(this);
    this._removeViewsEvent = this._removeViewsEvent.bind(this);

    this._getField = this._getField.bind(this);
    this._loadTable = this._loadTable.bind(this);

    /* Code to make tabas reponsive */
    $.fn.responsiveTabs = function() {
      //this.addClass('responsive-tabs');
      // this.append($('<span class="glyphicon glyphicon-triangle-bottom"></span>'));
      // this.append($('<span class="glyphicon glyphicon-triangle-top"></span>'));

      this.on('click', 'li.active > a, span.glyphicon', function() {
        this.toggleClass('open');
      }.bind(this));

      this.on('click', 'li:not(.active) > a', function() {
        this.removeClass('open');
      }.bind(this));
    };
    /* Code to make tabs reponsive END */

    this.sublayersCol = [];
    this.props.view.on("layerview-create", this._uptadateViewsEvent);
    //this.props.view.on("layerview-destroy", this._removeViewsEvent);

  }

  _uptadateViewsEvent(event) {

    // console.log(event.layer.type);

    let layer = event.layer;
    if (layer.type === "map-image") {
      let sublayers = layer.sublayers.items;
      for (var i = 0; i < sublayers.length; i++) {

        if (sublayers[i].sublayers){

          let subsublayers = sublayers[i].sublayers.items;

          for (var j = 0; j < subsublayers.length;j++){
            let subsublayer = subsublayers[j];
            this.pushLayer(subsublayer);
          }
        }
        else{
          let sublayer = sublayers[i];
          this.pushLayer(sublayer);
        }


      }
    } else if (layer.type === "wms") {
      console.log("Wms layer not included in datatable panel...");
      return
    } else if (layer.type === "tile") {
      console.log("TILE layer not included in datatable panel...");
      return
    } else {
      if (this.sublayersCol.indexOf(layer) > -1) {
        return;
      }
      this.sublayersCol.push(layer);
    }
  }

 pushLayer(l){

   let thisWidget = this;
   let url = l.url;
   $.get({
     url: url+"?f=pjson",
     success:function(response){
       //console.log(response);
       let data = JSON.parse(response);
       if(data.type !== "Group Layer" && data.type !== "Raster Layer"){
         if (thisWidget.sublayersCol.indexOf(l) > -1) {
           //return;
         }
         else{
           thisWidget.sublayersCol.push(l);
           thisWidget.setState({sublayers: thisWidget.sublayersCol});
           thisWidget._updateTabs();
           thisWidget._updateTabsContent();
         }

       }

     }
   });


 }
  _removeViewsEvent(event) {
    // console.log(this.sublayersCol)
    this.sublayersCol.slice(this.sublayersCol.indexOf(event.layer), 1);
    // console.log(this.sublayersCol)
    this.setState({sublayers: this.sublayersCol});
    this._updateTabs();
    this._updateTabsContent();

  }

  componentWillMount() {}

  componentDidMount() {

    $("#dataTableContainer").resizable({
      handles: 'n',
      start: function() {
        $("#dataTableContainer").addClass("open");
      }
    });
    $('#dataTablesTabs').responsiveTabs();

  }

  _updateTabs() {
    let newContent = this.state.sublayers.map((sublayer, index) => {

      let id = StaticDevTools.getIdFromEsriLayer(sublayer);
      let idstring = '#' + id + "_panel";
      let title = StaticDevTools.getTitleFromEsriLayer(sublayer);
      let cl = "";
      if (index === 0) {
        cl = "active";
      }
      return <li key={index} className={cl} onClick={() => this._loadTable(id)} role="presentation">
        <a href={idstring} data-toggle='tab' aria-expanded="false">{title}</a>
      </li>;

    });

    this.setState({tabs: newContent});

    // Code to fix the datable aria expanded issue when going to graphs and comming back to data tab...
    if (this.fixTabs === undefined) {

      this.fixTabs = function(e) {
        var target = $(e.target).attr("href") // activated tab
        if (target === "#dataTablesPanel") {
          $($($($(target).children()[0]).children()[0])).children().each(function(i, ele) {
            $($(ele).children()[0]).attr("aria-expanded", "false");
          });

        }
      }
      $('a[data-toggle="tab"]').on('shown.bs.tab', this.fixTabs);
    }

  }

  _updateTabsContent() {

    let newContent = this.state.sublayers.map((sublayer, index) => {

      let id = StaticDevTools.getIdFromEsriLayer(sublayer);
      let idstring = id + "_panel";
      let cl = "tab-pane dataTablePanel";

      if (index === 0) {
        cl = "tab-pane dataTablePanel active";
      }
      return <div key={index} className={cl} id={idstring} role="tabpanel"></div>;

    });

    this.setState({tabsContent: newContent});
  }

  _getCodedValue(layer, fieldName, fieldValue) {
    let result;
    let codedValueDomain;
    let field = this._getField(layer, fieldName);
    if (field) {
      codedValueDomain = field.domain;
    }
    if (codedValueDomain) {
      if (codedValueDomain.type === 'coded-value') {
        for (var cv = 0; cv < codedValueDomain.codedValues.length; cv++) {
          var codedValue = codedValueDomain.codedValues[cv];
          if (fieldValue === codedValue.code) {
            result = codedValue;
            break;
          }
        }
      }
    }

    return result;
  }

  _getField(layer, fieldName) {
    let myfield;
    layer.fields.forEach(function(field) {
      if (field.name === fieldName) {
        myfield = field;
      }
    });
    return myfield;
  }

  _getSublayerById(id) {
    let sublayers = this.state.sublayers;
    for (var i = 0; i < sublayers.length; i++) {
      let sublayer = sublayers[i];
      if (StaticDevTools.getIdFromEsriLayer(sublayer) === id) {
        return sublayer;
      }
    }
    return null;

  }



  _isLikeDate(datestring) {

    if (typeof(datestring) === "string") {
      let date = this.moment(datestring);

      return date.isValid();
    } else {

      return false;
    }
  }

  _loadTable(id) {

    let thisWidget,
      sublayerSelected,
      columns,
      dateColumns,
      dataValues,
      table_options;

    thisWidget = this;
    columns = [];
    dateColumns = []
    dataValues = [];
    sublayerSelected = this._getSublayerById(id);

    esriLoader.loadModules([
      "esri/layers/FeatureLayer", "esri/tasks/support/Query"
    ], appconf.esriversion).then(([FeatureLayer, Query]) => {
      //console.log(sublayerSelected);
      if (sublayerSelected.type === "graphics") {
        //  features = sublayerSelected.graphics.items;

        let graphics = sublayerSelected.graphics.items;

        //Pasring column names from first graphic...
        let attributes = graphics[0].attributes;
        Object.keys(attributes).forEach(function(key) {
          columns.push({"title": key});
        });

        graphics.forEach(function(graphic) {
          dataValues.push(Object.values(graphic.attributes));
        });

        table_options = {
          "bAutoWidth": true,
          "paging": true,
          "data": dataValues,
          "columns": columns,
          "scrollY": thisWidget._calculateScroll(),
          "scrollX": "100%",
          "columnDefs": [
            {
              "targets": [0],
              "visible": false
            }, {
              "targets": dateColumns,
              "render": function(data) {
                return this.moment(data).format(conf.dateFormat);
              }
            }
          ]
        }

        thisWidget._updateTable(id, sublayerSelected, table_options);

      } else {
        let featureLayer,
          query;

        if (sublayerSelected.type === "feature") {

          featureLayer = sublayerSelected;
        } else {
          //console.log(sublayerSelected);
          featureLayer = new FeatureLayer({url: sublayerSelected.url});
        }

        query = new Query();
        query.where = "1=1";
        query.outFields = "*";
        query.returnGeometry = false;
        featureLayer.queryFeatures(query).then(function(data) {

          data.fields.forEach(function(field) {
            //let isShapeField = field.name.split('_')[0].toUpperCase();
            //  if (isShapeField !== "SHAPE") {

            if (field.type === "date") {
              dateColumns.push(columns.length);
              columns.push({"title": field.alias, "type": 'datetime', "format": conf.dateFormat});
            } else {
              columns.push({"title": field.alias});
            }
            //  }
          });
          // This is called when the promise resolves
          data.features.forEach(function(graphic) {
            let map;
            // delete graphic.attributes['Shape_Length'];
            // delete graphic.attributes['Shape_Area'];
            map = new Map(Object.entries(graphic.attributes));
            map.forEach(function(val, key) {
              let codedVal = thisWidget._getCodedValue(featureLayer, key, val);
              if (codedVal != null) {
                graphic.attributes[key] = codedVal.name;
              }
            });
            dataValues.push(Object.values(graphic.attributes));
          });

          table_options = {
            "bAutoWidth": true,
            "paging": true,
            "data": dataValues,
            "columns": columns,
            "scrollY": thisWidget._calculateScroll(),
            "scrollX": "100%",
            "columnDefs": [
              {
                "targets": [0],
                "visible": false
              }, {
                "targets": dateColumns,
                "render": function(data) {
                  return thisWidget.moment(data).format(conf.dateFormat);
                }
              }
            ]
          }

          thisWidget._updateTable(id, sublayerSelected, table_options);
        });
      }
    });
  }

  _updateTable(id, sublayerSelected, table_options) {

    if (document.getElementById(id + "_table") === null) {
      let element = React.createElement(DataTable, {
        container: id + '_table',
        options: table_options,
        view: this.props.view,
        layer: sublayerSelected
      });
      ReactDOM.render(element, document.getElementById(id + "_panel"));
    }

  }
  _calculateScroll() {
    let h = 300;
    if (window.innerHeight < 700) {
      h = Math.round(window.innerHeight * 0.3, 0);
    }
    return h + "px";
  }
  _updateSizePanel() {
    $("#dataTableContainer").toggleClass("open");
  }

  render() {

    return (<footer>
      <Button id="button_splitter" className="button-splitter-horizontal" onClick={() => this._updateSizePanel()}></Button>
      <div id="dataTableContainer">

        <Panel id="footerpanelTabs">
          <div className="container">
            <ul className="nav nav-tabs">
              <li className="active">
                <a href="#dataTablesPanel" data-toggle="tab">{StaticDevTools._getLabel(0, conf)}</a>
              </li>
              <li>
                <a href="#graphsPanel" data-toggle="tab">{StaticDevTools._getLabel(1, conf)}</a>
              </li>
              {
                appconf.widgets.includes("UpwellingIndex") ?
                <li>
                  <a href="#upwellingPanel" data-toggle="tab">{StaticDevTools._getLabel(2, conf)}</a>
                </li> : ""
              }
            </ul>

            <div className="tab-content">
              <div className="tab-pane active" id="dataTablesPanel">
                <div className="container">
                  <ul className="nav nav-tabs responsive-tabs" id="dataTablesTabs">
                    {this.state.tabs}
                    <span class="white glyphicon glyphicon-triangle-bottom"></span>
                    <span class="white glyphicon glyphicon-triangle-top"></span>
                  </ul>
                  <div id="datatablesContent" className="tab-content">
                    {this.state.tabsContent}
                  </div>
                </div>
              </div>
              <div className="tab-pane" id="graphsPanel">
                <div class="container"></div>
              </div>
              {
                appconf.widgets.includes("UpwellingIndex") ?
                <div className="tab-pane" id="upwellingPanel">
                  <div class="container">
                    <div className="row">
                      <div className="col-md-6" id="upwellingTable"></div>
                      <div className="col-md-6" id="upwellingGraph"></div>
                    </div>
                    <div className="row">
                      <div className="col-md-6" id="upwellingSeveralYearsGraph"></div>
                    </div>
                  </div>
                </div> : ""
              }

            </div>
          </div>
        </Panel>
      </div>
    </footer>)
  }
}
