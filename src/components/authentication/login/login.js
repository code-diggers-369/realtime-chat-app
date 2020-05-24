import React, { Component } from "react";
import Loading from "react-loading";
import { Link } from "react-router-dom";

import { auth, firestore } from "../../firebase/firebase";

import "./login.css";
import LoginImg from "../../../img/login.png";

export default class login extends Component {
  state = {
    email: "",
    password: "",
    loading: false,
  };

  componentDidMount = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (user && auth.currentUser.emailVerified) {
        await this.setState({ isLoging: true });

        this.props.history.push("/chat");
      }
    });
  };

  loginUser = async () => {
    const { email, password } = this.state;

    this.setState({ loading: true });

    try {
      if (email && password) {
        var data = await auth.signInWithEmailAndPassword(email, password);

        if (auth.currentUser.emailVerified) {
          let user = data.user;

          if (user) {
            alert("Successfully Login");

            await this.props.history.push("/chat");
          }
        } else {
          await auth.currentUser.sendEmailVerification();

          alert("First Please Check Email For Verification Then Login Again");

          auth.signOut();
          localStorage.clear();
        }

        this.setState({ loading: false });
      } else {
        alert("Please Enter Valid Data");
        this.setState({ loading: false });
      }
    } catch (e) {
      alert(e);
      this.setState({ loading: false });
    }
  };

  render() {
    return (
      <div style={{ backgroundColor: "#F8F8F8", height: "100vh" }}>
        {/* main login container start */}

        <div className="center login-container shadow p-5 ">
          {/* row container starting here */}
          {this.state.loading === false ? (
            <div className="row  ">
              {/* first col starting here */}
              <div className="col-lg-6 col-md-6 left flex">
                <img src={LoginImg} className="login-img" />
              </div>

              <div className="col-lg-6 col-md-6 right flex2">
                <h1 style={{ fontWeight: "600", color: "#555456" }}>Login</h1>
                <div className="login-inputs">
                  <br></br>
                  <input
                    className="email p-2"
                    value={this.state.email}
                    onChange={(e) =>
                      this.setState({ email: e.target.value.toLowerCase() })
                    }
                    type="email"
                    placeholder="Email"
                  />

                  <br></br>
                  <br></br>

                  <input
                    className="password p-2"
                    type="password"
                    onChange={(e) =>
                      this.setState({ password: e.target.value })
                    }
                    onKeyUp={(e) => {
                      if (e.keyCode === 13) {
                        this.loginUser();
                      }
                    }}
                    type="password"
                    placeholder="Password"
                  />

                  <br></br>
                  <br></br>

                  <button
                    className="btn login-btn mt-2"
                    style={{
                      backgroundColor: "#7536e2",
                      color: "white",
                      borderRadius: "50px",
                    }}
                    onClick={() => this.loginUser()}
                  >
                    Login
                  </button>
                  <div className="mt-3">
                    <Link to="/forget" style={{ color: "black" }}>
                      <b className="text-secondary">Forget Password</b>
                    </Link>
                  </div>

                  <div style={{ fontWeight: "700" }}>Or</div>

                  <div className="">
                    <Link to="/signup" style={{ color: "black" }}>
                      <b className="text-secondary">Create Account</b>
                    </Link>
                  </div>
                </div>
              </div>
              {/* first col ending here */}
            </div>
          ) : (
            <center>
              <div
                className="shadow p-3"
                style={{ backgroundColor: "#E7E7E7" }}
              >
                <Loading type="bars" color="black" height={100} width={100} />

                <h3>Processing...</h3>
              </div>
            </center>
          )}

          {/* row container ending here */}
        </div>

        {/* main login container end */}
      </div>
    );
  }
}
