import React from 'react';
import esriLoader from 'esri-loader';
import './PrintTool.css';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";

const conf = require('./widgetconfig.json');

const appconf = require('../../appconf.json');

export  default class PrintTool extends React.Component {

  constructor(props) {
    super(props);
    this.state = {labels:conf.labels};
    let thisWidget = this;



    //let token = window.PubSub.subscribe('updatelabels', this._updateWidget.bind(this));

    esriLoader.loadModules([
      "esri/widgets/Print",
      'react-dom'

    ], appconf.esriversion)
    .then(([Print, ReactDOM]) => {

      thisWidget.Print = Print;

      thisWidget.printWidget = new Print({
            view: thisWidget.props.view,
            container: "printDiv", // specify your own print service
            printServiceUrl: conf.printServiceUrl || "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
          });


    }).catch(err => {
        console.error(err);
      });

  }

  _updateWidget(){

    //TODO
    console.log("Intentando recargar el widget en otro idioma...");

    let userLang = StaticDevTools._getLocale();
    window.dojoConfig.locale = userLang;
    window.dojoConfig.parseOnLoad = true;

    this.printWidget.destroy();
    let node = document.createElement("div");
    let printnode = document.getElementById("print_tool_container").appendChild(node);
    this.printWidget = new this.Print({
          view: this.props.view,
          container: printnode,
          printServiceUrl: conf.printServiceUrl || "https://utility.arcgisonline.com/arcgis/rest/services/Utilities/PrintingTools/GPServer/Export%20Web%20Map%20Task"
        });
  }

  render(){
    return(
      <div id="print_tool_container"><div id="printDiv"></div></div>
    );
  }
}
