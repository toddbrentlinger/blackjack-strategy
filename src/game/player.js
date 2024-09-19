import Card from './card.js';
import { PlayerHand, } from './hand.js';
import { v4 as uuidv4 } from 'uuid';

class Player {
    // Private Fields
    #activeHandIndex;

    /**
     * @constructor
     * @param {string} name 
     * @param {number} bankroll 
     */
    constructor(name, bankroll) {
        this.id = uuidv4();
        this.name = name;
        this.bankroll = bankroll;
        this.hands = [];
        // TODO: Make private and use getter outside class
        this.activeHandIndex = -1;
    }

    // Getters/Setters

    get currentHand() {
        return (this.activeHandIndex === -1) 
            ? null 
            : this.hands[this.activeHandIndex];
    }

    // TODO: Make activeHandIndex private so it cannot be set outside class instance
    // get activeHandIndex() {
    //     return this.activeHandIndex;
    // }

    /**
     * Returns the ith PlayerHand or null if index parameter is out-of-bounds 
     * of PlayerHands array.
     * @param {number} i - Index of PlayerHand to return
     * @returns {PlayerHand|null}
     */
    getIthHand(i) {
        // Check if i is within bounds of hands array
        if ((i < 0) || (i >= this.hands.length)) { 
            return null; 
        }

        return this.hands[i];
    }

    /** Clears all PlayerHand objects from the Player. */
    clearHands() {
        this.hands = [];
        this.activeHandIndex = -1;
    }

    /**
     * Adds PlayerHand object with bet amount and first Card object of that 
     * PlayerHand.
     * @param {number} bet - Value of bet for the PlayerHand to be added
     * @param {Card} firstCard - First Card object to add to the PlayerHand
     */
    addHand(bet, firstCard) {
        // Check if firstCard is valid
        if ((firstCard !== undefined) && !(firstCard instanceof Card)) {
            return;
        }

        // Check that bet value is NOT more than Player bankroll
        if (bet > this.bankroll) { 
            return; 
        }

        // Create new PlayerHand object
        const playerHand = new PlayerHand(
            bet, 
            (firstCard !== undefined) ? [firstCard] : undefined
        );

        // Add new PlayerHand object to array of all PlayerHand objects
        this.hands.push(playerHand);

        // If player only has one hand, set activeHandIndex to zero
        if (this.hands.length === 1) {
            this.activeHandIndex = 0;
        }
    }

    /** Increments index of active PlayerHand in array of all PlayerHand objects. */
    incrementHandIndex() {
        // If current index does NOT point to last PlayerHand, increment index by one
        if (this.activeHandIndex < (this.hands.length - 1)) {
            this.activeHandIndex++;
        }
        /**
         * Else current index points to last PlayerHand, wrap index back around 
         * with value of -1
         */
        else {
            this.activeHandIndex = -1;
        }
    }

    /**
     * Hits on current active PlayerHand by adding new Card object.
     * @param {Card} newCard - Card to add to current active PlayerHand
     */
    hit(newCard) {
        // Check if there is a current active PlayerHand
        if (this.activeHandIndex === -1) { return; }

        // Add new Card object to current active PlayerHand
        this.hands[this.activeHandIndex].addCard(newCard);
        
        /**
         * If current active PlayerHand has hit blackjack OR bust, increment 
         * index of active PlayerHand
         */
        if (this.hands[this.activeHandIndex].getTotal() >= 21) {
            this.incrementHandIndex();
        }
    }

    /** Stands on current active PlayerHand by adding new Card object. */
    stand() {
        this.incrementHandIndex();
    }

    /**
     * Doubles down on current active PlayerHand by adding new Card object.
     * @param {Decks} decks - Decks object holding Card objects
     */
    doubleDown(decks) {
        // Get current active PlayerHand
        const currentHand = this.currentHand;

        // Return if NO current active PlayerHand
        if (currentHand === null) { return; }

        // Check that only two cards in hand
        if (currentHand.cards.length !== 2) { return; }

        // Add top Card of Decks objects to current active PlayerHand
        currentHand.addCard(decks.getTopCard());

        // Double player hand bet
        currentHand.bet *= 2;

        // Current PlayerHand is complete, increment index of current active PlayerHand
        this.incrementHandIndex();
    }

    /**
     * Returns true if Player can split current PlayerHand, else false.
     * @returns {boolean}
     */
    canSplit() {
        // Get current active PlayerHand
        const currentHand = this.currentHand;

        // Return false if NO current active PlayerHand
        if (currentHand === null) { return false; }
        
        return currentHand.canSplit();
    }

    /**
     * Splits on current active PlayerHand by adding new Card object.
     * @param {Decks} decks - Decks object holding Card objects
     */
    split(decks) {
        // Get current active PlayerHand
        const currentHand = this.currentHand;

        // Return if NO current active PlayerHand
        if (currentHand === null) { return; }

        // Move second card into new hand
        const cardForNewHand = currentHand.split();
        this.addHand(currentHand.bet, cardForNewHand);

        // Add new card to first hand
        currentHand.addCard(decks.getTopCard());

        /**
         * Add new card to new hand. Can use (this.activeHandIndex + 1) because
         * a new hand was just added, guaranteeing there's at least one more 
         * hand after current hand.
         */
        this.hands[this.activeHandIndex + 1].addCard(decks.getTopCard());
    }

    /**
     * Handles end of game round by adding/removing bets and resetting Player properties.
     * @param {DealerHand} dealerHand - DealerHand object representing Cards dealt to Dealer
     * @param {number} blackjackPayout - Ratio of payout when PlayerHand is dealt a blackjack
     */
    handleEndRound(dealerHand, blackjackPayout) {
        const dealerHandTotal = dealerHand.getTotal();
        let playerHandTotal;

        for (const playerHand of this.hands) {
            playerHandTotal = playerHand.getTotal();

            // If both player and dealer hands are bust
            if (dealerHand.isBust() && playerHand.isBust()) {
                // Player hand ties, return original bet to player bankroll
                continue;
            }
            // Else If only dealer hand is bust
            else if (dealerHand.isBust()) {
                // Player wins, increase player bankroll by player hand bet
                this.bankroll += playerHand.bet;
                continue;
            }
            // Else If only player hand is bust
            else if (playerHand.isBust()) {
                // Player loses, remove bet from player bankroll
                this.bankroll -= playerHand.bet;
                continue;
            }

            // If reach here, both player and dealer hands are 21 or less
            
            // If dealerHand is natural blackjack
            if ((dealerHandTotal === 21) && (dealerHand.cards.length === 2)) {
                // Player hand can only tie with natural blackjack
                if ((playerHandTotal === 21) && (playerHand.cards.length === 2)) {
                    // Player hand ties, return original bet to player bankroll
                }

                // Else player loses
                else {
                    // Remove bet from player bankroll
                    this.bankroll -= playerHand.bet;
                }
            }

            // Else if playerHand is natural blackjack AND dealerHand is NOT
            else if ((playerHandTotal === 21) && (playerHand.cards.length === 2)) {
                // Player wins, increase player bankroll by player hand bet with blackjack modifier
                this.bankroll += (playerHand.bet * blackjackPayout);
            }

            // Else neither player or dealer has natural blackjack
            else {
                if (playerHandTotal > dealerHandTotal) {
                    // Player wins, increase player bankroll by player hand bet
                    this.bankroll += playerHand.bet;
                }
                else if (playerHandTotal < dealerHandTotal) {
                    // Player loses, remove bet from player bankroll
                    this.bankroll -= playerHand.bet;
                }
                // Else (playerHandTotal === dealerHandTotal)
                else {
                    // Player hand ties, return original bet to player bankroll
                }
            }
        }

        this.clearHands();
    }
}

export default Player;
