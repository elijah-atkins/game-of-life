import React from 'react';

class Cell extends React.Component {
    render() {
      const { x, y, cellSize } = this.props;
      return (
        <div
          className="Cell"
          style={{
            left: `${cellSize * x + 2}px`,
            top: `${cellSize * y + 2}px`,
            width: `${cellSize - 2}px`,
            height: `${cellSize - 2}px`,
          }}
        />
      );
    }
  }
  export default Cell