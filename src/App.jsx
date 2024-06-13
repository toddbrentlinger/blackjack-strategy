import GameComponent from './components/Game.jsx';
import Footer from './components/Footer.jsx';
import Game from './game/game.js';
import Icon from './assets/blackjack-strategy-icon.png';
import './App.scss';
import { useRef } from 'react';

function App() {
  const game = useRef(new Game(1));

  // Temp for comparing component state with game module logic
  window.game = game.current;
  
  return (
    <>
      <header>
        <img id='logo' src={Icon} alt='Blackjack Strategy app icon' width="20px" height="20px" />
        <h1>Blackjack Strategy</h1>
      </header>
      <main>
        <GameComponent game={game.current} />
      </main>
      <Footer initialYear={2024} sourceCodeUrl={'https://github.com/toddbrentlinger/blackjack-strategy'} />
    </>
  )
}

export default App;
