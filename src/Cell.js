import React from "react";

class Cell extends React.Component {
  render() {
    const { x, y, cellSize } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${cellSize * x + 1}px`,
          top: `${cellSize * y + 1}px`,
          width: `${cellSize - 1}px`,
          height: `${cellSize - 1}px`,
        }}
      />
    );
  }
}
export default Cell;
