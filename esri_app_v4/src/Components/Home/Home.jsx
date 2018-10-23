import React from 'react';
// import RouteHandler from './RouteHandler';

// import Cookies from 'js-cookie';
// // import Cookies from 'js-cookie';
// import App from '../../App.js';

import NavBar from '../../Components/NavBar/NavBar.jsx';
import EsriMap from '../../Components/EsriMap/EsriMap.jsx';
import LeftPanel from '../../Components/LeftPanel/LeftPanel.jsx';
import '../../App.css';
import '../../Styles/ieotemplate.css';

const appconf = require('../../appconf.json');

export default class Home extends React.Component {


  render() {

    const standalonewidgets = appconf.widgets.map((widgetname, index) => {

      let widgetConf = require("../" + widgetname + "/widgetconfig.json");
      if (widgetConf.definition.custom.inPanel === false && widgetConf.definition.onviewloaded === false) {
        let Component = require("../" + widgetname + "/" + widgetname + ".jsx").default
        return (<Component key={widgetConf.definition.id}/>);
      } else {
        return null;
      }
    });

    return (<div className="wrapper">
      <LeftPanel widgets={appconf.widgets}/>
      <div className="App">
        <NavBar/> {/* Aquí van los widgets no dependientes de la vista...y que no se muestran en la TOC */}
        {standalonewidgets}
        {/* //Los widgets dependientes de la vista se cargan en EsriMap */}
        <EsriMap widgets={appconf.widgets}/> {/* <DataTable /> */}
        <div id="App-Modal"></div>
      </div>
    </div>)
  }
}
