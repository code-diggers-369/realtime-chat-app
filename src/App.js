import React, { Component } from "react";

import {
  Route,
  BrowserRouter as Router,
  Switch,
  Redirect,
} from "react-router-dom";

import { auth } from "./components/firebase/firebase";

import Home from "./components/home/home";
import Login from "./components/authentication/login/login";
import Signup from "./components/authentication/signup/signup";
import Forget from "./components/authentication/forget/forget";
import Notfound from "./components/page404/page404";
import Profile from "./components/dashboard/profile/profile";
import ChatScreen from "./components/dashboard/dashboard";
export default class App extends Component {
  state = {
    isLoging: false,
  };

  render() {
    return (
      <div>
        <Router>
          <Switch>
            <Route exact={true} path="/" component={Home} />
            <Route exact={true} path="/login" component={Login} />
            <Route exact={true} path="/signup" component={Signup} />
            <Route exact={true} path="/forget" component={Forget} />

            <Route exact={true} path="/profile" component={Profile} />
            <Route exact={true} path="/chat" component={ChatScreen} />

            <Route path="/*" component={Notfound} />
          </Switch>
        </Router>
      </div>
    );
  }
}
