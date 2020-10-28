import React from "react";
import "./App.css";
import Game from "./Game.js";

function App() {
  const nowDate = new Date();
  return (
    <div className="App">
      <header className="App-header">
        <Game />
      </header>
      <footer className="footer">
        Copyright © {nowDate.getFullYear()}{" "}
        <a
          href="https://elijahatkins.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          Elijah Atkins
        </a>
      </footer>
    </div>
  );
}

export default App;
