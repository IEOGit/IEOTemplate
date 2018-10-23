
import React, {Component} from 'react';
import Home from './Components/Home/Home.jsx';
import Login from './Components/Login/Login.jsx';
import { BrowserRouter as Router,
  Route,
  Redirect,
 Switch } from 'react-router-dom'
import Cookies from 'js-cookie';
export default class App extends Component {

  isAuthenticated(){

    return Cookies.get("app_user") ? true : false;
  }
  render() {

    // const PrivateRoute = ({ component: Component, ...rest }) => (
    //   <Route
    //     {...rest}
    //     render={props =>
    //       this.isAuthenticated ? (
    //         <Component {...props} />
    //       ) : (
    //         <Redirect
    //           redirect="/"
    //           to={{
    //             pathname: "/Login",
    //             state: { from: props.location }
    //           }}
    //         />
    //       )
    //     }
    //   />
    // );

    return (
      <Router>
        <Switch>
          <Route  exact path="/Home"  component={Home} />
          <Route exact path="/Login" component={Login} />
          <Route exact path="/" >
            <Redirect to="/Home"></Redirect>
          </Route>
          <Route render={()=>(<h1>404 Not Found</h1>)} />

        </Switch>
      </Router>
    );
  }
}
