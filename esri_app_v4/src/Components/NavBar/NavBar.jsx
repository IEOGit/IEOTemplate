import React from 'react';
import './NavBar.css';
import logo from './Img/logo.png';
import logo2 from './Img/ideo_transparente.png';
import StaticDevTools from "../StaticDevTools/StaticDevTools.jsx";
import ManageRoles from "../StaticDevTools/ManageRoles.jsx";

window.PubSub = require('pubsub-js/src/pubsub.js')

window.jQuery = require('jquery');
require('bootstrap/dist/css/bootstrap.css');
require('bootstrap/dist/js/bootstrap.min.js');

const conf = require('./widgetconfig.json');

const appconf = require('../../appconf.json');

export default class NavBar extends React.Component {
  constructor(props) {
    super(props);

    let titleconf = {"definition" : { "custom": { "title": appconf.title}}}
    let subtitleconf = {"definition" : { "custom": { "title": appconf.subtitle}}}
    this.state = {
      title: StaticDevTools._getTitle(titleconf),
      subtitle: StaticDevTools._getTitle(subtitleconf),
      contact: StaticDevTools._getLabel(2, conf),
      login: StaticDevTools._getLabel(3, conf),
      language: StaticDevTools._getLabel(4, conf),
      resources: StaticDevTools._getLabel(5, conf)

    }

    if (ManageRoles.getUser() !== "") {
      this.state.login = StaticDevTools._getLabel(6, conf);
    }

    this._updateLabels = this._updateLabels.bind(this);
    window.PubSub.subscribe('updatelabels', this._updateLabels);

  }

  _updateLabels(msg, data) {

    let titleconf = {"definition" : { "custom": { "title": appconf.title}}}
    let subtitleconf = {"definition" : { "custom": { "title": appconf.subtitle}}}

    if (ManageRoles.getUser() !== "") {



      this.setState({
        title: StaticDevTools._getTitle(titleconf),
        subtitle: StaticDevTools._getTitle(subtitleconf),
        contact: StaticDevTools._getLabel(2, conf),
        login: StaticDevTools._getLabel(6, conf),
        language: StaticDevTools._getLabel(4, conf),
        resources: StaticDevTools._getLabel(5, conf)
      });

    } else {
      this.setState({
        title: StaticDevTools._getTitle(titleconf),
        subtitle: StaticDevTools._getTitle(subtitleconf),
        contact: StaticDevTools._getLabel(2, conf),
        login: StaticDevTools._getLabel(3, conf),
        language: StaticDevTools._getLabel(4, conf),
        resources: StaticDevTools._getLabel(5, conf)
      });
    }

  }

  _updateCurrentLocale(sender) {

    let senderlocale = sender.split("locale_")[1];
    localStorage.setItem("currentLocale", senderlocale);
    window.PubSub.publish('updatelabels', senderlocale);

  }

  render() {

    let languages = appconf.locales.map((locale, index) => {
      let languageCode = locale.locale;
      let languageId = "locale_" + languageCode;
      let languageName = locale.label;
      let currentLocale = StaticDevTools._getLocale();
      if (currentLocale === locale.locale) {
        return <li key={index}>
          <a id={languageId} onClick={this._updateCurrentLocale.bind(this, languageId)}>
            <span className="fa fa-check"></span>{languageName}</a>
        </li>
      } else {
        return <li key={index}>
          <a onClick={this._updateCurrentLocale.bind(this, languageId)}>{languageName}</a>
        </li>
      }

    });

    let resources = conf.resources.map((resource, index) => {
      return <li key={index}>
        <a href={resource.link} target="_blank">{resource.title}</a>
      </li>
    });

    return (<nav className="navbar navbar-default navbar-ieo">
      <div className="container-fluid">
        <div className="navbar-header">
          <button type="button" className="navbar-toggle" data-toggle="collapse" data-target="#ieoNavbar">
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
            <span className="icon-bar"></span>
          </button>
          <a className="navbar-brand" href="#IEO">
            <span>
              <img src={logo} alt="ieologo" className="logoSecundario"></img>
            </span>

            <div className="navbar-div-title">
              <p className="navbar-title">{this.state.title}</p>
              <p className="navbar-subtitle">{this.state.subtitle}</p>
            </div>
            <span>
              <img src={logo2} alt="ieologo2" id="logoIDEO"></img>
            </span>
          </a>
        </div>
        <div className="collapse navbar-collapse" id="ieoNavbar">
          <ul className="nav navbar-nav navbar-right">
            <li className="dropdown">
              <a className="dropdown-toggle" data-toggle="dropdown" href="#language">
                <span className="fa fa-language"></span>
                {this.state.language}
              </a>
              <ul className="dropdown-menu">
                {languages}
              </ul>
            </li>
            <li>
              <a href="/Login">
                <span className="glyphicon glyphicon-user"></span>
                {this.state.login}</a>
            </li>
            <li>
              <a href="mailto:olvido.tello@ieo.es">
                <span className="glyphicon glyphicon-envelope"></span>
                {this.state.contact}</a>
            </li>
            <li className="dropdown">
              <a className="dropdown-toggle" data-toggle="dropdown" href="#links">
                <span className="fa fa-external-link"></span>
                {this.state.resources}
              </a>
              <ul className="dropdown-menu">
                {resources}
              </ul>
            </li>
          </ul>
        </div>
      </div>
    </nav>);
  }
}
