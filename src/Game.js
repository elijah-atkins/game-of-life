import React from "react";
import { Slider } from "rsuite";
import About from "./About.js";
import Cell from "./Cell.js";
import "rsuite/dist/styles/rsuite-dark.css";
import "./Game.css";
import SettingsIcon from "./SettingsIcon.js";

//Constant variables
//2 times boarder-width of 5 plus 2px for grid line is 12
const BORDER_SIZE = 11;

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
    showOptions: false,
    generation: 0,
    rand_factor: 0.25,
    cell_count_repeat: 0,
    //tracking width and height of window for responisve board
    width: window.innerWidth,
    height: window.innerHeight,
    //set cellsize to 12 if window is initially under 1000 set to 20 if greater
    cellSize: window.innerWidth > 1000 ? 20 : 12,
    //number of times to continue if the number of alive cells doesn't change
    maxRepeat: 300,
    //grid number of Cols and Rows calculated dynamicly default 99x99 for max board size of 100x100
    boardCols: 99,
    boardRows: 99,
  };
  // Code to setup window width and height tracking
  componentDidMount() {
    this.updateWindowDimensions();
    window.addEventListener("resize", this.updateWindowDimensions);
  }

  componentWillUnmount() {
    window.removeEventListener("resize", this.updateWindowDimensions);
  }
  
  getElementOffset() {
    const rect = this.boardRef.getBoundingClientRect();
    const doc = document.documentElement;
    return {
      x: rect.left + window.pageXOffset - doc.clientLeft,
      y: rect.top + window.pageYOffset - doc.clientTop,
    };
  }

  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
    //set new board size based on new width and height and run clear to generate new empty board
    //made setboard an async app so updated board size is loaded into state before...
    this.setBoardSize().then(() => {
      //... call resizeBoard and fit live configuration on new board
      this.board = this.resizeBoard();
      //redraw the results of resizeBoard onto the resized grid
      this.setState({ cells: this.makeCells() });
    });
  }
  //set board size
  async setBoardSize() {
    const { width, height, cellSize } = this.state;

    this.setState({
      //set the number of times the simulation will play before pausing
      maxRepeat: Math.round(width / (cellSize * 0.25) / 25) * 100 - 1,
      //limiting rows and columns for performance. better algorithm could support more --removing cell counting code might help
      //make sure game has at least one column and no more than 100
      boardCols: Math.min(
        Math.max(Math.round((height - (200 + cellSize)) / cellSize), 0),
        99
      ),
      //make sure game has no more than 100 rows
      boardRows: Math.min(
        Math.round((width - 40 - cellSize * 2) / cellSize),
        99
      ),
    });
  }
  // Create an empty board(all squares false)
  makeEmptyBoard() {
    const { boardRows, boardCols } = this.state;
    let board = [];
    for (let y = 0; y < boardCols + 1; y++) {
      board[y] = [];
      for (let x = 0; x < boardRows + 1; x++) {
        board[y][x] = false;
      }
    }
    return board;
  }

  //This is the code that loads as much of the current board as it can fit into the new board after a screen resize
  resizeBoard() {
    const { boardRows, boardCols } = this.state;
    //make a new empty board based off current Rows and Cols drawn onscreen
    let newBoard = this.makeEmptyBoard();
    //don't bother if it's an empty board
    if (this.countAlive(this.board) !== 0) {
      //cycle through every column in the new board
      for (let colID = 0; colID < boardCols + 1; colID++) {
        //don't bother if the old board doesn't have the current column
        if (this.board[colID] !== undefined) {
          //cycle through every row in the current column
          for (let rowID = 0; rowID < boardRows + 1; rowID++) {
            //don't bother if the old board doesn't have the current row
            if (this.board[colID][rowID] !== undefined) {
              //put the cell value for the current [column][row] value
              newBoard[colID][rowID] = this.board[colID][rowID];
            }
          }
        }
      }
    }
    return newBoard;
  }
  // Read this.board matrix and populate cells array with x,y cordinates for live cells
  makeCells() {
    const { boardRows, boardCols } = this.state;
    let cells = [];
    for (let y = 0; y < boardCols + 1; y++) {
      for (let x = 0; x < boardRows + 1; x++) {
        if (this.board[y][x]) {
          cells.push({ x, y });
        }
      }
    }
    return cells;
  }
  //count live cells on a board
  countAlive = (board) => {
    let count = 0;
    for (var i = 0; i < board.length; i++) {
      count += board[i].filter(Boolean).length;
    }
    return count;
  };
  //see if board submited is the same as the current board
  checkBoard = (board) => {
    //using stringify to check submited board and current board
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
      cell_count_repeat,
      interval,
    } = this.state;
    //generation count
    this.setState({ generation: generation + 1 });
    //start with empty board matrix
    let newBoard = this.makeEmptyBoard();
    //search every Colum
    for (let y = 0; y < boardCols + 1; y++) {
      //search every Row
      for (let x = 0; x < boardRows + 1; x++) {
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
    //check board for changes in number of alive cells
    if (this.countAlive(newBoard) === this.countAlive(this.board)) {
      //Stop the simulation if new generated board is the same as the last generated board
      if (this.checkBoard(newBoard)) {
        this.stopGame();
      }
      //add to invisible cell_count_repeat tally
      this.setState({ cell_count_repeat: cell_count_repeat + 1 });
      //pause game if the number of live cells doesn't change in several hundred generations
      if (cell_count_repeat >= maxRepeat) {
        this.stopGame();
      }
    } else {
      //reset the cell count repeat if a new number of alive cells show up
      this.setState({ cell_count_repeat: 0 });
    }
    //load calculated board into current board
    this.board = newBoard;
    //redraw new tick
    this.setState({ cells: this.makeCells() });
    //Code to set refresh rate
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
    //neighbor tally
    let neighbors = 0;
    //y,x cordinates of each cell to check add z cordinates to expand to 3d
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
      let y_toCheck = y + dir[0];
      let x_toCheck = x + dir[1];
      //wrap around logic
      //if x is less than zero wrap to last row
      if (x_toCheck < 0) {
        x_toCheck = boardRows;
      }
      //if y is less than zero wrap to last column
      if (y_toCheck < 0) {
        y_toCheck = boardCols;
      }
      //if x is higher than last row wrap to zero
      if (x_toCheck > boardRows) {
        x_toCheck = 0;
      }
      //if y is higher than last column wrap to zero
      if (y_toCheck > boardCols) {
        y_toCheck = 0;
      }
      //if the neigbor at [y][x] cordinate is alive add to neighbor tally
      if (board[y_toCheck][x_toCheck]) {
        neighbors++;
      }
    }

    return neighbors;
  }


  //UI LOGIC
  //Run button
  runGame = () => {
    this.setState({ isRunning: true });
    this.runIteration();
  };
  //Stop Button
  stopGame = () => {
    this.setState({ isRunning: false, cell_count_repeat: 0 });
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
      if (x >= 0 && x <= boardRows && y >= 0 && y <= boardCols) {
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
  //set cell size
  handleCellSizeChange = (event) => {
    this.setState({ cellSize: event });
  };
  //Clear Button
  handleClear = () => {
    this.setState({ generation: 0, cell_count_repeat: 0 });
    this.board = this.makeEmptyBoard();
    this.stopGame();
    this.setState({ cells: this.makeCells() });
  };
  handleResize = () => {
    this.updateWindowDimensions();
    this.makeEmptyBoard();
  };
  //Seed Button
  handleRandom = () => {
    const { rand_factor, boardRows, boardCols } = this.state;
    this.stopGame();
    this.setState({ generation: 0, cell_count_repeat: 0 });
    let filled = rand_factor;
    for (let y = 0; y < boardCols + 1; y++) {
      for (let x = 0; x < boardRows + 1; x++) {
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
  toggleOptions = () => {
    this.setState({
      showOptions: !this.state.showOptions,
    });
  };
  //React Page content
  render() {
    const {
      cells,
      isRunning,
      generation,
      cellSize,
      boardRows,
      boardCols,
      seen,
      interval,
      rand_factor,
      showOptions,
    } = this.state;
    return (
      <div className="conways-container">
        <div className={showOptions ? "show-options" : "options"}>
          <span className="close-options" onClick={this.toggleOptions}>
            ᐃ{" "}
          </span>
          Cell Size{" "}
          <Slider
            value={cellSize}
            min={10}
            max={60}
            progress
            onChange={(value) => {
              this.handleCellSizeChange(value);
            }}
          />
          <div className="fast-slow">
            <span className="start">Small </span>
            <span className="last">Big </span>
          </div>{" "}
          Refresh Frequency{" "}
          <Slider
            value={interval}
            step={10}
            min={20}
            max={1000}
            progress
            onChange={(value) => {
              this.handleIntervalChange(value);
            }}
          />
          <div className="fast-slow">
            <span className="start">Fast</span>
            <span className="last">Slow</span>
          </div>{" "}
          Population Density{" "}
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
          <button className="button" onClick={this.handleResize}>
            Redraw Board
          </button>
        </div>

        <div className="board-container">
          <span className="open" onClick={this.toggleOptions}>
            <SettingsIcon />
          </span>
          <span className="open-about" alt="about" onClick={this.togglePop}>
            <p>?</p>
          </span>
          <h1>Conway's Game of Life </h1>
          <div className="controls">
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
          <About toggle={this.togglePop} seen={seen} />

          <div className="topper">
            <span className="generation">Generation: {generation}</span>
            <span className="grid-size">
              Grid Size {boardRows + 1} by {boardCols + 1}
            </span>
            <br></br>
          </div>
          <div className="Board-container">
            <div
              className="Board"
              style={{
                width: (boardRows + 1) * cellSize + BORDER_SIZE,
                height: (boardCols + 1) * cellSize + BORDER_SIZE,
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
        </div>
      </div>
    );
  }
}

export default Game;
