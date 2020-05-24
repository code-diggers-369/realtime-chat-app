import React, { Component } from "react";

import { Link } from "react-router-dom";

export default class header extends Component {
  render() {
    return (
      <div>
        <nav
          className="navbar navbar-expand-lg navbar-dark p-3"
          style={{
            backgroundColor: "#6119DA",
          }}
        >
          <Link className="navbar-brand" to="/" style={{ fontSize: "30px" }}>
            Samvad
          </Link>
          <button
            className="navbar-toggler"
            type="button"
            data-toggle="collapse"
            data-target="#navbarSupportedContent"
            aria-controls="navbarSupportedContent"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarSupportedContent">
            <ul className="navbar-nav mr-auto">
              <li className="nav-item">
                <a
                  className="nav-link text-light"
                  style={{ fontSize: "18px" }}
                  href="#block2"
                >
                  Layout
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-light"
                  style={{ fontSize: "18px" }}
                  href="#block3"
                >
                  Speciality
                </a>
              </li>

              <li className="nav-item">
                <a
                  className="nav-link text-light"
                  style={{ fontSize: "18px" }}
                  href="#block4"
                >
                  Fetures
                </a>
              </li>
            </ul>
            <form className="form-inline my-2 my-lg-0">
              <Link to="/login" className="btn btn-outline-light mr-2">
                Log In
              </Link>

              <Link to="/signup" className="btn btn-light mr-1">
                Sign Up
              </Link>
            </form>
          </div>
        </nav>
      </div>
    );
  }
}
