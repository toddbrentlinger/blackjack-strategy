import { useEffect, useRef, useState } from 'react';
import { GameState } from '../game/game.js';
import Deck from './Deck.jsx';
import PlayerComponent from './Player.jsx';
import Rules from './Rules.jsx';
import Dealer from './Dealer.jsx';
import AddNewPlayer from './AddNewPlayer.jsx';
import './Game.scss';

/** TODO - Delete if no longer used */
//const DEAL_DELAY = 10000;

/** Time interval between new cards being dealt. */
const DEAL_INTERVAL = 500;

/** Enumerator for current state of a single Hand of Blackjack. */
class HandState {
    static Blackjack = new HandState('blackjack');
    static Bust = new HandState('bust');
    static Playing = new HandState('playing');
    static Stand = new HandState('stand');
    static Surrender = new HandState('surrender');

    /**
     * @constructor
     * @param {string} name 
     */
    constructor(name) {
        this.name = name;
    }
}

/** React component for single Game instance. */
function Game({ game }) {
    // Hooks - useState

    // Uses GameState enumerator class to keep current state of the game
    const [gameState, setGameState] = useState(game.state);

    /*
    State to hold current data for a single Player

    Player State Array:
    [
        {
            player: Player,
            name: '',
            bankroll: 0,
            activeHandIndex: 0,
            isPlayerTurn: true,
            hands: [
                {
                    hand: PlayerHand,
                    bet: 0,
                    hasStand: false,
                    state: HandState.Playing,
                    cards: [
                        {
                            card: Card,
                            initialIsFaceUp: true,
                            dealDelay: 0,
                        }
                    ]
                }
            ]
        }
    ]
    */
    const [playersState, setPlayersState] = useState([]);

    // State to hold current Dealer cards
    const [dealerCards, setDealerCards] = useState([]);

    //const [displayTime, setDisplayTime] = useState(null);

    // Hooks - useRef

    // References of timeoutId and intervalId to be able to clear onComponentUnmount
    const timeoutId = useRef(null);
    const intervalId = useRef(null);

    // Hooks - useEffect

    // OnComponentMount and OnComponentUnmount
    useEffect(() => {
        // OnComponentMount

        return () => {
            // OnComponentUnmount

            // Clear any timeouts or intervals that are currently running
            clearTimeout(timeoutId.current);
            clearInterval(intervalId.current);
        };
    }, []);

    // Utility functions

    /**
     * Creates object to hold values of Card state data, with default values if 
     * necessary, that is passed down to child React components.
     * @param {Card} card - Reference to Card object
     * @param {number} dealDelay - Delay duration between cards being dealt
     * @param {boolean} initialIsFaceUp - True if Card is initially face up, else false
     * @returns {object} obj
     * @returns {Card} obj.card - Reference to Card object
     * @returns {number} obj.dealDelay - Delay duration between cards being dealt
     * @returns {boolean} obj.initialIsFaceUp - True if Card is initially face up, else false
     */
    const createCardStateObj = function(card, dealDelay = DEAL_INTERVAL, initialIsFaceUp = true) {
        return {
            card, dealDelay, initialIsFaceUp,
        };
    };

    // Methods

    /** Deals initial cards to the Dealer and each Player. */
    const deal = function() {
        // Deal initial cards using Game instance
        game.deal();

        // Set game state to 'Dealing'
        setGameState(game.state);
        
        // Clear any intervalId in case one is in progress
        clearInterval(intervalId.current);

        // Reset timeoutId and intervalId useRef to null
        timeoutId.current = null;
        intervalId.current = null;

        /** Total number of Players to deal initial cards. */
        const playerHandsCount = playersState.length;
        
        // Set Dealer cards state with deal intervals based on number of Players
        setDealerCards([
            createCardStateObj(
                game.dealerHand.cards[0]
            ),
            createCardStateObj(
                game.dealerHand.cards[1], 
                DEAL_INTERVAL * (playerHandsCount + 2), 
                false
            ),
        ]);

        /**
         * Set Players state for each Player's initial hand with deal intervals 
         * based on total number of Players.
         */
        setPlayersState((prevState) => {
            const newState = [...prevState];

            // For each Player object of playersState
            newState.forEach((playerObj, index) => {
                // Add just dealt first Hand
                playerObj.hands = [{
                    hand: playerObj.player.hands[0],
                    bet: playerObj.player.hands[0].bet,
                    hasStand: playerObj.player.hands[0].hasStand,
                    state: playerObj.player.hands[0].hasBlackjack() 
                        ? HandState.Blackjack 
                        : HandState.Playing,
                    cards: [
                        createCardStateObj(
                            playerObj.player.hands[0].cards[0],
                            DEAL_INTERVAL * (index + 2)
                        ),
                        createCardStateObj(
                            playerObj.player.hands[0].cards[1],
                            DEAL_INTERVAL * (playerHandsCount + index + 3)
                        ),
                    ],
                }];
            });

            return newState;
        });
        
        // Clear any possible timeout still set
        clearTimeout(timeoutId.current);

        // After all cards are dealt, using timeout, start PlayerPlaying game state
        timeoutId.current = setTimeout(() => {
            // Start PlayerPlaying game state using Game instance
            game.startPlayerPlay();

            // Set game state to 'PlayerPlaying'
            setGameState(GameState.PlayerPlaying);

            // Update Player state isPlayerTurn to true for first Player
            setPlayersState((prevPlayersState) => {
                const newState = [...prevPlayersState];
                
                // Find Player state object in state with matching first valid Player from game module
                const playerObj = newState.find((currPlayerObj) => (currPlayerObj.player.id === game.currentPlayer.id));

                // If Player state object was found, set isPlayerTurn flag to true
                if (playerObj !== undefined) {
                    playerObj.isPlayerTurn = true;
                    playerObj.activeHandIndex = game.currentPlayer.activeHandIndex;
                } else {
                    console.error('Matching first Player NOT found!');
                }

                /**
                 * @todo How to deal with Player not being found? Since Game 
                 * instance is used to populate Player state objects AND Game
                 * instance can not directly be accessed by User, the Player 
                 * will only NOT be found with coding error.
                 */

                return newState;
            });
        }, DEAL_INTERVAL * (playerHandsCount * 2 + 3));
    };

    /**
     * Handles adding new Player to the game.
     * @param {Player} player - Reference to Player object to add
     */
    const handleAddNewPlayer = function(player) {
        // Add Player to Game instance
        game.addPlayer(player);

        // Add Player object data to React state hook using properties of Player instance
        setPlayersState((prevState) => ([
            ...prevState,
            {
                player: player,
                name: player.name,
                bankroll: player.bankroll,
                hands: [],
                activeHandIndex: player.activeHandIndex,
                isPlayerTurn: false,
            }
        ]));
    };

    /**
     * Handles new bet by Player to add a new PlayerHand. Passed as prop
     * to Player React components.
     * @param {Player} player - Reference to Player instance
     * @param {number} bet - Bet amount made by Player
     */
    const handleBet = function(player, bet) {
        // Use Game instance to add new Player hand
        game.addPlayerHand(player, bet);
    };

    /**
     * Returns object in PlayersState that corresponds to matching Player instance.
     * @param {Array} newPlayersState - Deep copy of PlayersState array
     * @param {Player} player  - Reference to Player instance
     * @returns {Object|undefined}
     */
    const getPlayerStateObj = function(newPlayersState, player) {
        /**
         * Find Player object in state with matching first valid Player from 
         * game module OR undefined if no matching Player found.
         */
        return newPlayersState
            .find((currPlayerObj) => (currPlayerObj.player.id === player.id));
    };

    /**
     * Updates specific Player state basic properties and switches to different 
     * Player or starts Dealer play depending on Player's updated data.
     * @param {Array} newPlayersState - Deep copy of PlayersState array
     * @param {Player} player - Reference to Player instance
     * @returns {Object|undefined}
     */
    const updatePlayersStateAfterPlayerAction = function(newPlayersState, player) {
        // Find Player object in state with matching first valid Player from game module
        const playerObj = getPlayerStateObj(newPlayersState, player);

        // If NO matching Player object, return state unchanged
        if (playerObj === undefined) {
            return;
        }

        // Set Player activeHandIndex in case Player bust
        playerObj.activeHandIndex = player.activeHandIndex;

        // If Player turn is over, change current Player
        
        const currentPlayer = game.currentPlayer;

        // If no more Player turns, it's Dealer's turn
        if (currentPlayer === null) {
            playerObj.isPlayerTurn = false;

            // Set game state to DealerPlaying
            setGameState(game.state);

            handleDealerPlay();
        }
        // Else If it is a new Player's turn
        else if ((currentPlayer !== player)) {
            // Set previous Player isPlayerTurn flag to false
            playerObj.isPlayerTurn = false;

            // Find new Player object
            const newPlayerObj = newPlayersState
                .find((currPlayerObj) => (currPlayerObj.player.id === currentPlayer.id));

            // If new Player state object was found, set isPlayerTurn flag to true AND update activeHandIndex
            if (newPlayerObj !== undefined) {
                newPlayerObj.isPlayerTurn = true;
                newPlayerObj.activeHandIndex = currentPlayer.activeHandIndex;
            } else {
                console.error('Matching next Player NOT found!');
            }
        }

        return playerObj;
    };

    /**
     * Handles Player hitting on their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleHit = function(player) {
        /** Current PlayerHand of the Player passed as argument. Get reference 
         * now because it may change if current hand busts after hitting. 
         */
        const currentHand = player.currentHand;

        // Use Game instance to make specified Player hit their current hand
        game.hit(player);

        // Update PlayersState with outcome of Player hitting using Game instance
        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];

            const playerObj = updatePlayersStateAfterPlayerAction(newState, player);
                
            if (playerObj === undefined) {
                return newState;
            }
            
            // Find Hand object in state that a Card was added to through hitting
            const handObj = playerObj.hands.find((currHandObj) => (currHandObj.hand.id === currentHand.id));

            // If NO matching Hand object, return state only changing Player data
            if (handObj === undefined) {
                return newState;
            }

            // Make sure card is NOT already in hand
            const card = currentHand.cards[currentHand.cards.length - 1];
            if (handObj.cards.findIndex((cardObj) => cardObj.card.id === card.id) !== -1) {
                return newState;
            }

            // Add last card added from Player hitting
            handObj.cards = [
                ...handObj.cards,
                createCardStateObj(card),
            ];

            // Update Hand state (Playing, Bust, or Blackjack)
            if (handObj.hand.hasBlackjack()) {
                handObj.state = HandState.Blackjack;
            } else if (handObj.hand.isBust()) {
                handObj.state = HandState.Bust;
            }

            return newState;
        });
    };

    /**
     * Handles Player standing on their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleStand = function(player) {
        /** Current PlayerHand of the Player passed as argument */
        const currentHand = player.currentHand;

        // Use Game instance to make specified Player stand their current hand
        game.stand(player);
        
        // Update PlayersState with outcome of Player standing using Game instance
        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];
            
            const playerObj = updatePlayersStateAfterPlayerAction(newState, player);

            // Find Hand object in state that a Card was added to through hitting
            const handObj = playerObj.hands.find((currHandObj) => (currHandObj.hand.id === currentHand.id));

            // If NO matching Hand object, return state only changing Player data
            if (handObj === undefined) {
                return newState;
            }

            // Update Hand state (Stand)
            handObj.state = HandState.Stand;

            return newState;
        });
    };

    /**
     * Handles Player doubling down on their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleDoubleDown = function(player) {
        /** Current PlayerHand of the Player passed as argument. Get reference 
         * now because it may change if current hand busts after double down. 
         */
        const currentHand = player.currentHand;

        // Use Game instance to make specified Player double down their current hand
        game.doubleDown(player);

        // Update PlayersState with outcome of Player hitting using Game instance
        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];
                
            const playerObj = updatePlayersStateAfterPlayerAction(newState, player);
                
            if (playerObj === undefined) {
                return newState;
            }
            
            // Find Hand object in state that a Card was added to through doubling down
            const handObj = playerObj.hands.find((currHandObj) => (currHandObj.hand.id === currentHand.id));

            // If NO matching Hand object, return state only changing Player data
            if (handObj === undefined) {
                return newState;
            }

            // Make sure card is NOT already in hand
            const card = currentHand.cards[currentHand.cards.length - 1];
            if (handObj.cards.findIndex((cardObj) => cardObj.card.id === card.id) !== -1) {
                return newState;
            }

            // Add last card added from Player double down
            handObj.cards = [
                ...handObj.cards,
                createCardStateObj(card),
            ];

            // Update Hand state (Stand, Bust, or Blackjack)
            if (handObj.hand.hasBlackjack()) {
                handObj.state = HandState.Blackjack;
            } else if (handObj.hand.isBust()) {
                handObj.state = HandState.Bust;
            } else {
                handObj.state = HandState.Stand;
            }

            return newState;
        });
    };

    /**
     * Handles Player splitting their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleSplit = function(player) {
        //const currentHand = player.currentHand;

        /** Current index of active hand in Player's hands */
        const currentHandIndex = player.activeHandIndex;

        // Use Game instance to make specified Player split their current hand
        game.split(player);
        
        // Update PlayersState with outcome of Player splitting using Game instance
        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];
                
            const playerObj = updatePlayersStateAfterPlayerAction(newState, player);
                
            if (playerObj === undefined) {
                return newState;
            }

            /** Current PlayerHand of the Player passed as argument */
            const currentHand = player.getIthHand(currentHandIndex);

            // Find Hand object in state that a Card was added to through hitting
            const handObj = playerObj.hands.find((currHandObj) => (currHandObj.hand.id === currentHand.id));

            // If NO matching Hand object, return state only changing Player data
            if (handObj === undefined) {
                return newState;
            }

            // Make sure card is NOT already in hand
            const card = currentHand.cards[currentHand.cards.length - 1];
            if (handObj.cards.findIndex((cardObj) => cardObj.card.id === card.id) !== -1) {
                return newState;
            }

            // Remove second card from hand since it's moved to new hand's first card
            handObj.cards = handObj.cards.slice(0, 1);

            /**
             * Add last card added from Player hitting. Can use push method 
             * since 'cards' property is shallow copy after slice method used.
             */
            handObj.cards = [
                ...handObj.cards,
                createCardStateObj(card),
            ];

            // Update Hand state (Playing or Blackjack)
            if (handObj.hand.hasBlackjack()) {
                handObj.state = HandState.Blackjack;
            }

            // Guaranteed to be extra hand after current hand is split
            const nextHand = player.getIthHand(currentHandIndex + 1);

            // Add just dealt first Hand
            playerObj.hands.push({
                hand: nextHand,
                bet: nextHand.bet,
                hasStand: nextHand.hasStand,
                state: nextHand.hasBlackjack() 
                    ? HandState.Blackjack 
                    : HandState.Playing,
                cards: [
                    createCardStateObj(nextHand.cards[0]),
                    createCardStateObj(nextHand.cards[1], DEAL_INTERVAL * 3),
                ],
            });

            return newState;
        });
    };

    /**
     * Handles Player surrendering on their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleSurrender = function(player) {
        /** Current PlayerHand of the Player passed as argument */
        const currentHand = player.currentHand;

        // Use Game instance to make specified Player surrender their current hand
        game.surrender(player);

        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];

            const playerObj = updatePlayersStateAfterPlayerAction(newState, player);

            // Find Hand object in state that a Card was added to through hitting
            const handObj = playerObj.hands.find((currHandObj) => (currHandObj.hand.id === currentHand.id));

            // If NO matching Hand object, return state only changing Player data
            if (handObj === undefined) {
                return newState;
            }

            // Update Hand state (Surrender)
            handObj.state = HandState.Surrender;

            return newState;
        });
    };

    /**
     * Handles Player requesting suggested strategy on their current hand
     * @param {Player} player - Reference to Player instance
     */
    const handleStrategy = function(player) {
        // TODO...

        // Use Game instance to make specified Player request suggested strategy on their current hand
        game.getBasicStrategyAction(player);
    };

    /** Handles Dealer playing their hand */
    const handleDealerPlay = function() {
        // Update DealerCards state with outcome of Dealer playing using Game instance
        setDealerCards((prevDealerCards) => {
            const newDealerCards = [...prevDealerCards];

            // Flip face down card
            newDealerCards[1].initialIsFaceUp = true;

            // Add each card in Dealer's hand
            let card;
            for (let i = 2; i < game.dealerHand.cards.length; i++) {
                // ith card in Dealer's hand
                card = game.dealerHand.cards[i];

                // If card already rendered in hand, skip
                if (prevDealerCards.findIndex((cardObj) => cardObj.card.id === card.id) !== -1) {
                    continue;
                }

                newDealerCards.push(
                    createCardStateObj(card, DEAL_INTERVAL * (i - 1))
                );
            }

            return newDealerCards;
        });

        // End game round after Dealer's cards are dealt using setTimeout
        timeoutId.current = setTimeout(() => {
            handleEndRound();
        }, DEAL_INTERVAL * game.dealerHand.cards.length + 3000);
    };

    /** Handles end of single round of game. */
    const handleEndRound = function() {
        // Use Game instance to end current game round
        game.endRound();

        // Update game state
        setGameState(game.state);

        // Set each player state in turn using timeouts
        setPlayersState((prevPlayersState) => {
            const newState = [...prevPlayersState];

            for (const playerObj of newState) {
                // Update Player state with known data
                playerObj.activeHandIndex = -1;
                playerObj.hands = [];

                // Update Player state with unknown data
                playerObj.bankroll = playerObj.player.bankroll;
            }

            return newState;
        });

        // Reset Dealer cards state to empty array for next round
        setDealerCards([]);

        // Start new round after all Cards are removed using setTimeout
        timeoutId.current = setTimeout(() => {
            // Use Game instance to start new game round
            game.startRound();

            // Update game state
            setGameState(game.state);
        }, DEAL_INTERVAL * 5);
    };

    /**
     * Returns ReactElement of message stating the current game state and any 
     * instructions.
     * @returns {React.ReactElement|undefined}
     */
    const renderState = function() {
        switch(gameState) {
            case GameState.Preparing:
                return (
                    <div id='msg'>
                        <p>Place Bets For Next Round</p>
                        <button onClick={deal}>Deal</button>
                    </div>
                );
            case GameState.Dealing:
                return (<div id='msg'>Dealing</div>);
            case GameState.PlayerPlaying:
                return (<div id='msg'>Player Playing</div>);
            case GameState.DealerPlaying:
                return (<div id='msg'>Dealer Playing</div>);
            case GameState.Ending:
                return (<div id='msg'>Round Ending</div>);
            default:
                return;
        }
    };

    /**
     * Returns array of ReactElements for each Player.
     * @returns {React.ReactElement[]}
     */
    const renderPlayers = function() {
        return playersState.map((playerObj) => (
            <PlayerComponent 
                key={playerObj.player.id}
                playerObj={playerObj}
                gameState={gameState}
                minBet={game.rules.bettingLimit.min}
                handleBet={handleBet}
                handleHit={handleHit}
                handleStand={handleStand}
                handleDoubleDown={handleDoubleDown}
                handleSplit={handleSplit}
                handleSurrender={handleSurrender}
                handleStrategy={handleStrategy}
            />
        ));
    };
    
    return (
        <>
            <Deck />

            <Rules rules={game.rules} />

            {renderState()}
            
            <Dealer cards={dealerCards} />

            <section id="players">
                {renderPlayers()}
                <AddNewPlayer handleAddNewPlayer={handleAddNewPlayer} />
            </section>
        </>
    );
}

export default Game;
