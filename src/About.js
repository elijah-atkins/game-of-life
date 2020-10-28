import React from "react";
import "./About.css";

class About extends React.Component {
  handleClick = () => {
    this.props.toggle();
  };
  render() {
    return (
      <div>
        <span className="close" onClick={this.handleClick}>
         <p> &times;{" "}</p>
        </span>
        <div className="about">
          <div className="about-section">
            <h3 className="toph3">About:</h3>
            <p>
              {" "}
              Conway's Game of Life is a zero-player game. Interact with the
              Game of Life by creating an initial configuration and observing
              how it evolves!
            </p>
            <a
              className="wiki"
              href="https://en.wikipedia.org/wiki/Conway%27s_Game_of_Life#Examples_of_patterns"
              target="_blank"
              rel="noopener noreferrer"
            >
              Learn more at Wikipedia
            </a>

          </div>
          <div className="about-section">
            <h3>Rules:</h3>
            <ol>
              <li>Any live cell with two or three live neighbours survives.</li>
              <li>
                Any dead cell with exactly three live neighbours becomes a live
                cell.
              </li>
              <li>
                All other live cells die in the next generation. (Similarly, all
                other dead cells stay dead.)
              </li>
            </ol>
          </div>
          <div className="about-section">
            <h3>Instructions:</h3>
            <p>
              This is a responsive web app resize the window and the board will expand up to 100 x 100 cells.
            </p>
            <p>
              Tap or click grid cells to toggle cells between live and dead.
            </p>
            <p>Click Clear to reset the board</p>
            <p>Click Seed to reset the board and add random population of live cells</p>
            <p>Click Run to start simulation</p>
            <p>Click Stop to pause simulation(only available if running)</p>
            <p>Click the settings icon to access game controls.</p>
            <p>Use the Cell Size slider to adjust the size of the board, or to zoom in to setup a configuration</p>

            <p>Use Refresh Frequency (ms) slider to control playback speed</p>
            <p>
              Use Population Density slider to set cell density generated by
              Seed
            </p>

          </div>

        </div>

      </div>
    );
  }
}

export default About;
