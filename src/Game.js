import React from "react";
import { Slider } from "rsuite";
import About from "./About.js";
import Cell from "./Cell.js";
import "rsuite/dist/styles/rsuite-dark.css";
import "./Game.css";

const BORDER_SIZE = 10;

//making gameboard size responsive
//All of these variables are no longer constante and manged in state
//const CELL_SIZE = 20; //20 for 25 cells
//const WIDTH = 722; // 500 is 25 cells
//const HEIGHT = 722; // 25 cells
//const MAX_REPEAT = 200;
//const COLS = 35;
//const ROWS = 35;

//Create cell at x,y cordinate,

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
    cellSize: 20, 
    boardWidth: 1002, 
    boardHeight: 1002, 
    maxRepeat: 300,
    boardCols: 49,
    boardRows: 49,
  };
  // Code to track window width and height to make
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }
  // Create an empty board
  makeEmptyBoard() {
    let board = [];
    for (let y = 0; y < this.state.boardRows + 1; y++) {
      board[y] = [];
      for (let x = 0; x < this.state.boardCols + 1; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    this.handleClear();

    //handle width resize using if statements to configure board
    //size and css media query to place controls
    //mobile size 25x25 gameboard
    if (this.state.width <= 1225) {
      this.setState({
        cellSize: 16,
        boardWidth: 402,
        boardHeight: 402,
        boardRows: 24,
        boardCols: 24,
        maxRepeat: 100,
      });
      //tall board 36x50
    } else if (this.state.width <= 1800) {
      this.setState({
        cellSize: 20,
        boardWidth: 722,
        boardHeight: 1002,
        boardCols: 35,
        boardRows: 49,
        maxRepeat: 200,
      });
      //shorten height of game board to 36x36 if window doesn't have room for tall board
      if (this.state.height <= 1190) {
        this.setState({
          boardHeight: 722,
          boardRows: 35,
        });
      }
    } else {
      //large board 50x50
      this.setState({
        cellSize: 20,
        boardWidth: 1002,
        boardHeight: 1002,
        boardRows: 49,
        boardCols: 49,
        maxRepeat: 200,
      });

      //shorten height to 50x36 if window doesn't have room for full board
      if (this.state.height <= 1190) {
        this.setState({
          boardHeight: 722,
          boardRows: 35,
        });
      }
    }
    //regenerate empty board if function is called
    this.board = this.makeEmptyBoard();
  }

  // Create cells from this.board
  makeCells() {
    let cells = [];
    for (let y = 0; y < this.state.boardRows + 1; y++) {
      for (let x = 0; x < this.state.boardCols + 1; x++) {
        if (this.board[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }

  //UI LOGIC
  //Run/Stop button
  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };

  stopGame = () => {
    this.setState({ isRunning: false, frame_repeat: 0 });
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
    //search every Colum
    for (let y = 0; y < this.state.boardCols + 1; y++) {
      //search every Row
      for (let x = 0; x < this.state.boardRows + 1; x++) {
        //Check number of neighbors
        let neighbors = this.calculateNeighbors(this.board, y, x);
        //check living cells(values set as true)
        if (this.board[x][y]) {
          //if a cell has two or three neighbors it can stay alive
          if (neighbors === 2 || neighbors === 3) {
            newBoard[x][y] = true;
            //if cell does not have 2 or 3 neighbors it dies
          } else {
            newBoard[x][y] = false;
          }
        } else {
          //if a space is empty and has three neighbors it comes alive
          if (!this.board[x][y] && neighbors === 3) {
            newBoard[x][y] = true;
          }
        }
      }
    }
    //check board for changes
    if (this.countAlive(newBoard) === this.countAlive(this.board)) {
      this.setState({ frame_repeat: this.state.frame_repeat + 1 });
      if (this.state.frame_repeat >= this.state.maxRepeat) {
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
        x1 = this.state.boardCols;
      }
      if (y1 < 0) {
        y1 = this.state.boardRows;
      }
      if (x1 > this.state.boardCols) {
        x1 = 0;
      }
      if (y1 > this.state.boardRows) {
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
      const x = Math.floor(offsetX / this.state.cellSize);
      const y = Math.floor(offsetY / this.state.cellSize);
      if (
        x >= 0 &&
        x <= this.state.boardCols &&
        y >= 0 &&
        y <= this.state.boardRows
      ) {
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
    for (let y = 0; y < this.state.boardRows + 1; y++) {
      for (let x = 0; x < this.state.boardCols + 1; x++) {
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
              width: this.state.boardWidth + BORDER_SIZE,
              height: this.state.boardHeight + BORDER_SIZE,
              backgroundSize: `${this.state.cellSize}px ${this.state.cellSize}px`,
            }}
            onClick={this.handleClick}
            ref={(n) => {
              this.boardRef = n;
            }}
          >
            {cells.map((cell) => (
              <Cell
                cellSize={this.state.cellSize}
                x={cell.x}
                y={cell.y}
                key={`${cell.x},${cell.y}`}
              />
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
