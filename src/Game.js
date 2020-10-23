import React from "react";
import { Slider } from "rsuite";
import About from "./About.js";
import "rsuite/dist/styles/rsuite-dark.css";
import "./Game.css";

var CELL_SIZE = 20; //20 for 25 cells
var WIDTH = 722; // 500 is 25 cells
var HEIGHT = 722; // 25 cells
var MAX_REPEAT = 200;
var BORDER_SIZE = 10;
var COLS = 35;
var ROWS = 35;

//Create cell at x,y cordinate,
//component inside game.js to use constant CELL_SIZE
class Cell extends React.Component {
  render() {
    const { x, y } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELL_SIZE * x + 2}px`,
          top: `${CELL_SIZE * y + 2}px`,
          width: `${CELL_SIZE - 2}px`,
          height: `${CELL_SIZE - 2}px`,
        }}
      />
    );
  }
}

//Game component
class Game extends React.Component {
  //object constructor
  constructor() {
    super();
    //track Window size
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    this.board = this.makeEmptyBoard();
  }
  //state values
  state = {
    cells: [],
    interval: 100,
    isRunning: false,
    popup: false,
    generation: 0,
    rand_factor: 0.25,
    frame_repeat: 0,
    width: window.innerWidth,
    height: window.innerHeight,
  };
  // Code to track window width and height to make
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    this.handleClear();

    //handle width resize
    if (this.state.width <= 1225) {
      CELL_SIZE = 16;
      WIDTH = 402;
      MAX_REPEAT = 100;
      COLS = 24;
      HEIGHT = 402;
      ROWS = 24;
    } else if (this.state.width <= 1800) {
      CELL_SIZE = 20;
      WIDTH = 722;
      MAX_REPEAT = 200;
      COLS = 35;
      HEIGHT = 1002;
      ROWS = 49;

      //handle height resize
      if (this.state.height <= 1190) {
        HEIGHT = 722;
        ROWS = 35;
      }
    } else {
      CELL_SIZE = 20;
      WIDTH = 1002;
      HEIGHT = 1002;
      MAX_REPEAT = 300;
      COLS = 49;
      ROWS = 49;
      //handle height resize
      if (this.state.height <= 1190) {
        HEIGHT = 722;
        ROWS = 35;
      }
    }
    this.board = this.makeEmptyBoard();
  }

  // Create an empty board
  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < ROWS + 1; y++) {
      board[y] = [];
      for (let x = 0; x < COLS + 1; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }
  // Create cells from this.board
  makeCells() {
    let cells = [];
    for (let y = 0; y < ROWS + 1; y++) {
      for (let x = 0; x < COLS + 1; x++) {
        if (this.board[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }
  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };
  stopGame = () => {
    this.setState({ isRunning: false });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };
  countAlive = (board) => {
    let count = 0;
    for (var i = 0; i < board.length; i++) {
      count += board[i].filter(Boolean).length;
    }
    return count;
  };
  checkBoard = (board) => {
    if (JSON.stringify(board) === JSON.stringify(this.board)) {
      return true;
    }
    return false;
  };
  //game logic
  runIteration() {
    //generation count
    this.setState({ generation: this.state.generation + 1 });
    //start with empty board array
    let newBoard = this.makeEmptyBoard();
    //search every row
    for (let y = 0; y < ROWS + 1; y++) {
      //search every colum
      for (let x = 0; x < COLS + 1; x++) {
        //Check number of neighbors
        let neighbors = this.calculateNeighbors(this.board, x, y);
        //check living cells(values set as true)
        if (this.board[y][x]) {
          //if a cell has two or three neighbors it can stay alive
          if (neighbors === 2 || neighbors === 3) {
            newBoard[y][x] = true;
            //if cell does not have 2 or 3 neighbors it dies
          } else {
            newBoard[y][x] = false;
          }
        } else {
          //if a space is empty and has three neighbors it comes alive
          if (!this.board[y][x] && neighbors === 3) {
            newBoard[y][x] = true;
          }
        }
      }
    }
    //check board for changes
    if (this.countAlive(newBoard) === this.countAlive(this.board)) {
      this.setState({ frame_repeat: this.state.frame_repeat + 1 });
      if (this.state.frame_repeat >= MAX_REPEAT) {
        this.stopGame();
      }
    } else {
      this.setState({ frame_repeat: 0 });
    }
    //Stop the simulation if new generated board is the same as the last generated board
    if (this.checkBoard(newBoard)) {
      this.stopGame();
    }

    this.board = newBoard;
    this.setState({ cells: this.makeCells() });
    this.timeoutHandler = window.setTimeout(() => {
      //don't run simulation if isRunning is false
      if (this.state.isRunning) {
        this.runIteration();
      }
    }, this.state.interval);
  }
  //count neighbors a particular cell has
  calculateNeighbors(board, x, y) {
    let neighbors = 0;
    //x,y cordinates of each cell to check
    const dirs = [
      [-1, -1],
      [-1, 0],
      [-1, 1],
      [0, 1],
      [1, 1],
      [1, 0],
      [1, -1],
      [0, -1],
    ];
    for (let i = 0; i < 8; i++) {
      const dir = dirs[i];
      let y1 = y + dir[0];
      let x1 = x + dir[1];
      if (x1 < 0) {
        x1 = COLS;
      }
      if (y1 < 0) {
        y1 = ROWS;
      }
      if (x1 > COLS) {
        x1 = 0;
      }
      if (y1 > ROWS) {
        y1 = 0;
      }
      if (board[y1][x1]) {
        neighbors++;
      }
    }

    return neighbors;
  }
  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  }
  handleClick = (event) => {
    if (!this.state.isRunning) {
      const elemOffset = this.getElementOffset();
      const offsetX = event.clientX - elemOffset.x;
      const offsetY = event.clientY - elemOffset.y;
      const x = Math.floor(offsetX / CELL_SIZE);
      const y = Math.floor(offsetY / CELL_SIZE);
      if (x >= 0 && x <= COLS && y >= 0 && y <= ROWS) {
        this.board[y][x] = !this.board[y][x];
      }
      this.setState({ cells: this.makeCells() });
    }
  };
  handleIntervalChange = (event) => {
    this.setState({ interval: event });
  };
  handleRandIntervalChange = (event) => {
    let rounded = Math.round(event * 100) / 100;
    this.setState({ rand_factor: rounded });
  };
  handleClear = () => {
    this.setState({ generation: 0 });
    this.setState({ frame_repeat: 0 });
    this.board = this.makeEmptyBoard();
    this.stopGame();
    this.setState({ cells: this.makeCells() });
  };
  handleRandom = () => {
    this.stopGame();
    this.setState({ generation: 0 });
    this.setState({ frame_repeat: 0 });

    let filled = this.state.rand_factor;
    for (let y = 0; y < ROWS + 1; y++) {
      for (let x = 0; x < COLS + 1; x++) {
        this.board[y][x] = Math.random() <= filled;
      }
    }

    this.setState({ cells: this.makeCells() });
  };
  togglePop = () => {
    this.setState({
      seen: !this.state.seen,
    });
  };
  //React Page content
  render() {
    const { cells, isRunning, generation } = this.state;
    return (
      <div className="conways-container">
        <div>
          <h1 onClick={this.togglePop}>Conway's Game of Life </h1> Generation{" "}
          {generation}
          {this.state.seen ? <About toggle={this.togglePop} /> : null}
          <div
            className="Board"
            style={{
              width: WIDTH + BORDER_SIZE,
              height: HEIGHT + BORDER_SIZE,
              backgroundSize: `${CELL_SIZE}px ${CELL_SIZE}px`,
            }}
            onClick={this.handleClick}
            ref={(n) => {
              this.boardRef = n;
            }}
          >
            {cells.map((cell) => (
              <Cell x={cell.x} y={cell.y} key={`${cell.x},${cell.y}`} />
            ))}
          </div>
        </div>
        <div className="controls">
          {" "}
          Refresh Frequency (ms){" "}
          <Slider
            value={this.state.interval}
            step={10}
            min={10}
            max={1000}
            progress
            onChange={(value) => {
              this.handleIntervalChange(value);
            }}
          />
          <div className="fast-slow">
            <span className="start">Fast</span>
            <span className="last">Slow</span>
          </div>
          <br></br>Population Density{" "}
          <Slider
            value={this.state.rand_factor}
            min={0.05}
            max={0.75}
            step={0.01}
            progress
            onChange={(value) => {
              this.handleRandIntervalChange(value);
            }}
          />
          <div className="fast-slow">
            <span className="start">Low </span>
            <span className="last">High </span>
          </div>
          <br></br>
          {isRunning ? (
            <button className="button" onClick={this.stopGame}>
              Stop
            </button>
          ) : (
            <button className="button" onClick={this.runGame}>
              Run
            </button>
          )}
          <button className="button" onClick={this.handleRandom}>
            Seed
          </button>
          <button className="button" onClick={this.handleClear}>
            Clear
          </button>
        </div>
      </div>
    );
  }
}

export default Game;
