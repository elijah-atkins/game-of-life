import React from 'react';
import './App.css';
import Game from './Game.js'

function App() {
  const nowDate = new Date()
  return (
    <div className="App">
      <header className="App-header">
        <Game/>
      </header>
      <footer className="footer">
        Copyright {nowDate.getFullYear()} Elijah Atkins
      </footer>
    </div>
  );
}

export default App;
