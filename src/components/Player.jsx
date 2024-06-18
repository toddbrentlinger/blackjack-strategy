import { useState } from "react";
import { GameState } from "../game/game";
import Hand from "./Hand";
import "./Player.scss";

/** React component for single Player instance. */
function Player({ playerObj, gameState, handleBet }) {
    /** Amount of bet for current round of blackjack. */
    const [bet, setBet] = useState(null);

    /**
     * Event handler for Player bet form submit event.
     * @param {Event} e 
     */
    const handleBetFormSubmit = function(e) {
        e.preventDefault();

        // Convert bet value from string type in form to number type 
        const newBet = Number(e.currentTarget.elements.bet.value);

        // Pass Player instance AND bet amount into handleBet method from props
        handleBet(playerObj.player, newBet);

        setBet(newBet);
    };

    /**
     * Returns ReactElement of form to place bet for next Hand.
     * @returns {React.ReactElement}
     */
    const renderBetForm = function() {
        return (
            <form onSubmit={handleBetFormSubmit} action="" method="post">
                <label>
                    Bet:
                    <input type="number" name="bet" autoFocus={true} />
                </label>
                <button>Place Bet</button>
            </form>
        );
    };

    /**
     * Returns ReactElement that displays info about the Player
     * @returns {React.ReactElement}
     */
    const renderPlayerInfo = function() {
        return (
            <div className="player-info">
                <span className="player-name">{playerObj.name}</span>
                <span className="player-bankroll">Bankroll: {playerObj.bankroll}</span>
            </div>
        );
    };

    /**
     * Returns ReactElement of Player.
     * @returns {React.ReactElement}
     */
    const renderPlayer = function() {
        switch(gameState) {
            case GameState.Preparing:
                return (
                    <section className="player">
                        {renderPlayerInfo()}
                        {(bet === null) ? renderBetForm() : <div>Bet: <span>{bet}</span></div>}
                    </section>
                );
            case GameState.Dealing:
            case GameState.PlayerPlaying:
            case GameState.DealerPlaying:
                return (
                    <section className="player">
                        {renderPlayerInfo()}
                        {(playerObj.hands.length === 0) ? null : <Hand handObj={playerObj.hands[0]} />}
                    </section>
                );
            case GameState.Ending:
                return;
            default:
                return;
        }
    };

    return renderPlayer();
}

export default Player;
