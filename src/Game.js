import React from "react";
import { Slider } from "rsuite";
import About from "./About.js";
import Cell from "./Cell.js";
import "rsuite/dist/styles/rsuite-dark.css";
import "./Game.css";

//Constant variables
const BORDER_SIZE = 10;

//Game component
class Game extends React.Component {
  //object constructor
  constructor() {
    super();
    //track Window size
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
    //make board
    this.board = this.makeEmptyBoard();
  }
  //state values storeing all variables that can change
  state = {
    cells: [],
    interval: 100,
    isRunning: false,
    popup: false,
    generation: 0,
    rand_factor: 0.25,
    frame_repeat: 0,
    //tracking width and height of window for responisve board
    width: window.innerWidth,
    height: window.innerHeight,
    //using largest possible values will dreduce with smaller window height and/or width
    cellSize: 20,
    boardWidth: 1002,
    boardHeight: 1002,
    maxRepeat: 300,
    boardCols: 49,
    boardRows: 49,
  };
  // Code to setup window width and height tracking
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
    const { width, height } = this.state;
    //handle width resize using if statements to configure board
    //size and css media query to place controls
    //mobile size 25x25 gameboard
    if (width <= 1225) {
      this.setState({
        cellSize: 16,
        boardWidth: 402,
        boardHeight: 402,
        boardRows: 24,
        boardCols: 24,
        maxRepeat: 100,
      });
      //tall board 36x50
    } else if (width <= 1800) {
      this.setState({
        cellSize: 20,
        boardWidth: 722,
        boardHeight: 1002,
        boardCols: 35,
        boardRows: 49,
        maxRepeat: 200,
      });
      //shorten height of game board to 36x36 if window doesn't have room for tall board
      if (height <= 1190) {
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
      if (height <= 1190) {
        this.setState({
          boardHeight: 722,
          boardRows: 35,
        });
      }
    }
    //regenerate empty board if function is called
    this.board = this.makeEmptyBoard();
  }
  // Create an empty board(all squares false)
  makeEmptyBoard() {
    const { boardRows, boardCols } = this.state;
    let board = [];
    for (let y = 0; y < boardRows + 1; y++) {
      board[y] = [];
      for (let x = 0; x < boardCols + 1; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }
  // Create cells from this.board
  makeCells() {
    const { boardRows, boardCols } = this.state;
    let cells = [];
    for (let y = 0; y < boardRows + 1; y++) {
      for (let x = 0; x < boardCols + 1; x++) {
        if (this.board[y][x]) {
          cells.push({ y, x });
        }
      }
    }
    return cells;
  }

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
    const {
      generation,
      boardCols,
      boardRows,
      maxRepeat,
      frame_repeat,
      interval,
    } = this.state;
    //generation count
    this.setState({ generation: generation + 1 });
    //start with empty board array
    let newBoard = this.makeEmptyBoard();
    //search every Colum
    for (let y = 0; y < boardCols + 1; y++) {
      //search every Row
      for (let x = 0; x < boardRows + 1; x++) {
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
    //check board for changes in number of alive cells
    if (this.countAlive(newBoard) === this.countAlive(this.board)) {
      this.setState({ frame_repeat: frame_repeat + 1 });
      if (frame_repeat >= maxRepeat) {
        this.stopGame();
      }
    } else {
      //reset the frame repeat if a new number of alive cells show up
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
    }, interval);
  }
  //count neighbors a particular cell has
  calculateNeighbors(board, x, y) {
    const { boardCols, boardRows } = this.state;
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
      //wrap around logic
      //if x is less than zero wrap to far end
      if (x1 < 0) {
        x1 = boardCols;
      }
      if (y1 < 0) {
        y1 = boardRows;
      }
      if (x1 > boardCols) {
        x1 = 0;
      }
      if (y1 > boardRows) {
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
  //UI LOGIC
  //Run button
  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };
  //Stop Button
  stopGame = () => {
    this.setState({ isRunning: false, frame_repeat: 0 });
    if (this.timeoutHandler) {
      window.clearTimeout(this.timeoutHandler);
      this.timeoutHandler = null;
    }
  };
  //toggle cells on off with mouse click on grid
  handleClick = (event) => {
    const { isRunning, boardCols, boardRows, cellSize } = this.state;
    if (!isRunning) {
      const elemOffset = this.getElementOffset();
      const offsetX = event.clientX - elemOffset.x;
      const offsetY = event.clientY - elemOffset.y;
      const x = Math.floor(offsetX / cellSize);
      const y = Math.floor(offsetY / cellSize);
      if (x >= 0 && x <= boardCols && y >= 0 && y <= boardRows) {
        this.board[y][x] = !this.board[y][x];
      }
      this.setState({ cells: this.makeCells() });
    }
  };
  //set refresh rate in miliseconds
  handleIntervalChange = (event) => {
    this.setState({ interval: event });
  };
  //set density ratio (value between 0.0 and 1.0)
  handleRandIntervalChange = (event) => {
    //use Math.round to only show 2 decimal places at most
    let rounded = Math.round(event * 100) / 100;
    this.setState({ rand_factor: rounded });
  };
  //Clear Button
  handleClear = () => {
    this.setState({ generation: 0, frame_repeat: 0 });
    this.board = this.makeEmptyBoard();
    this.stopGame();
    this.setState({ cells: this.makeCells() });
  };
  //Seed Button
  handleRandom = () => {
    const { rand_factor, boardRows, boardCols } = this.state;
    this.stopGame();
    this.setState({ generation: 0, frame_repeat: 0 });
    let filled = rand_factor;
    for (let y = 0; y < boardRows + 1; y++) {
      for (let x = 0; x < boardCols + 1; x++) {
        this.board[y][x] = Math.random() <= filled;
      }
    }

    this.setState({ cells: this.makeCells() });
  };
  //control for about popup
  togglePop = () => {
    this.setState({
      seen: !this.state.seen,
    });
  };
  //React Page content
  render() {
    const {
      cells,
      isRunning,
      generation,
      cellSize,
      boardWidth,
      boardHeight,
      seen,
      interval,
      rand_factor,
    } = this.state;
    return (
      <div className="conways-container">
        <div>
          <h1 onClick={this.togglePop}>Conway's Game of Life </h1> Generation{" "}
          {generation}
          {seen ? <About toggle={this.togglePop} /> : null}
          <div
            className="Board"
            style={{
              width: boardWidth + BORDER_SIZE,
              height: boardHeight + BORDER_SIZE,
              backgroundSize: `${cellSize}px ${cellSize}px`,
            }}
            onClick={this.handleClick}
            ref={(n) => {
              this.boardRef = n;
            }}
          >
            {cells.map((cell) => (
              <Cell
                cellSize={cellSize}
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
            value={interval}
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
            value={rand_factor}
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
