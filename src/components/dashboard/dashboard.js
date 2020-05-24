import React, { Component } from "react";

import { auth, firestore } from "../firebase/firebase";

import ChatList from "./chatlist/chatlist";

export default class chat extends Component {
  state = {
    newChatFormVisible: false,
    email: null,
    chats: [],
    allUserData: [],
    user: [],
    blockList: [],
  };

  componentDidMount = async () => {
    auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.props.history.push("/login");
      } else {
        try {
          await this.setState({ user: user, email: user.email });
          await this.getAllUsersData();
          await this.getInfo(user);

          await this.onlineStatusUpdate(user.email);
        } catch (e) {
          await this.props.history.push("/login");
        }
      }
    });
  };

  onlineStatusUpdate = async (email) => {
    const id = await firestore
      .collection("users")
      .where("email", "==", email)
      .get()
      .then((snapshot) => {
        return snapshot.docs.map((ob) => ob.id)[0];
      });

    const time = setTimeout(async () => {
      try {
        if (id != "undefined") {
          await firestore.collection("users").doc(id).update({
            isonline: true,
            isverify: true,
          });
        } else {
          await this.onlineStatusUpdate();
        }
      } catch (e) {
        console.log(e);
        this.props.history.push("/login");
      }

      clearTimeout(time);
    }, 2000);
  };

  getBlockList = async () => {
    const { allUserData, email } = this.state;

    const list = allUserData.forEach(async (obj) => {
      if (obj.email === email) {
        // console.log(obj.blocklist);
        await this.setState({ blockList: obj.blocklist });
      }
    });
  };

  getAllUsersData = async () => {
    await firestore.collection("users").onSnapshot(async (snapshot) => {
      var dt = snapshot.docs.map((docs) => docs.data());

      await this.setState({ allUserData: dt });
      await this.getBlockList();
    });
  };

  getInfo = async (user, emails) => {
    await firestore
      .collection("chats")
      .where("users", "array-contains", user.email)
      .onSnapshot(async (res) => {
        const chats = res.docs.map((docs) => docs.data());

        chats.sort((a, b) => {
          if (a.time < b.time) {
            return 1;
          } else if (a.time > b.time) {
            return -1;
          } else {
            return 0;
          }
        });

        var chatList = [];

        if (emails) {
          chatList = await chats.filter((chats) => {
            var getEmail =
              chats.users[0] !== user.email ? chats.users[0] : chats.users[1];

            if (emails.includes(getEmail)) {
              return chats;
            }
          });
        }

        if (!emails) {
          await this.setState({
            email: user.email,
            chats: chats,
          });
        } else {
          await this.setState({
            email: user.email,
            chats: chatList,
          });
        }
      });
  };

  searchChat = async (search) => {
    const { email, user } = this.state;

    const emails = await this.fetchSearchEmail(search, email);

    await this.getInfo(user, emails);
  };

  fetchSearchEmail = async (search, email) => {
    const emails = [];
    const { allUserData } = this.state;

    await allUserData.map((list) => {
      if (list.name.indexOf(search) !== -1 && list.email !== email) {
        emails.push(list.email);
      }
    });

    return emails;
  };

  render() {
    return (
      <div style={{ backgroundColor: "#F8F9FA", height: "100vh" }}>
        <div className="container-fluid  p-3">
          <ChatList
            history={this.props.history}
            chats={this.state.chats}
            userEmail={this.state.email}
            allUserData={this.state.allUserData}
            searchChat={(search) => this.searchChat(search)}
          />
        </div>
      </div>
    );
  }
}
