import React from 'react';
import $ from 'jquery';
import logo from './Img/logo.png';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import ManageRoles from "../StaticDevTools/ManageRoles.jsx";
import 'font-awesome/css/font-awesome.css'
// import Cookies from 'js-cookie';

require('./LeftPanel.css');

window.jQuery = require('jquery');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/js/bootstrap.min.js');

//const conf = require('./widgetconfig.json');

export default class LeftPanel extends React.Component {
  constructor(props) {
    super(props);


    let titles = [];

    this.props.widgets.map((widgetname, index) => {
      let widgetconf = require("../" + widgetname + "/widgetconfig.json");
      titles[index] = StaticDevTools._getTitle(widgetconf);
      return null;
    });

    this.state = {
      sidebarActive: "active",
      titles: titles,
      widgets: null
    }




    this.clickWidget = this.clickWidget.bind(this);
    this._getTitle = this._getTitle.bind(this);
    //window.PubSub.subscribe('updatelabels', StaticDevTools._updateLabels.bind(this, conf));
    //Not loading here the default updateLabels event...
    window.PubSub.subscribe('updatelabels', this._updateTitles.bind(this));

    this.props.widgets.map((widgetname, index) => {
      let widgetconf = require("../" + widgetname + "/widgetconfig.json");
      this.state["title_" + widgetconf.definition.id] = this._getTitle(widgetconf);
      return null;
    });



  }


  _updateTitles(){
    //console.log("sdhfadsfa");

    let thisWidget = this;
    //let titles = [];
    thisWidget.props.widgets.map((widgetname, index) => {
      let widgetconf = require("../" + widgetname + "/widgetconfig.json");
      //titles[index] = thisWidget._getTitle(widgetconf);
      thisWidget.setState({ ["title_" + widgetconf.definition.id] : thisWidget._getTitle(widgetconf)});
      return null;
    });
    //console.log(thisWidget);

    //this.setState({titles: titles});
  }
  _getTitle(conf){

    let userLang = StaticDevTools._getLocale();
    let title;
    if (typeof(conf.definition.custom.title) === "string") {
      title = conf.definition.custom.title;
    } else {

      if (conf.definition.custom.title[userLang] !== undefined) {
        title = conf.definition.custom.title[userLang];
      } else {
        title = conf.definition.custom.title[0];
      }
    }
      //console.log(title);
      return title;
  }
  componentWillMount() {}

  componentDidMount(){

    this.loadWidgets();
  }

  loadWidgets() {

    // console.log("Loading widgets....");
    let thisWidget = this;
    let widgetarr = [];
    thisWidget.props.widgets.map((widgetname, index) => {

      let widgetconf = require("../" + widgetname + "/widgetconfig.json");
      let title;
      let id_widget = widgetconf.definition.id;

      if (typeof(widgetconf.definition.custom.title) === "string") {
        title = widgetconf.definition.custom.title;
      } else {
        let locale = StaticDevTools._getLocale();
        title = widgetconf.definition.custom.title[locale];
      }

      if (widgetconf.definition.custom.inPanel) {

        let w;

        let titles = this.state.titles;
        titles[index] = title;

        thisWidget.setState({titles: titles})
        ManageRoles.isWidgetAllowed(id_widget, function(permited) {
          if (permited === "true") {
            let contentWidgetid = "widgetContent_" + widgetconf.definition.id;

            //let contentWidgetref = "#" + contentWidgetid;
            widgetarr[index] = (<li key={index} className="widgetItem" id={widgetconf.definition.id}>
              <a onClick={thisWidget.clickWidget}>
                <i className={widgetconf.definition.custom.icon}></i>
                {thisWidget._getTitle(widgetconf)}
                <i className="close-icon glyphicon glyphicon-chevron-left"></i>
              </a>
              <div className="widgetContent">
                <div id={contentWidgetid}></div>
              </div>
            </li>);
            thisWidget.setState({widgets: widgetarr});
            thisWidget.updateVertical();

          } else {
            // console.log("Widget not permited");
            widgetarr[index] = null;
            thisWidget.updateVertical();

          }

        });

        return w;

      } else {
        //console.log("Widget not in TOC");
        return null
      }

    });

  }
  clickWidget(e) {

    //Cambiamos el estado de la side bar a sidebarActive
    //Cambiamos el estado de los elementos sidebarOpenMargin
    //Abrimos el elemento widget clickado y cerramos los otros...
    //Activamos el widgetContent clickado
    //Y ocultamos el mapa!!!
    var sender_id = e.target.parentElement.id
    if (sender_id === "") {
      sender_id = e.target.parentElement.parentElement.id;
    }

    if (this.state.sidebarActive === "active") {

      this.setState({sidebarActive: ""});
      $('.widgetContainer').animate({
        scrollTop: 0
      }, 300);
      $(".sidebarMargin").removeClass("sidebarCloseMargin");
      $(".sidebarMargin").addClass("sidebarOpenMargin");
      $(".widgetItem").each(function(index, ele) {
        $(ele).addClass("hidden");
        $("#" + sender_id).removeClass("hidden");
      });
      $("#" + sender_id).find(".widgetContent").addClass("active");

      let calculatedheight = window.innerHeight - 180;
      $("#widgetContent_" + sender_id).css("height", calculatedheight + "px")
      $(".App").addClass("sidebarActiveHide");
      $("#sidebar-header-ieo").addClass("sidebarActiveHide");
      $(".paddle").toggleClass("hidden");
    } else {

      this.setState({sidebarActive: "active"});
      $(".sidebarMargin").addClass("sidebarCloseMargin");
      $(".sidebarMargin").removeClass("sidebarOpenMargin");

      $(".widgetItem").each(function(index, ele) {
        $(ele).removeClass("hidden");
      });
      $("#" + sender_id).find(".widgetContent").removeClass("active");
      $(".App").removeClass("sidebarActiveHide");
      $("#sidebar-header-ieo").removeClass("sidebarActiveHide");
      $(".paddle").toggleClass("hidden");

    };

  }
  updateVertical() {

    // duration of scroll animation

    let scrollDuration = 300;
    let upPaddle = document.getElementsByClassName('up-paddle');
    let downPaddle = document.getElementsByClassName('down-paddle');
    let itemsLength = $('.widgetItem').length;
    let itemSize = $('.widgetItem').outerHeight(true);

    let getMenuWrapperSize = function() {
      return $('#sidebar').outerHeight() - 280;
    }
    let menuWrapperSize = getMenuWrapperSize();
    let getMenuSize = function() {
      return itemsLength * itemSize;
    };
    let menuSize = getMenuSize();

    if (menuWrapperSize > menuSize) {
      $(".paddle").addClass("hidden");
    }

    $(window).unbind('resize');
    $(window).on('resize', function() {
      menuWrapperSize = getMenuWrapperSize();

      if (menuWrapperSize > menuSize) {
        $(".paddle").addClass("hidden");
      } else {
        $(".paddle").removeClass("hidden");
      }
    });

    if (menuWrapperSize > menuSize) {
      $(".paddle").addClass("hidden");
    } else {
      $(".paddle").removeClass("hidden");
    }

    $(upPaddle).unbind('click');
    $(upPaddle).on('click', function() {

      $('.widgetContainer').animate({
        scrollTop: 0
      }, scrollDuration);
    });

    $(downPaddle).unbind('click');
    $(downPaddle).on('click', function() {

      $('.widgetContainer').animate({
        scrollTop: $(".widgetContainer").height()
      }, scrollDuration);
    });
  }

  renderUp(evt) {}

  render() {

    if (!this.state.widgets) {
      return <div/>
    }

    return (<nav id="sidebar" className={this.state.sidebarActive}>
      <div className="sidebar-header" id="sidebar-header-ieo">
        <span>
          <img src={logo} id="logo" alt="IEO Logo"></img>
        </span>
        <strong></strong>
      </div>
      <div className="paddles">
        <button className="up-paddle paddle">
          <i className="fa fa-chevron-up paddleicon"></i>
        </button>
      </div>

      <ul className="list-unstyled components widgetContainer">
        {this.state.widgets}
      </ul>

      <div className="paddles">
        <button className="down-paddle paddle">
          <i className="fa fa-chevron-down paddleicon"></i>
        </button>
      </div>
    </nav>);

  }
}
