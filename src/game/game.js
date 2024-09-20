import { DealerHand, } from './hand.js';
import Decks from './decks.js';
import Player from './player.js';
import Rules from './rules.js';
import blackjackStrategies from './strategy.js';

/**
 * Game States:
 * 1) Preparing
 * - Players place bets
 * - Cards could be shuffled
 * 2) Dealing
 * - Cards are dealt to each Player and Dealer
 * 3) PlayerPlaying
 * - Each Player plays their hand(s)
 * 4) DealerPlaying
 * - Dealer plays their hand
 * 5) Ending
 * - Depending on outcome, give/take Player's money
 */
class GameState {
    static Preparing = new GameState('preparing');
    static Dealing = new GameState('dealing');
    static PlayerPlaying = new GameState('playerPlaying');
    static DealerPlaying = new GameState('dealerPlaying');
    static Ending = new GameState('ending');

    /**
     * @constructor
     * @param {string} name 
     */
    constructor(name) {
        this.name = name;
    }
}

/** Single game of Blackjack. */
class Game {
    /**
     * @constructor
     * @param {number} nDecks - Number of 52-card decks to use in the game
     */
    constructor(nDecks = 6) {
        this.state = GameState.Preparing;
        this.players = [];
        this.dealerHand = new DealerHand();
        this.playerHands = [];
        this.decks = new Decks(nDecks);
        this.rules = new Rules();
        this.shuffleUsesCSM = false; // CSM: Continuous-shuffling-machine
        this.currentPlayerIndex = -1; // Used to keep correct play order of Players
    }

    // Getters/Setters

    /** Returns current Player object, else null if NO Player has current turn. */
    get currentPlayer() {
        return (this.currentPlayerIndex === -1) 
            ? null
            : this.players[this.currentPlayerIndex];
    }

    /**
     * Sets new GameState of the Blackjack game.
     * @param {GameState} newState - New GameState to change the current game
     */
    setState(newState) {
        // Check tht newState argument is valid
        if (!newState || !(newState instanceof GameState)) { return; }

        this.state = newState;
    }

    /**
     * Adds new Player to the Blackjack game.
     * @param {Player} player - Player object to add to Blackjack game
     */
    addPlayer(player) {
        // If playerName is NOT valid string, return
        if (!player || !(player instanceof Player)) { return; }

        this.players.push(player);
    }

    /**
     * Adds new PlayerHand to a specific Player with a specific bet amount.
     * @param {Player} player 
     * @param {number} bet 
     */
    addPlayerHand(player, bet) {
        // If NOT valid Player, return without adding PlayerHand
        if (!player || !(player instanceof Player)) { return; }

        // If bet is below minimum, return without adding PlayerHand
        if (bet < this.rules.bettingLimit.min) { return; }

        // If bet is above maximum, clamp bet to maximum
        if (bet > this.rules.bettingLimit.max) {
            bet = this.rules.bettingLimit.max;
        }

        player.addHand(bet);
    }

    /** Deals cards to each Player and Dealer. */
    deal() {
        // If NO PlayerHands, do NOT deal
        const playerHandsTotal = this.players.reduce((accum, player) => accum + player.hands.length, 0);
        if (playerHandsTotal === 0) { return; }

        // If game state is NOT 'Preparing', do not deal
        if (this.state !== GameState.Preparing) { return; }

        // Set new game state to 'Dealing'
        this.setState(GameState.Dealing);

        // Clear Dealer and Player's hands to make sure they're empty
        this.dealerHand.clear();
        //this.playerHands = [];
        // for (const player of this.players) {
        //   player.clearHands();
        //   player.addHand()
        // }

        // Create initial PlayerHand for each Player
        //this.playerHands = this.players.map((player) => new PlayerHand(player, 20));

        // Give first card to each initial PlayerHand, face up
        for (const player of this.players) {
            for (const playerHand of player.hands) {
                playerHand.addCard(this.decks.getTopCard());
            }
        }

        // Give first card to Dealer, face down
        this.dealerHand.addCard(this.decks.getTopCard());

        // Give second card to each initial PlayerHand, face up
        for (const player of this.players) {
            for (const playerHand of player.hands) {
                playerHand.addCard(this.decks.getTopCard());
            }
        }

        // Give second card to Dealer, face up
        this.dealerHand.addCard(this.decks.getTopCard());

        // Set Player index so 0-index Player plays first
        this.currentPlayerIndex = 0;
    }

    /** Starts game state where Players play their hands. */
    startPlayerPlay() {
        // Find first Player with Hand NOT initially dealt blackjack
        let playerIndex = 0;
        while ((playerIndex < this.players.length) 
            && (this.players[playerIndex].hands[0].hasBlackjack())
        ) {
            playerIndex++;
        }

        // If playerIndex outside range of players array, all Players have blackjack
        if (playerIndex === this.players.length) {
            this.startDealerPlay();
            return;
        }

        // Reset currentPlayerIndex to start with first valid Player
        this.currentPlayerIndex = playerIndex;

        // Set new game state to 'PlayerPlaying'
        this.setState(GameState.PlayerPlaying);
    }

    /** Starts game state where Dealer plays their hand. */
    startDealerPlay() {
        // Set DealerPlaying game state
        this.setState(GameState.DealerPlaying);

        // Turn Dealer second card face up
        this.dealerHand.turnSecondCardFaceUp();

        // Get initial value of Dealer's two cards
        let dealerTotal = this.dealerHand.getTotal();
        
        // Keep hitting OR stand depending on current value of Dealer's cards
        while (dealerTotal <= 17) {
            // If Hand is soft (at least one Ace)
            if (this.dealerHand.isSoft()) {
                if (dealerTotal < 17) {
                    // Hit
                    this.dealerHand.addCard(this.decks.getTopCard());
                }
                // Else dealerTotal === 17 
                else {
                    if (!this.rules.dealerStandsOnSoft17) {
                        // Hit
                        this.dealerHand.addCard(this.decks.getTopCard());
                    }
                    break;
                }
            }
            // Else Hand is NOT soft 
            else if (dealerTotal < 17) {
                // Hit
                this.dealerHand.addCard(this.decks.getTopCard());
            }

            // Increase value of Dealer's cards after new card added for next loop
            dealerTotal = this.dealerHand.getTotal();
        }
    }

    /** Starts new round of the Blackjack game. */
    startRound() {
        this.setState(GameState.Preparing);
    }

    /** Ends current round of the Blackjack game. */
    endRound() {
        // Set Ending game state
        this.setState(GameState.Ending);

        // Award any winnings and take any bets from each Player
        // Clear cards from hands
        for (const player of this.players) {
            player.handleEndRound(this.dealerHand, this.rules.blackjackPayout);
        }

        // Check if need to shuffle (50% through deck)
        if (this.decks.getFractionThroughDecks() < .5) {
            this.decks.shuffle();
        }
    }

    /** Increments to next Player turn. */
    incrementPlayerIndex() {
        // If still Players after current Player, increment index value
        if (this.currentPlayerIndex < (this.players.length - 1)) {
            this.currentPlayerIndex++;
        }
        // Else NO more players, reset index value and start Dealer play 
        else {
            this.currentPlayerIndex = -1;
            this.startDealerPlay();
        }
    }

    /**
     * Returns true if it's a specific Player's turn, else returns false.
     * @param {Player} player - Player to check if it's their turn to play 
     * @returns {boolean}
     */
    isPlayerTurn(player) {
        // If NOT valid Player, return false
        if (!player || !(player instanceof Player)) {
            return false;
        }

        // If NOT Player's turn, return false
        if (this.players[this.currentPlayerIndex] !== player) {
            return false;
        }

        return true;
    }

    /**
     * Hits current active hand of a specific Player.
     * @param {Player} player - Player to hit on their current active PlayerHand
     */
    hit(player) {
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // If NO PlayerHand, increment to next Player and return
        if (player.currentHand === null) {
            this.incrementPlayerIndex();
            return;
        }

        // If Hand is already bust, do not add new card
        // if (playerHand.isBust()) {
        //     return;
        // }

        // Add deck top card to Hand
        player.hit(this.decks.getTopCard());

        // TODO: Player could now be finished with this hand and could 
        // either start a new hand after splitting OR next player could start.
        if (player.currentHand === null) {
            this.incrementPlayerIndex();
        }
    }

    /**
     * Stands current active hand of a specific Player.
     * @param {Player} player - Player to stand on their current active PlayerHand
     */
    stand(player) {
        // TODO: START - Separate into separate function
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // TODO: END
        
        player.stand();

        // If Player has no more hands, increment to next Player
        if (player.currentHand === null) {
            this.incrementPlayerIndex();
        }
    }

    /**
     * Doubles down current active hand of a specific Player.
     * @param {Player} player - Player to double down on their current active PlayerHand
     */
    doubleDown(player) {
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // If NO PlayerHand, increment to next Player and return
        if (player.currentHand === null) {
            this.incrementPlayerIndex();
            return;
        }

        // Add deck top card to Hand
        player.doubleDown(this.decks);

        // Player could either move to a next hand after splitting OR next player could start.
        if (player.currentHand === null) {
            this.incrementPlayerIndex();
        }
    }

    /**
     * Splits current active hand of a specific Player.
     * @param {Player} player - Player to split on their current active PlayerHand
     */
    split(player) {
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // Check if splitting is allowed in rules
        if (!this.rules.split.isAllowed) {
            return;
        }

        // Check if can add another hand using rules
        if (player.currentHand.cards.length === this.rules.split.maxHands) {
            return;
        }

        // Check if Player can split
        if (!player.canSplit()) { 
            return; 
        }

        player.split(this.decks);
    }

    /**
     * Surrenders current active hand of a specific Player.
     * @param {Player} player - Player to surrender on their current active PlayerHand
     */
    surrender(player) {
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // TODO...
    }

    /**
     * Returns object with data about the suggested strategy of a specific 
     * Player's active hand.
     * @param {Player} player - Player to hit on their current active PlayerHand
     * @returns {Object} obj
     * @returns {string} obj.action - Description of the suggest action
     * @returns {string} obj.type - String representation of the type of strategy grid (Base, Ace, Split)
     * @returns {number} obj.row - Row of the strategy grid
     * @returns {number} obj.col - Column of the strategy grid
     */
    getBasicStrategyAction(player) {
        // If wrong game state, return
        if (this.state !== GameState.PlayerPlaying) {
            return;
        }

        // If NOT Player turn, return
        if (!this.isPlayerTurn(player)) {
            return;
        }

        // Get current active PlayerHand
        const playerHand = player.currentHand;

        // If no active PlayerHand, return
        if (playerHand === null) {
            return;
        }
        
        /** Column of strategy grid based on Dealer's hand */
        const col = this.dealerHand.getTotal() - 2;

        /** Row of strategy grid */
        let row;
        /** String representation of the type of strategy grid (Base, Ace, Split) */
        let strategyType;
        /** BlackjackStrategyGrid object that matches Player hand */
        let strategyGrid;
        
        // Check for splitting strategy
        if (playerHand.canSplit() 
            && this.rules.split.isAllowed
            && (player.hands.length < this.rules.split.maxHands)
        ) {
            /**
             * Since both cards have same value, convert value of first card 
             * to index of strategy.
             */
            row = (playerHand.cards[0].rank.value === 1) 
                ? 9 
                : (playerHand.cards[0].rank.value - 2);

            strategyGrid = blackjackStrategies.basic.split;
            strategyType = 'Split';
        }

        // Check for soft hands (at least one Ace)
        else if (playerHand.isSoft() && (playerHand.getTotal() < 20)) {
            // Find value of non-Ace in Player hand
            row = playerHand.cards[0].rank.value;
            if (row === 1) {
                row = playerHand.cards[1].rank.value;
            }
            if (row === 1) {
                row = 9;
            } else {
                row -= 2;
            }

            strategyGrid = blackjackStrategies.basic.ace;
            strategyType = 'Ace';
        }

        // Check for basic strategy
        else {
            row = playerHand.getTotal() - 3;

            strategyGrid = blackjackStrategies.basic.base;
            strategyType = 'Base';
        }

        console.log(
            `Suggested Strat (${strategyType}):`,
            `row: ${row}`,
            `col: ${col}`, 
            strategyGrid[row][col].desc
        );

        return {
            action: strategyGrid[row][col].desc,
            type: strategyType,
            row,
            col,
        };
    }
}

export default Game;
export { GameState, };
