import React, { Component } from "react";

import "./moredialogbox.css";

export default class moredialogbox extends Component {
  render() {
    return (
      <div className="more-dialog">
        <div>
          <h3>More</h3>
        </div>

        <div className="mt-2">
          <div
            className="options"
            onClick={() => this.props.moreOptions("unsend")}
          >
            Unsend
          </div>

          <div
            className="options"
            onClick={() => this.props.moreOptions("cancel")}
          >
            Cancel
          </div>
        </div>
      </div>
    );
  }
}
