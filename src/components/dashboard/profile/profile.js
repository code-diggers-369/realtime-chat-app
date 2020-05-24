import React, { Component } from "react";
import Loading from "react-loading";

import { firestore, auth, storage } from "../../firebase/firebase";

import More from "./more/more-profile";

import "./profile.css";

export default class profile extends Component {
  state = {
    profilePicture: "",
    name: "",
    copyName: "",
    description: "",
    isImageChanged: false,
    isNameChanged: false,
    isDescriptionChanged: false,
    docId: "",
    uploadSuccessfully: false,
    imgFile: "",
    uid: "",
    loading: false,
    showCropImage: false,
    progress: 0,
    showMore: false,
    blockList: [],
    blockUsersData: [],
  };

  componentDidMount = async () => {
    await auth.onAuthStateChanged(async (user) => {
      if (!user) {
        this.props.history.push("/");
      } else {
        await this.getProfile(user.uid);
        await this.getBlockUsersData();
        this.setState({ uid: user.uid });
      }
    });
  };
  getListOfBlockUsers = async () => {
    const { docId } = this.state;

    try {
      const list = await firestore
        .collection("users")
        .doc(docId)
        .get()
        .then(async (obj) => {
          const data = obj.data().blocklist;

          return data;
        });

      return list;
    } catch (error) {
      this.props.history.push("/profile");
      return [];
    }
  };

  getBlockUsersData = async () => {
    await firestore.collection("users").onSnapshot(async (snapshot) => {
      const blockList = await this.getListOfBlockUsers();

      const dt = await snapshot.docs
        .map((docs) => {
          const data = docs.data();

          if (blockList.includes(data.email)) {
            return data;
          } else {
            return "";
          }
        })
        .filter((obj) => {
          return obj;
        });

      await this.setState({ blockUsersData: dt });
    });
  };

  getProfile = async (ID) => {
    await firestore
      .collection("users")
      .where("id", "==", ID)
      .get()
      .then(async (snapshot) => {
        await snapshot.forEach(async (doc) => {
          const data = doc.data();

          await this.setState({
            profilePicture: data.URL,
            name: data.name,
            copyName: data.name,
            description: data.description,
            docId: doc.id,
          });
        });
      });
  };

  uploadChanges = async () => {
    const {
      isDescriptionChanged,
      isNameChanged,
      isImageChanged,
      docId,
      name,
      copyName,
      description,
      uploadSuccessfully,
    } = this.state;

    if (name.length >= 15) {
      alert("Name Length Must Be 1-15");
      return;
    }

    if (isNameChanged) {
      const isUnique = await this.checkForUniqueName(name);

      if (name !== copyName) {
        if (isUnique) {
          await firestore
            .collection("users")
            .doc(docId)
            .update({
              name,
            })
            .then(() => {
              this.setState({ uploadSuccessfully: true });
            })
            .catch((e) => {
              console.log(e);
            });
        } else {
          alert("Sorry Name Is Repeat Try Other");
        }
      } else {
        alert("No Changes");
      }
    }

    if (isDescriptionChanged) {
      await firestore
        .collection("users")
        .doc(docId)
        .update({
          description,
        })
        .then(() => {
          this.setState({ uploadSuccessfully: true });
        })
        .catch((e) => {
          console.log(e);
        });
    }
    if (this.state.uploadSuccessfully) {
      alert("Successfully Updated");
    }

    if (isImageChanged) {
      this.uploadImageToServer();
    }

    this.setState({
      isDescriptionChanged: false,
      isNameChanged: false,
      uploadSuccessfully: false,
    });
  };

  checkForUniqueName = async (name) => {
    const exists = await (await firestore.collection("users").get()).docs
      .map((docs) => docs.data().name)
      .includes(name);

    return !exists;
  };

  uploadImageToServer = async () => {
    const { imgFile, uid, docId } = this.state;

    await this.setState({ loading: true });

    try {
      var uploadTask = await storage
        .ref(`profile-pic/${uid}/${imgFile.name}`)
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
            await this.oldRemove(docId, uid);

            await storage
              .ref(`profile-pic/${uid}/${imgFile.name}`)
              .getDownloadURL()
              .then((newUrl) => {
                var time = setTimeout(async () => {
                  await firestore.collection("users").doc(docId).update({
                    URL: newUrl,
                    imgname: imgFile.name,
                  });

                  clearTimeout(time);
                }, 5000);
                this.setState({ loading: false });

                setTimeout(() => {
                  this.props.history.push("/chat");
                }, 7000);
              });
          }
        );
    } catch (e) {
      console.log(e);
      alert("Something Want Wrong Please Try Again");
      this.setState({ loading: false });
    }
  };

  oldRemove = async (docId, uId) => {
    var imgName = "";

    this.setState({ loading: true });

    await firestore
      .collection("users")
      .doc(docId)
      .get()
      .then((snapshot) => {
        const data = snapshot.data();

        imgName = data.imgname;
      });

    await firestore.collection("users").doc(docId).update({
      URL: "",
      imgname: "",
    });

    try {
      if (imgName) {
        await storage.ref(`profile-pic/${uId}/${imgName}`).delete();

        this.setState({ profilePicture: "", loading: false });
      }
    } catch (e) {
      console.log(e);
      this.setState({ loading: false });
    }
  };

  updateImageInCurrentState = async (e) => {
    this.setState({ showCropImage: true });

    const type = e.target.files[0].type;

    this.setState({ imgFile: e.target.files[0] });

    if (type.match(/image+/g)) {
      var oFReader = new FileReader();
      oFReader.readAsDataURL(e.target.files[0]);

      var that = this;

      oFReader.onload = async function (oFREvent) {
        await that.setState({
          profilePicture: oFREvent.target.result,
          isImageChanged: true,
        });
      };
    } else {
      alert("Please Upload Valid Image File");
    }
  };

  removeImage = async () => {
    const confirm = window.confirm("Are You Sure To Remove");

    const { profilePicture } = this.state;

    if (confirm && profilePicture) {
      await this.oldRemove(this.state.docId, this.state.uid);
    }
  };

  render() {
    return (
      <div>
        <div className="container-fluid p-2">
          {this.state.loading === false ? (
            <div className="mt-3 mb-2">
              {this.state.showMore === false ? (
                <center>
                  <div>
                    <h3>Profile</h3>

                    <input
                      type="file"
                      style={{ display: "none" }}
                      id="profile-upload"
                      onChange={(e) => this.updateImageInCurrentState(e)}
                      accept="image/"
                    />
                    <img
                      src={
                        this.state.profilePicture ||
                        "https://moorestown-mall.com/noimage.gif"
                      }
                      onClick={() =>
                        document.getElementById("profile-upload").click()
                      }
                      className="profile-pic"
                      style={{ border: "1px solid black" }}
                    />

                    <br></br>
                    <h6>(Click Image To Change Picture)</h6>
                    {this.state.profilePicture.length > 0 &&
                    this.state.profilePicture.length < 300 ? (
                      <button
                        className="btn btn-danger mb-2"
                        onClick={() => this.removeImage()}
                      >
                        Remove
                      </button>
                    ) : null}

                    <br></br>

                    <center>
                      <div
                        style={{
                          width: "80%",
                          backgroundColor: "#4c3ee0",
                          borderRadius: "10px",
                        }}
                        className="p-2 text-light "
                      >
                        <div>
                          <h5>Name:</h5>

                          <input
                            value={this.state.name}
                            onChange={(e) =>
                              this.setState({
                                name: e.target.value.toLowerCase(),
                                isNameChanged: true,
                              })
                            }
                            type="text"
                            className="profile-input"
                          />
                        </div>
                        <br></br>
                        <div>
                          <h5>Description:</h5>

                          <textarea
                            value={this.state.description}
                            rows="2"
                            onChange={(e) =>
                              this.setState({
                                description: e.target.value,
                                isDescriptionChanged: true,
                              })
                            }
                            type="text"
                            className="profile-input"
                          />
                        </div>
                      </div>
                    </center>

                    <div className="mt-3">
                      <button
                        className="btn btn-primary"
                        onClick={() => this.setState({ showMore: true })}
                      >
                        More Settings
                      </button>
                    </div>

                    <div className="mt-1">
                      <button
                        className="btn btn-secondary m-1"
                        onClick={() => this.props.history.push("/chat")}
                      >
                        Back
                      </button>

                      <button
                        className="btn btn-success m-1"
                        onClick={() => {
                          this.uploadChanges();
                        }}
                      >
                        Save
                      </button>
                    </div>
                  </div>
                </center>
              ) : (
                <div className="p-3" style={{ backgroundColor: "white" }}>
                  <More
                    docId={this.state.docId}
                    blockUsersData={this.state.blockUsersData}
                  />
                  <center>
                    <button
                      className="btn btn-primary"
                      onClick={() => this.setState({ showMore: false })}
                    >
                      Back
                    </button>
                  </center>
                </div>
              )}
            </div>
          ) : (
            <center>
              <div
                className="shadow p-3 center"
                style={{ backgroundColor: "#E7E7E7" }}
              >
                <center>
                  <Loading type="bars" color="black" height={100} width={100} />
                </center>
                <h4>{this.state.progress}%</h4>
                <h3>Processing...</h3>
              </div>
            </center>
          )}
        </div>
      </div>
    );
  }
}
