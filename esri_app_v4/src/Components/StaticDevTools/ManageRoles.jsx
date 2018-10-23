// import esriLoader from 'esri-loader';
// import $ from 'jquery';
import Cookies from 'js-cookie';
const appconf = require('../../appconf.json');

export default class ManageRoles {

  static roleMatches(role, rolestomatch, callback) {

    if (rolestomatch[0].toString() === "anonymous") {
      callback(true)
      return;

    }
    for (var i = 0; i < rolestomatch.length; i++) {
      if (rolestomatch[i].toString() === role) {
        callback(true);
        return;
      }
    }
    callback(false);
  }

  static currentRoleMatches(rolestomatch, callback) {
    if (rolestomatch[0] === "anonymous") {
      callback(true);
    } else {
      let thisClass = this;
      this.getRole(function(role) {
        thisClass.roleMatches(role, rolestomatch, function(permited) {
          callback(permited);
        });
      });
    }
  }

  static getUser() {

    let currentUser = Cookies.getJSON("app_user") && Cookies.getJSON("app_user").user
      ? Cookies.getJSON("app_user").user
      : "";

    return currentUser;

  }

  static getRole(callback) {

    let currentUser = this.getUser();

    if (currentUser === "") {
      callback("anonymous");
      //return "anonymous";
    } else {

      let appid = appconf.ieoappid;
      if (!appid) {
        callback("anonymous");
        //return "anonymous";
      } else {

        let data = new FormData()
        data.append("usertoken", currentUser);
        data.append("appid", appid);

        fetch(appconf.controlersurl + "/Login/getRoleToken", {
          method: "POST",
          body: data
        }).then(function(res) {
          return res.text();
        }).then(function(data) {
          callback(data);

        });

      }

    }
  }

  static isWidgetAllowed(id_widget, callback) {

    // callback("true");
    // return;

    let currentUser = this.getUser();
    let appid = appconf.ieoappid;

    let data = new FormData()
    data.append("usertoken", currentUser);
    data.append("appid", parseInt(appid,10));
    data.append("id_widget", id_widget)


    fetch(appconf.controlersurl + "/Login/isWidgetAllowed", {
      method: "POST",
      body: data
    }).then(function(res) {
      return res.text();
    }).then(function(data) {


      callback(data);
    });

  }

}
