import React, { Component } from "react";
import Loading from "react-loading";

import { firestore, f, storage } from "../../firebase/firebase";

import MoreDialog from "./moredialogbox/moredialogbox";

import GallaryImg from "../../../img/image_logo.png";
import "./chatroom.css";

export default class chatroom extends Component {
  state = {
    oponentUserData: [],
    oponentUserEmail: "",
    text: "",
    showProfile: false,
    showMoreDialogBox: false,
    unsendIndex: "",
    currentUserDocId: "",
    isOponentTyping: false,
    showImageBeforeUpload: false,
    imgFile: "",
    currentSelectedImg: "",
    loading: false,
    imgName: "",
    msgType: "",
    progress: 0,
    oldChatsLength: [],
  };

  componentDidMount = async () => {
    await this.getOponentUserInfo();
    await this.currentUserDocId();
    try {
      await this.getTypingData();
    } catch (e) {
      console.log(e);
    }

    await this.snapshotOnCall();

    await this.setState({ oldChats: this.props.chatData.messages.length });

    var time = setTimeout(async () => {
      await this.scrollingToEnd();
      clearTimeout(time);
    }, 3000);
  };

  componentWillUnmount = async () => {
    await this.typing();
  };

  componentDidUpdate = async () => {
    const chat = this.props.chatData.messages.length;
    const { oldChats } = this.state;
    if (chat !== oldChats) {
      await this.isChatChanged(chat);
    }
  };

  isChatChanged = async (chat) => {
    console.log("hello");
    await this.scrollingToEnd();
    this.setState({ oldChats: chat });
  };

  scrollingToEnd = () => {
    try {
      const scroll = document.getElementById("scrolling");

      scroll.scrollTop = scroll.scrollHeight;
    } catch (e) {}
  };

  snapshotOnCall = async () => {
    const { oponentUserEmail } = this.state;
    await firestore
      .collection("users")
      .where("email", "==", oponentUserEmail)
      .onSnapshot(async () => {
        await this.getOponentUserInfo();
      });
  };

  getOponentUserInfo = async () => {
    const { userEmail } = this.props;
    const userData = [];

    var fetchEmail = this.fetchEmail(userEmail);

    await this.props.allUserData.map((user) => {
      if (user.email === fetchEmail) {
        userData.push(user);
      }
    });

    await this.setState({
      oponentUserData: userData[0],
      oponentUserEmail: fetchEmail,
    });
  };

  fetchEmail = (userEmail) => {
    const { users } = this.props.chatData;

    return users[0] !== userEmail ? users[0] : users[1];
  };

  blockList = async () => {
    const byme = await this.blockByMe();

    const byoponent = await this.blockByOponent();

    return byme || byoponent;
  };

  blockByMe = () => {
    const { oponentUserEmail } = this.state;
    const { userEmail, allUserData } = this.props;
    let isBlocked = "";

    allUserData.forEach((obj) => {
      if (obj.email === userEmail) {
        isBlocked = obj.blocklist.includes(oponentUserEmail);
      }
    });

    return isBlocked;
  };

  blockByOponent = () => {
    const { oponentUserData } = this.state;
    const { userEmail } = this.props;
    let isBlocked = oponentUserData.blocklist.includes(userEmail);

    return isBlocked;
  };

  sendMessage = async () => {
    const { docid } = this.props.chatData;
    const { userEmail } = this.props;
    const { text } = this.state;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });

    const timestamp = Date.now();

    const isBlocked = await this.blockList();

    if (text) {
      if (!isBlocked) {
        await firestore
          .collection("chats")
          .doc(docid)
          .update({
            messages: f.firestore.FieldValue.arrayUnion({
              sender: userEmail,
              message: text,
              time: time,
              type: "text",
            }),
            time: timestamp,
          });

        await this.scrollingToEnd();
      } else {
        alert("Sorry This Chat Is Blocked");
      }
    } else {
      alert("Please Enter Valid Chat");
    }

    await this.typing();

    await this.setState({ text: "" });
  };

  touchStart = (index) => {
    this.buttonPressTimer = setTimeout(async () => {
      this.setState({
        showMoreDialogBox: true,
        unsendIndex: index,
        msgType: "text",
      });
    }, 1000);
  };

  unsendMsg = async (updateChats) => {
    const { docid } = this.props.chatData;

    await firestore.collection("chats").doc(docid).update({
      messages: updateChats,
    });
  };

  touchEnd = () => {
    clearTimeout(this.buttonPressTimer);
  };

  moreOptions = async (type) => {
    const { unsendIndex, imgName, msgType } = this.state;

    switch (type) {
      case "unsend":
        const updateChats = this.props.chatData.messages.filter(
          (ob, indexthis) => {
            return indexthis !== unsendIndex;
          }
        );

        if (msgType === "img") {
          await this.deleteImageFromStorage(imgName);
        }

        await this.unsendMsg(updateChats);
        break;

      case "cancel":
        await this.setState({ showMoreDialogBox: false });
        break;

      default:
        break;
    }

    await this.setState({ showMoreDialogBox: false });
  };

  currentUserDocId = async () => {
    const { profilePicture } = this.props;
    await firestore
      .collection("users")
      .where("URL", "==", profilePicture)
      .get()
      .then((snapshot) => {
        snapshot.forEach((ob) => {
          this.setState({ currentUserDocId: ob.id });
        });
      });
  };

  blockUser = async () => {
    const { currentUserDocId, oponentUserEmail } = this.state;
    const name = this.state.oponentUserData.name;
    const confirm = window.confirm(`Are You Sure To Block ${name}`);

    try {
      if (confirm) {
        await firestore
          .collection("users")
          .doc(currentUserDocId)
          .get()
          .then((dt) => {
            const list = dt.data().blocklist;

            if (!list.includes(oponentUserEmail)) {
              list.push(oponentUserEmail);
            }

            firestore
              .collection("users")
              .doc(currentUserDocId)
              .update({
                blocklist: list,
              })
              .then(() => {
                alert(`${name} Is Blocked Successfully`);
              });
          });
      }
    } catch (e) {
      alert("Sorry Something Want Wrong Try Again");
    }
  };

  getTypingData = async () => {
    const { docid } = this.props.chatData;
    const { oponentUserEmail } = this.state;

    try {
      await firestore
        .collection("chats")
        .doc(docid)
        .onSnapshot(async (snapshot) => {
          if (snapshot.data()) {
            const typing = snapshot.data().typing;

            if (typing.includes(oponentUserEmail)) {
              await this.setState({ isOponentTyping: true });
            } else {
              await this.setState({ isOponentTyping: false });
            }
          }
        });
    } catch (e) {
      console.log(e);
    }
  };

  typing = async (value) => {
    const { docid } = this.props.chatData;
    const { userEmail } = this.props;

    const isBlocked = await this.blockList();

    if (!isBlocked) {
      let finalData = await this.getCurrentTypingData(docid);

      if (value) {
        if (!finalData.includes(userEmail)) {
          await finalData.push(userEmail);
        }
      } else {
        finalData = finalData.filter((ob) => {
          if (ob !== userEmail) {
            return ob;
          }
        });
      }

      firestore.collection("chats").doc(docid).update({
        typing: finalData,
      });
    }
  };

  getCurrentTypingData = async (docid) => {
    const array = [];

    try {
      const dt = await firestore
        .collection("chats")
        .doc(docid)
        .get()
        .then((obj) => {
          return obj.data().typing;
        });
      return dt;
    } catch (e) {
      return [];
    }
  };

  setImageLocally = async (e) => {
    await this.setState({ showImageBeforeUpload: true });

    const type = e.type;

    this.setState({ imgFile: e });

    if (type.match(/image+/g)) {
      var oFReader = new FileReader();
      oFReader.readAsDataURL(e);

      var that = this;

      oFReader.onload = async function (oFREvent) {
        await that.setState({
          currentSelectedImg: oFREvent.target.result,
        });
      };
    } else {
      alert("Please Upload Valid Image File");
      await this.setState({
        currentSelectedImg: "",
        showImageBeforeUpload: false,
      });
    }
  };

  sendImage = async () => {
    const { docid } = this.props.chatData;
    const { userEmail } = this.props;
    const { imgFile } = this.state;

    const time = new Date().toLocaleTimeString("en-US", {
      hour: "numeric",
      hour12: true,
      minute: "numeric",
    });

    const timestamp = Date.now();

    const isBlocked = await this.blockList();

    try {
      if (!isBlocked) {
        await this.setState({ loading: true });
        await storage
          .ref(`chats/${docid}/${timestamp}`)
          .put(imgFile)
          .on(
            "state_changed",

            async (snapshot) => {
              const process = Math.round(
                (snapshot.bytesTransferred / snapshot.totalBytes) * 100
              );

              this.setState({ progress: process });
            },
            (e) => {
              console.log(e);
            },
            async () => {
              const URL = await storage
                .ref(`chats/${docid}/${timestamp}`)
                .getDownloadURL()
                .then((newUrl) => {
                  return newUrl;
                });

              await firestore
                .collection("chats")
                .doc(docid)
                .update({
                  messages: f.firestore.FieldValue.arrayUnion({
                    sender: userEmail,
                    type: "img",
                    imgnm: timestamp,
                    time: time,
                    URL: URL,
                  }),
                  time: timestamp,
                });

              await this.setState({
                loading: false,
                showImageBeforeUpload: false,
              });

              var timeout = setTimeout(async () => {
                await this.scrollingToEnd();

                clearTimeout(timeout);
              }, 3000);
            }
          );
      } else {
        alert("Sorry This Chat Is Blocked");
      }
    } catch (e) {
      console.log(e);
    }
  };

  deleteImageFromStorage = async (imgName) => {
    const { docid } = this.props.chatData;

    try {
      await storage.ref(`chats/${docid}/${imgName}`).delete();
    } catch (e) {
      console.log(e);
    }
  };

  touchStartImg = async (index, imgnm) => {
    this.imagePressTimer = setTimeout(async () => {
      await this.setState({
        showMoreDialogBox: true,
        unsendIndex: index,
        imgName: imgnm,
        msgType: "img",
      });
    }, 1000);
  };

  touchEndImg = async () => {
    clearTimeout(this.imagePressTimer);
  };

  render() {
    const { oponentUserData, oponentUserEmail } = this.state;
    const { profilePicture } = this.props;

    return (
      <div className="container-fluid">
        {this.state.showImageBeforeUpload === false ? (
          <div>
            {this.state.showProfile === false ? (
              <div className="card">
                <div className="card-header msg_head">
                  <div
                    className="d-flex bd-highlight"
                    style={{ alignItems: "center" }}
                  >
                    <div>
                      <button
                        className="btn btn-primary mr-2"
                        onClick={this.props.backButtonClick}
                      >
                        Back
                      </button>
                    </div>
                    <div className="img_cont">
                      <img
                        src={oponentUserData.URL}
                        className="rounded-circle user_img"
                        style={{ cursor: "pointer" }}
                        onClick={() => this.setState({ showProfile: true })}
                      />
                    </div>
                    <div className="user_info">
                      <span>{oponentUserData.name}</span>{" "}
                      <h6 className="inline">
                        ({oponentUserData.isonline ? "Online" : "Offline"})
                      </h6>
                      <h6>
                        {this.state.isOponentTyping ? (
                          <h6 className="typing-text-left">Typing...</h6>
                        ) : null}
                      </h6>
                    </div>
                  </div>
                </div>

                <div className="card-body msg_card_body" id="scrolling">
                  {this.props.chatData.messages.map((list, index) => (
                    <div key={index}>
                      {list.type === "text" ? (
                        <div>
                          {list.sender === oponentUserEmail ? (
                            <div className="d-flex justify-content-start mb-4">
                              <div className="img_cont_msg">
                                <img
                                  src={oponentUserData.URL}
                                  className="rounded-circle user_img_msg"
                                />
                              </div>
                              <div
                                className="msg_cotainer text-center"
                                style={{ minWidth: "70px" }}
                              >
                                {list.message}
                                <span className="msg_time text-dark text-center">
                                  {list.time}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="d-flex justify-content-end mb-4"
                              onTouchStart={() => this.touchStart(index)}
                              onTouchEnd={() => this.touchEnd()}
                              onMouseDown={() => this.touchStart(index)}
                              onMouseUp={() => this.touchEnd()}
                              onMouseLeave={() => this.touchEnd()}
                            >
                              <div
                                className="msg_cotainer_send text-center pointer"
                                style={{ minWidth: "70px" }}
                              >
                                {list.message}
                                <span className="msg_time_send text-dark text-center">
                                  {list.time}
                                </span>
                              </div>
                              <div className="img_cont_msg">
                                <img
                                  src={profilePicture}
                                  className="rounded-circle user_img_msg"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      ) : (
                        <div>
                          {list.sender === oponentUserEmail ? (
                            <div className="d-flex justify-content-start mb-4">
                              <div className="img_cont_msg">
                                <img
                                  src={oponentUserData.URL}
                                  className="rounded-circle user_img_msg"
                                />
                              </div>
                              <div
                                className="msg_cotainer text-center"
                                style={{ minWidth: "70px", width: "40%" }}
                              >
                                <img src={list.URL} className="msg_img" />
                                <span className="msg_time text-dark text-center">
                                  {list.time}
                                </span>
                              </div>
                            </div>
                          ) : (
                            <div
                              className="d-flex justify-content-end mb-4"
                              onTouchStart={() =>
                                this.touchStartImg(index, list.imgnm)
                              }
                              onTouchEnd={() => this.touchEndImg()}
                              onMouseDown={() =>
                                this.touchStartImg(index, list.imgnm)
                              }
                              onMouseUp={() => this.touchEndImg()}
                              onMouseLeave={() => this.touchEndImg()}
                            >
                              <div
                                className="msg_cotainer_send text-center pointer"
                                style={{ minWidth: "70px", width: "40%" }}
                              >
                                <img src={list.URL} className="msg_img" />
                                <span className="msg_time_send text-dark text-center">
                                  {list.time}
                                </span>
                              </div>
                              <div className="img_cont_msg">
                                <img
                                  src={profilePicture}
                                  className="rounded-circle user_img_msg"
                                />
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="card-footer">
                  <div className="input-group">
                    <textarea
                      name=""
                      className="form-control type_msg"
                      placeholder="Type your message..."
                      value={this.state.text}
                      onChange={(e) => {
                        this.setState({ text: e.target.value });
                        this.typing(e.target.value);
                      }}
                    ></textarea>
                    <div>
                      <img
                        src={GallaryImg}
                        onClick={() =>
                          document.getElementById("share_img").click()
                        }
                        className="mt-2 galary-img"
                      />
                      <input
                        type="file"
                        id="share_img"
                        style={{ display: "none" }}
                        onChange={(e) =>
                          this.setImageLocally(e.target.files[0])
                        }
                        accept="image/"
                      />
                    </div>
                    <div className="input-group-append">
                      <span
                        className="input-group-text send_btn"
                        onClick={() => this.sendMessage()}
                      >
                        send
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="oponent-profile p-5 shadow center">
                <div className="chat-img-profile-div">
                  <img src={oponentUserData.URL} className="chat-img-profile" />
                </div>

                <div
                  style={{
                    backgroundColor: "#6b34c9",
                    color: "white",
                    borderRadius: "20px",
                  }}
                  className="p-2 mt-2 container"
                >
                  <div className="chat-name-profile">
                    <h3>Name: {oponentUserData.name}</h3>
                  </div>

                  <div>
                    <h4>Email: {oponentUserData.email}</h4>
                  </div>

                  <div className="chat-description-profile">
                    <h5>Description: {oponentUserData.description}</h5>
                  </div>
                </div>

                <div className="p-3">
                  <button
                    className="btn-lg btn-danger"
                    onClick={() => this.blockUser()}
                  >
                    Block
                  </button>

                  <br></br>

                  <button
                    className="btn btn-primary mt-3"
                    onClick={() => this.setState({ showProfile: false })}
                  >
                    Back
                  </button>
                </div>
              </div>
            )}

            {this.state.showMoreDialogBox ? (
              <MoreDialog moreOptions={(type) => this.moreOptions(type)} />
            ) : null}
          </div>
        ) : (
          <div className="container center">
            <img
              src={this.state.currentSelectedImg}
              className="image-upload-output"
            />

            {!this.state.loading ? (
              <div className="mt-2">
                <button
                  className="btn btn-primary mr-3"
                  onClick={() => {
                    this.setState({
                      showImageBeforeUpload: false,
                      imgFile: "",
                      currentSelectedImg: "",
                    });
                    this.scrollingToEnd();
                  }}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-success"
                  onClick={() => this.sendImage()}
                >
                  Send
                </button>
              </div>
            ) : null}
          </div>
        )}

        {this.state.loading === true ? (
          <div className="p-3  center">
            <center>
              <div
                className="shadow p-3"
                style={{ backgroundColor: "#E7E7E7" }}
              >
                <Loading type="bars" color="black" height={100} width={100} />
                <h5>{this.state.progress}%</h5>
                <h3>Sending...</h3>
              </div>
            </center>
          </div>
        ) : null}
      </div>
    );
  }
}
