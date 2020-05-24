import React, { Component } from "react";

import { auth } from "../firebase/firebase";

import PageNotFound from "../../img/page_not_found.png";
import { Link, Redirect } from "react-router-dom";

export default class forget extends Component {
  state = {
    isLoging: false,
  };

  componentDidMount = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user && auth.currentUser.emailVerified) {
        await this.setState({ isLoging: true });
      } else {
        this.setState({ isLoging: false });
      }
    });
  };
  render() {
    return (
      <div style={{ backgroundColor: "#F8F8F8", height: "100vh" }}>
        {/* main login container start */}
        <div className="center login-container shadow p-5 ">
          <img src={PageNotFound} style={{ width: "70%" }} />
          <br></br>
          <h4>Sorry Page Not Found</h4>

          <Link to="/">
            <button className="btn btn-primary">Home</button>
          </Link>
        </div>
        {/* main login container end */}

        {this.state.isLoging === true ? <Redirect to="/chat" /> : null}
      </div>
    );
  }
}
