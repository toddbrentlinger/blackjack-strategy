import { useEffect, useState } from "react";
import { GameState } from "../game/game";
import Hand from "./Hand";
import "./Player.scss";

/** Time to delay Player making another action. */
//const PLAYER_ACTION_DELAY = 1000;

/** React component for single Player instance. */
function Player({ playerObj, gameState, minBet, handleBet, handleHit, handleStand, handleDoubleDown, handleSplit, handleSurrender, handleStrategy, }) {
    /** Amount of bet for current round of blackjack. */
    const [bet, setBet] = useState(null);

    /** Reference to previous bet amount to populate bet form in next round. */
    //const previousBet = useRef(minBet);

    /** Reference to timeout used for Player component. */
    //const timeoutId = useRef(null);

    // Hooks - useEffect

    // Resets bet amount to null when game state changes to 'Preparing'
    useEffect(() => {
        if ((gameState === GameState.Preparing)) {
            setBet(null);
        }
    }, [gameState]);

    // Methods

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
     * Event handler for Player choosing to hit.
     * @param {Event} e 
     */
    const handleHitClick = function(e) {
        e.preventDefault();

        handleHit(playerObj.player);
    };

    /**
     * Event handler for Player choosing to stand.
     * @param {Event} e 
     */
    const handleStandClick = function(e) {
        e.preventDefault();

        handleStand(playerObj.player);
    };

    /**
     * Event handler for Player choosing to double down.
     * @param {Event} e 
     */
    const handleDoubleDownClick = function(e) {
        e.preventDefault();
        
        handleDoubleDown(playerObj.player);
    }

    /**
     * Event handler for Player choosing to split.
     * @param {Event} e 
     */
    const handleSplitClick = function(e) {
        e.preventDefault();

        handleSplit(playerObj.player);
    };

    /**
     * Event handler for Player choosing to surrender.
     * @param {Event} e 
     */
    const handleSurrenderClick = function(e) {
        e.preventDefault();

        handleSurrender(playerObj.player);
    };

    /**
     * Event handler for Player choosing to get suggested strategy.
     * @param {Event} e 
     */
    const handleStrategyClick = function(e) {
        e.preventDefault();

        handleStrategy(playerObj.player);
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
                    <input 
                        type="number" 
                        name="bet" 
                        min={minBet}
                        required
                        autoFocus={true} />
                </label>
                <button>Place Bet</button>
            </form>
        );
    };

    /**
     * Returns ReactElement that displays info about the Player.
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
     * Returns ReactElement that displays Player action options.
     * @returns {React.ReactElement}
     */
    const renderHandOptions = function() {
        const currentHand = playerObj.player.currentHand;

        return (
            <div className="player-options">
                <button onClick={handleHitClick}>Hit</button>
                <button onClick={handleStandClick}>Stand</button>
                {
                    (currentHand.cards.length === 2)
                        ? (<button onClick={handleDoubleDownClick}>Double Down</button>)
                        : null
                }
                {
                    playerObj.player.canSplit()
                     ? (<button onClick={handleSplitClick}>Split</button>)
                     : null
                }
                {
                    (currentHand.cards.length < 3)
                        ? (<button onClick={handleSurrenderClick}>Surrender</button>)
                        : null
                }
                <button onClick={handleStrategyClick}>Suggested Action</button>
            </div>
        );
    };

    /**
     * Returns ReactElement that displays all hands of the Player.
     * @returns {React.ReactElement|null}
     */
    const renderHands = function() {
        if (playerObj.hands.length === 0) { return null; }
        
        return playerObj.hands.map((handObj) => (
            <Hand key={handObj.hand.id} handObj={handObj} />
        ));
    };

    /**
     * Returns ReactElement of Player.
     * @returns {React.ReactElement|undefined}
     */
    const renderPlayer = function() {
        switch(gameState) {
            case GameState.Preparing:
                return (
                    <section className="player">
                        {renderPlayerInfo()}
                        {(bet === null) ? renderBetForm() : <div>Bet: <span>{bet}</span></div>}
                        <div className="hand"></div>
                    </section>
                );
            case GameState.Dealing:
            case GameState.DealerPlaying:
            case GameState.Ending:
                return (
                    <section className="player">
                        {renderPlayerInfo()}
                        {renderHands()}
                        {/* {(playerObj.hands.length === 0) ? null : <Hand handObj={playerObj.hands[0]} />} */}
                    </section>
                );
            case GameState.PlayerPlaying:
                return (
                    <section className="player">
                        {renderPlayerInfo()}
                        {renderHands()}
                        {/* {(playerObj.hands.length === 0) ? null : <Hand handObj={playerObj.hands[0]} />} */}
                        {playerObj.isPlayerTurn ? renderHandOptions() : null}
                    </section>
                );
            default:
                return;
        }
    };

    return renderPlayer();
}

export default Player;
