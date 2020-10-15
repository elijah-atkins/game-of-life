import React from "react";
import { Slider } from "rsuite";
import "rsuite/dist/styles/rsuite-dark.css";
import "./Game.css";

const CELL_SIZE = 15; //20 for 25 cells
const WIDTH = 372; // 500 is 25 cells
const HEIGHT = 372; // 25 cells
const MAX_REPEAT = 16;
const BORDER_SIZE = 11;

//Create cell at x,y cordinate,
//component inside game.js to use constant CELL_SIZE
class Cell extends React.Component {
  render() {
    const { x, y } = this.props;
    return (
      <div
        className="Cell"
        style={{
          left: `${CELL_SIZE * x + 1}px`,
          top: `${CELL_SIZE * y + 1}px`,
          width: `${CELL_SIZE - 1}px`,
          height: `${CELL_SIZE - 1}px`,
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
    //subtract one so number of rows match array ID number
    this.rows = HEIGHT / CELL_SIZE - 1;
    this.cols = WIDTH / CELL_SIZE - 1;
    this.board = this.makeEmptyBoard();
  }
  //state values
  state = {
    cells: [],
    interval: 100,
    isRunning: false,
    generation: 0,
    rand_factor: 0.25,
    frame_repeat: 0,
  };
  // Create an empty board
  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < this.rows; y++) {
      board[y] = [];
      for (let x = 0; x < this.cols; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }
  // Create cells from this.board
  makeCells() {
    let cells = [];
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
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
    for (let y = 0; y < this.rows; y++) {
      //search every colum
      for (let x = 0; x < this.cols; x++) {
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

      if (
        x1 >= 0 &&
        x1 < this.cols &&
        y1 >= 0 &&
        y1 < this.rows &&
        board[y1][x1]
      ) {
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
      if (x >= 0 && x <= this.cols && y >= 0 && y <= this.rows) {
        this.board[y][x] = !this.board[y][x];
      }
      this.setState({ cells: this.makeCells() });
    }
  };
  handleIntervalChange = (event) => {
    this.setState({ interval: event });
  };
  handleRandIntervalChange = (event) => {
    this.setState({ rand_factor: event });
  };
  handleClear = () => {
    this.setState({ generation: 0 });
    this.board = this.makeEmptyBoard();
    this.stopGame();
    this.setState({ cells: this.makeCells() });
  };
  handleRandom = () => {
    this.setState({ generation: 0 });
    let filled = this.state.rand_factor;
    for (let y = 0; y < this.rows; y++) {
      for (let x = 0; x < this.cols; x++) {
        this.board[y][x] = Math.random() <= filled;
      }
    }

    this.setState({ cells: this.makeCells() });
  };

  //React Page content
  render() {
    const { cells, isRunning, generation } = this.state;
    return (
      <div>
        {" "}
        <h1>Conway's Game of Life </h1> Generation {generation}
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
        <div className="controls">
          {" "}
          Animation Speed (ms){" "}
          <Slider
            value={this.state.interval}
            min={10}
            max={1000}
            progress
            onChange={(value) => {
              this.handleIntervalChange(value);
            }}
          />
          <br></br>Population Size{" "}
          <Slider
            value={this.state.rand_factor}
            min={0.0}
            max={1.0}
            step={0.01}
            progress
            onChange={(value) => {
              this.handleRandIntervalChange(value);
            }}
          />
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
            Populate
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
