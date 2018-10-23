import React, {Component} from "react";
import {Button, FormGroup, FormControl, ControlLabel} from "react-bootstrap";
import {Redirect} from 'react-router-dom'
import "./Login.css";
import logo from './Img/ieo_logo_full.jpg';
import ground from './Img/ieo_fb_ground2.jpg';
import Cookies from 'js-cookie';
// const conf = require('./widgetconfig.json');
const appconf = require('../../appconf.json');

export default class Login extends Component {
  constructor(props) {
    super(props);

    this.logOut = this.logOut.bind(this);
    this.logIn = this.logIn.bind(this);

    let app_user = Cookies.get("app_user");

    let loginbutton = <Button block={true} bsSize="large" type="button" onClick={this.logIn}>
      Login
    </Button>

    if (app_user !== undefined) {
      loginbutton = <Button block={true} bsSize="large" type="button" onClick={this.logOut}>
        Logout
      </Button>
    }

    this.state = {
      email: "",
      password: "",
      roles: ["anonymous"],
      redirect: this.props.redirect,
      loginbutton: loginbutton,
      loginmessage: ""
    };

  }

  validateForm() {
    return this.state.email.length > 0 && this.state.password.length > 0;
  }

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  logIn() {

    let thisWidget = this;
    let data = new FormData(document.getElementById("loginform"));

    // Cookies.set("app_user", {user: "dsdf"});
    // thisWidget.setState({redirect: "/Home"});
    // return;

    fetch(appconf.controlersurl + "/Login/getUserToken", {
      method: "POST",
      body: data
    }).then(function(res) {
      return res.text();
    }).then(function(data) {



      let response = data.split("RESPONSE_")[0];
      switch (response) {
        case "":
          let token = data.split("RESPONSE_")[1];
          Cookies.set("app_user", {user: token});
          thisWidget.setState({redirect: "/Home"});
          break;
        default:
          thisWidget.setState({loginmessage: data});
          break;
      }
    });

  }

  logOut() {

    console.log("Logging out...");
    Cookies.remove('app_user');

    let loginbutton = <Button block={true} bsSize="large" type="button" onClick={this.logIn}>
      Login
    </Button>

    this.setState({loginmessage: "", loginbutton: loginbutton, redirect: "/Home"})
  }

  render() {

    if (this.state.redirect !== undefined) {
      return <Redirect to={this.state.redirect}/>
    }

    let loginStyle = {

      background: `url(${ground})`,
      backgroundSize: "cover",
      height: "100%",
      width: "100%"
    };

    return (<div id="loginContainer" style={loginStyle}>
      <div className="Login">
        <form id="loginform">
          <div>
            <img id="logofull" src={logo} alt="IEO"></img>
          </div>
          <FormGroup controlId="email" bsSize="large">
            <ControlLabel>Email</ControlLabel>
            <FormControl autoFocus="autoFocus" type="email" name="email" value={this.state.email} onChange={this.handleChange}/>
          </FormGroup>
          <FormGroup controlId="password" bsSize="large">
            <ControlLabel>Password</ControlLabel>
            <FormControl value={this.state.password} name="password" onChange={this.handleChange} type="password"/>
          </FormGroup>
          {this.state.loginbutton}
          <div>
            <p id="loginmessage">{this.state.loginmessage}</p>
          </div>
        </form>
      </div>
    </div>)
  }
}
