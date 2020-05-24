import React, { Component } from "react";

import { firestore } from "../../../firebase/firebase";

export default class more extends Component {
  unBlockUser = async (index, name) => {
    const { docId } = this.props;
    const userArray = [];
    const confirm = window.confirm(`Are You Sure To Block ${name}`);

    if (confirm) {
      this.props.blockUsersData.filter((ob, i) => {
        if (i !== index) {
          userArray.push(ob.email);
        }
      });

      await firestore
        .collection("users")
        .doc(docId)
        .update({
          blocklist: userArray,
        })
        .then(() => {
          alert(`${name} Is Successfully Unblocked`);
        });
    }
  };

  render() {
    const { blockUsersData } = this.props;
    return (
      <div className="p-3">
        <center>
          <h4>Blocked Account List</h4>

          {blockUsersData.length > 0 ? (
            blockUsersData.map((obj, index) => (
              <div
                key={index}
                className="chat-list p-2 text-light mt-2"
                style={{ backgroundColor: "#6b34c9", borderRadius: "20px" }}
              >
                <img
                  src={obj.URL}
                  className="chat-list-img mr-3"
                  style={{ border: "1px solid white" }}
                />
                <h4>{obj.name}</h4>

                <button
                  onClick={() => this.unBlockUser(index, obj.name)}
                  className="btn btn-light"
                  style={{ marginLeft: "auto" }}
                >
                  Unblock
                </button>
              </div>
            ))
          ) : (
            <div>
              <h5>No Record Found</h5>
            </div>
          )}
        </center>
      </div>
    );
  }
}
