import React, { Component } from "react";

import { firestore } from "../../firebase/firebase";

import Loading from "react-loading";

import "./newchatform.css";

export default class newchatform extends Component {
  state = {
    email: "",
    msg: "",
    loading: false,
    username: "",
    allUserData: this.props.allUserData,
    showSearchList: false,
    list: [],
    blockList: [],
  };

  componentDidMount = async () => {
    try {
      await this.getAllUsersData();
    } catch (e) {
      await this.getAllUsersData();
    }
  };

  getAllUsersData = async () => {
    const { allUserData } = this.props;
    if (allUserData.length === 0) {
      this.props.history.push("/chat");
    }
  };

  goToChat = async () => {
    alert("Chat Is Already Exists");
    this.props.backButtonClick();
  };

  submitNewChat = async () => {
    this.setState({ loading: true });

    const userExists = await this.userExists();

    const { email, msg, username } = this.state;
    const { userEmail } = this.props;

    if (email && msg && email !== userEmail && username) {
      if (userExists) {
        const chatExists = await this.chatExists();

        try {
          chatExists ? this.goToChat() : this.createChat(userEmail, email, msg);
        } catch (e) {
          console.log(e);
        }
      } else {
        alert("User Is Not Exists Please Check It");
        await this.setState({ loading: false });
      }
    } else {
      alert("Please Enter Valid Data");
      await this.setState({ loading: false });
    }
  };

  blockList = async () => {
    const byme = await this.blockByMe();

    const byoponent = await this.blockByOponent();

    return byme || byoponent;
  };

  blockByMe = () => {
    const { email } = this.state;
    const { userEmail, allUserData } = this.props;
    let isBlocked = "";

    allUserData.forEach((obj) => {
      if (obj.email === userEmail) {
        isBlocked = obj.blocklist.includes(email);
      }
    });

    return isBlocked;
  };

  blockByOponent = () => {
    const { blockList } = this.state;
    const { userEmail } = this.props;

    let isBlocked = blockList.includes(userEmail);

    return isBlocked;
  };

  createChat = async (userEmail, email, msg) => {
    const docId = await this.buildId();
    const timeStamp = Date.now();
    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });

    const isBlocked = await this.blockList();

    if (!isBlocked) {
      await firestore
        .collection("chats")
        .doc(docId)
        .set({
          docid: docId,
          time: timeStamp,
          users: [userEmail, email],
          typing: [],
          messages: [
            {
              message: msg,
              sender: userEmail,
              time: time,
              type: "text",
            },
          ],
        });

      this.setState({ loading: false });

      await this.props.backButtonClick();
    } else {
      alert("Sorry This Chat Is Blocked");

      await this.setState({ loading: false });
    }
  };

  buildId = async () => {
    return [this.state.email, this.props.userEmail].sort().join(":");
  };

  chatExists = async () => {
    const docid = await this.buildId();

    const chat = await firestore.collection("chats").doc(docid).get();

    return chat.exists;
  };

  userExists = async () => {
    const userSnapshot = await firestore.collection("users").get();

    try {
      const exists = userSnapshot.docs
        .map((docs) => docs.data().email)
        .includes(this.state.email);
      return exists;
    } catch (e) {
      console.log(e);
      alert("Sorry Something Want Wrong");
      this.setState({ loading: false });
    }

    return false;
  };

  showList = async () => {
    let { allUserData, username } = this.state;
    let { userEmail } = this.props;

    const dataList = [];

    if (username.length > 0) {
      allUserData.map((data) => {
        if (data.name.indexOf(username) !== -1 && data.email !== userEmail) {
          dataList.push(data);
        }
      });

      await this.setState({ list: dataList });
    } else {
      await this.setState({ list: [] });
    }

    if (this.state.list.length === 0) {
      await this.setState({ showSearchList: false, email: "" });
    } else {
      await this.setState({ showSearchList: true });
    }
  };

  render() {
    return (
      <div
        className="center container-fluid p-5"
        style={{
          backgroundColor: "white",
          width: "90vw",
          borderRadius: "20px",
        }}
      >
        {this.state.loading === false ? (
          <div className="row">
            {/* <div className="col-lg-6 col-sm-12 col-xs-12">
              <img src={NewMsg} style={{ width: "100%" }} />
            </div> */}
            <div className="col-lg-6 col-sm-12 col-xs-12 flex2">
              <h3>Lets Create New Chat</h3>

              <div>
                <input
                  type="text"
                  placeholder="Enter Your Friend Username"
                  value={this.state.username}
                  className="email mt-3"
                  style={{ padding: "5px" }}
                  onChange={async (e) => {
                    await this.setState({
                      username: e.target.value.toLowerCase(),
                    });
                    await this.showList();
                  }}
                />
              </div>

              <div className="mt-3">
                <input
                  type="text"
                  placeholder="Enter Message"
                  value={this.state.msg}
                  className="email"
                  style={{ padding: "5px" }}
                  onChange={(e) => this.setState({ msg: e.target.value })}
                  onKeyUp={(e) =>
                    e.keyCode === 13 ? this.submitNewChat() : null
                  }
                />
              </div>

              <div className="mt-3">
                <button
                  className="btn btn-secondary"
                  onClick={() => this.props.backButtonClick()}
                >
                  Back
                </button>

                <button
                  className="btn text-light ml-3"
                  style={{ backgroundColor: "#6b38d1" }}
                  onClick={() => this.submitNewChat()}
                >
                  Create
                </button>
              </div>
            </div>

            <div className="col-lg-6 col-sm-12 col-xs-12 flex2 mt-2">
              {this.state.showSearchList ? (
                <div className="new-chat-list">
                  {this.state.list.map((data, index) => (
                    <div
                      className=" text-light p-2 mt-2 pointer"
                      style={{
                        backgroundColor: "#6b34c9",
                        borderRadius: "20px",
                      }}
                      key={index}
                      onClick={async () => {
                        await this.setState({
                          email: data.email,
                          username: data.name,
                          blockList: data.blocklist,
                        });

                        await this.showList();
                      }}
                    >
                      <div className="chat-list">
                        <img
                          className="chat-list-img mr-3"
                          src={data.URL}
                          style={{ border: "1px solid white" }}
                        />

                        <div>
                          <h4 style={{ textAlign: "left" }}>{data.name}</h4>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div>No Result</div>
              )}
            </div>
          </div>
        ) : (
          <center>
            <Loading type="bars" color="black" height={100} width={100} />
            <h3>Submiting...</h3>
          </center>
        )}
      </div>
    );
  }

  // render() {
  //   return (
  //     <div>
  //       {this.state.loading === false ? (
  //         <div className="row">
  //           {/* <div className="col-lg-6 col-sm-12 col-xs-12">
  //             <img src={NewMsg} style={{ width: "100%" }} />
  //           </div> */}
  //           <div className="col-lg-6 col-sm-12 col-xs-12 flex2">
  //             <h3>Lets Create New Chat</h3>

  //             <div>
  //               <input
  //                 type="email"
  //                 placeholder="Enter Your Friend Email"
  //                 value={this.state.email}
  //                 className="email mt-3"
  //                 style={{ padding: "5px" }}
  //                 onChange={(e) => this.setState({ email: e.target.value })}
  //               />
  //             </div>

  //             <div className="mt-3">
  //               <input
  //                 type="text"
  //                 placeholder="Enter Message"
  //                 value={this.state.msg}
  //                 className="email"
  //                 style={{ padding: "5px" }}
  //                 onChange={(e) => this.setState({ msg: e.target.value })}
  //                 onKeyUp={(e) =>
  //                   e.keyCode === 13 ? this.submitNewChat() : null
  //                 }
  //               />
  //             </div>

  //             <div className="mt-3">
  //               <button
  //                 className="btn text-light"
  //                 style={{ backgroundColor: "#6b38d1" }}
  //                 onClick={() => this.submitNewChat()}
  //               >
  //                 Create
  //               </button>
  //             </div>

  //             <div className="mt-2">
  //               <button
  //                 className="btn btn-secondary"
  //                 onClick={() => this.props.backButtonClick()}
  //               >
  //                 Back
  //               </button>
  //             </div>
  //           </div>

  //           <div className="col-lg-6 col-sm-12 col-xs-12 flex2 mt-3">
  //             {this.state.list.length !== 0 ? (
  //               <div className="new-chat-list">hello</div>
  //             ) : (
  //               <div>Searching List</div>
  //             )}
  //           </div>
  //         </div>
  //       ) : (
  //         <center>
  //           <Loading type="bars" color="black" height={100} width={100} />
  //           <h3>Submiting...</h3>
  //         </center>
  //       )}
  //     </div>
  //   );
  // }
}
