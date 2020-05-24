import React, { Component } from "react";
import Deleting from "react-loading";

import { firestore, auth, storage } from "../../firebase/firebase";

import Room from "../chatroom/chatroom";
import NewChatForm from "../newchatform/newchatform";
import More from "./more/more";

import "./chatlist.css";

export default class chatlist extends Component {
  state = {
    profilePicture: "",
    showChatScreen: false,
    name: "",
    index: "",
    showNewChatForm: false,
    searchValue: "",
    longPress: false,
    showMoreOptions: false,
    docid: "",
    delMsgIndex: "",
    deleting: false,
  };

  componentDidMount = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.props.history.push("/login");
      } else {
        await this.getProfileData(user.uid);
      }
    });
  };

  getProfileData = async (ID) => {
    await firestore
      .collection("users")
      .where("id", "==", ID)
      .get()
      .then(async (snapshot) => {
        await snapshot.forEach(async (obj) => {
          const data = obj.data();

          await this.setState({ profilePicture: data.URL, name: data.name });
        });
      });
  };

  selectChat = async (index) => {
    const { longPress } = this.state;

    if (!longPress) {
      await this.setState({ index: index, showChatScreen: true });
    }
  };

  logOutUser = async () => {
    const confirm = window.confirm("Are You Sure To Logout ?");
    const { userEmail } = this.props;

    if (confirm) {
      await this.onlineStatusUpdate(userEmail);
      await auth.signOut();
      this.props.history.push("/");
    }
  };

  onlineStatusUpdate = async (email) => {
    const id = await firestore
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((snapshot) => {
        return snapshot.docs.map((ob) => ob.id)[0];
      });

    await firestore.collection("users").doc(id).update({
      isonline: false,
    });
  };

  backButtonClick = async () => {
    this.setState({ showChatScreen: false, showNewChatForm: false });

    await this.props.searchChat("");
  };

  searchChat = async () => {
    const { searchValue } = this.state;

    await this.props.searchChat(searchValue.toLowerCase());
  };

  touchStart = async (chat, index) => {
    this.buttonPressTimer = setTimeout(async () => {
      await this.setState({
        longPress: true,
        showMoreOptions: true,
        docid: chat.docid,
        delMsgIndex: index,
      });
    }, 1000);
  };

  touchEnd = async () => {
    clearTimeout(this.buttonPressTimer);
    var timer = setTimeout(async () => {
      await this.setState({ longPress: false });
    }, 400);
  };

  moreOptions = async (type) => {
    const { docid, delMsgIndex } = this.state;
    const tempData = this.props.chats[delMsgIndex].messages;

    switch (type) {
      case "delete":
        const confirm = window.confirm("Are You Sure To Delete?");

        if (confirm) {
          await this.setState({ deleting: true, showMoreOptions: false });
          await tempData.map(async (obj) => {
            if (obj.type === "img") {
              await storage.ref(`chats/${docid}/${obj.imgnm}`).delete();
            }
          });

          await firestore.collection("chats").doc(docid).delete();
        }

        await this.setState({ docid: "", deleting: false });
        break;

      case "cancel":
        await this.setState({ showMoreOptions: false });
        break;
    }
  };

  render() {
    return (
      <div>
        <div>
          {this.state.showNewChatForm === false ? (
            <div>
              {this.state.showChatScreen === false ? (
                <div>
                  <div className="text-center">
                    <img
                      className="mb-1"
                      onClick={() => this.props.history.push("/profile")}
                      src={
                        this.state.profilePicture ||
                        "https://moorestown-mall.com/noimage.gif"
                      }
                      style={{
                        height: "100px",
                        width: "100px",
                        borderRadius: "50%",
                        border: "1px solid black",
                        marginLeft: "auto",
                        marginRight: "auto",
                        display: "block",
                      }}
                    />

                    <h4>{this.state.name}</h4>
                  </div>
                  <div className="chat-list-btn mb-3">
                    <button
                      className="btn btn-primary mr-3"
                      onClick={() => this.setState({ showNewChatForm: true })}
                    >
                      New Chat
                    </button>

                    <button
                      className="btn btn-danger"
                      onClick={() => this.logOutUser()}
                    >
                      Logout
                    </button>
                  </div>

                  <div className="mb-3">
                    <div className="input-group md-form form-sm form-2 pl-0">
                      <input
                        className="form-control my-0 py-1 purple-border "
                        type="text"
                        placeholder="Search Current Chats"
                        aria-label="Search"
                        onChange={async (e) => {
                          await this.setState({ searchValue: e.target.value });
                          await this.searchChat();
                        }}
                      />
                    </div>
                  </div>

                  {this.props.chats.length > 0 ? (
                    <div className="overflow">
                      {this.props.chats.map((chat, index) => (
                        <div
                          className=" text-light p-2 mt-2 pointer"
                          style={{
                            //backgroundColor: "#6119DA",
                            backgroundColor: "#6b34c9",
                            borderRadius: "20px",
                          }}
                          onClick={() => this.selectChat(index)}
                          onTouchStart={() => this.touchStart(chat, index)}
                          onTouchEnd={() => this.touchEnd()}
                          onMouseDown={() => this.touchStart(chat, index)}
                          onMouseUp={() => this.touchEnd()}
                          onMouseLeave={() => this.touchEnd()}
                          key={index}
                        >
                          <div className="chat-list">
                            <img
                              className="chat-list-img mr-3"
                              src={this.props.allUserData
                                .map((list) => {
                                  if (
                                    list.email ===
                                    (chat.users[0] !== this.props.userEmail
                                      ? chat.users[0]
                                      : chat.users[1])
                                  ) {
                                    return list.URL;
                                  } else {
                                    return "";
                                  }
                                })
                                .join("")
                                .trim("")}
                              style={{ border: "1px solid white" }}
                            />

                            <div>
                              <h4 style={{ textAlign: "left" }}>
                                {this.props.allUserData.map((list) => {
                                  if (
                                    list.email ===
                                    (chat.users[0] !== this.props.userEmail
                                      ? chat.users[0]
                                      : chat.users[1])
                                  ) {
                                    return list.name;
                                  }
                                })}
                              </h4>

                              <h6>
                                {chat.messages[chat.messages.length - 1]
                                  .type === "text" ? (
                                  <span className="mr-1">
                                    {chat.messages.length > 0
                                      ? chat.messages[
                                          chat.messages.length - 1
                                        ].message.substring(0, 10)
                                      : ""}
                                  </span>
                                ) : (
                                  <span className="mr-1">Image</span>
                                )}
                                <span>
                                  <h6 style={{ display: "inline-block" }}>
                                    {chat.messages.length > 0
                                      ? chat.messages[chat.messages.length - 1]
                                          .time
                                      : ""}
                                  </h6>
                                </span>
                              </h6>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center">
                      <h3>Sorry No Chats. Let's Start New One</h3>
                    </div>
                  )}
                </div>
              ) : (
                <Room
                  chatData={this.props.chats[this.state.index]}
                  allUserData={this.props.allUserData}
                  userEmail={this.props.userEmail}
                  backButtonClick={() => this.backButtonClick()}
                  profilePicture={
                    this.state.profilePicture ||
                    "https://moorestown-mall.com/noimage.gif"
                  }
                />
              )}
            </div>
          ) : (
            <NewChatForm
              userEmail={this.props.userEmail}
              backButtonClick={() => this.backButtonClick()}
              allUserData={this.props.allUserData}
              history={this.props.history}
            />
          )}
        </div>

        {this.state.showMoreOptions ? (
          <More moreOptions={(type) => this.moreOptions(type)} />
        ) : null}

        {this.state.deleting ? (
          <div
            className="center p-3 shadow"
            style={{ borderRadius: "20px", backgroundColor: "white" }}
          >
            <center>
              <Deleting type="bars" color="black" height={100} width={100} />
            </center>
            <h4>Deleting...</h4>
            <h6>Please Dont Close The App</h6>
          </div>
        ) : null}
      </div>
    );
  }
}
