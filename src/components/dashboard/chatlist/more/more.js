import React, { Component } from "react";

import "./more.css";

export default class more extends Component {
  render() {
    return (
      <div className="more shadow">
        <div>
          <h3>More</h3>
        </div>

        <div className="mt-2">
          <div
            className="option-list"
            onClick={() => this.props.moreOptions("delete")}
          >
            Delete
          </div>

          <div
            className="option-list"
            onClick={() => this.props.moreOptions("cancel")}
          >
            Cancel
          </div>
        </div>
      </div>
    );
  }
}
