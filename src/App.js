import React from 'react';
import './App.css';
import Game from './Game.js'

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <Game/>
      </header>
      <footer>
        Copyright {Date.year} Elijah Atkins
      </footer>
    </div>
  );
}

export default App;
