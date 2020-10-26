import React from "react";
import Cog from "./images/cog.svg";

class SettingsIcon extends React.Component {
  render() {
    return (
      <img
        src={Cog}
        alt="Settings"
        className="settings-icon"
        style={{
            color:"red",
          display: "block",
          margin: ".5rem",
        }}
      />
    );
  }
}
export default SettingsIcon;
