import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'

import Player from './game/player.js'
import Game from './game/game.js';

let game = new Game();
window.game = game;
game.addPlayer(new Player('Todd', 1000));
game.addPlayer(new Player('Indiana Jones', 1000));
game.addPlayer(new Player('James Bond', 10000));
game.deal();
console.log(game.dealerHand.toString());
console.log(game.playerHands.map(hand => hand.toString()));

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
