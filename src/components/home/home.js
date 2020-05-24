import React, { Component } from "react";

import { auth } from "../firebase/firebase";

import Header from "./header/header";
import Main from "./main/main";
import Footer from "./footer/footer";

export default class home extends Component {
  componentDidMount() {
    auth.onAuthStateChanged((user) => {
      if (user) {
        this.props.history.push("chat");
      }
    });
  }

  render() {
    return (
      <div
        className="container-fluid p-0 m-0"
        style={{ backgroundColor: "white" }}
      >
        <Header />
        <Main history={this.props.history} />
        <Footer />
      </div>
    );
  }
}
