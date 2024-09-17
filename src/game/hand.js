import Card from './card.js';
import { v4 as uuidv4 } from 'uuid';

class Hand {
    // Private fields
    #id;

    /**
     * @constructor
     * @param {Card[]} cardsArr - Array of Card objects to add to Hand
     */
    constructor(cardsArr = []) {
        this.#id = uuidv4();
        this.cards = cardsArr;
    }

    // Getters
    get id() { return this.#id; }

    /**
     * Returns string representation of the Hand instance (overriden from Object class).
     * @returns {string}
     */
    toString() {
        return this.cards.map((card) => card.toString()).join(' ');
    }

    /**
     * Adds any number of Card objects to the Hand.
     * @param  {...Card} newCards 
     */
    addCard(...newCards) {
        newCards.forEach((newCard) => {
            // Check if Card object was passed as argument
            if (!newCard || !(newCard instanceof Card)) {
                return;
            }

            this.cards.push(newCard);
        });
    }

    /**
     * Returns total value of all Card objects in Hand.
     * @returns {number}
     */
    getTotal() {
        /** Total value of all Card objects in Hand */
        let total = 0;

        /** Number of Aces in Hand */
        let acesCount = 0;

        for (const card of this.cards) {
            // If card is Ace, add to acesCount to decide values of Aces (11 or 1) AFTER rest of cards total is calculated
            if (card.rank.value === 1) {
                acesCount++;
            }
            // Else if card is Ten, Jack, Queen, or King, add ten to total
            else if (card.rank.value >= 10) {
                total += 10;
            }
            // Else card rank is 2-9, add card rank value to total
            else {
                total += card.rank.value;
            }
        }

        // Add any Aces to total

        // Start by adding value of 1 to total for each Ace (Hard Ace)
        total += acesCount;

        /**
         * TODO: Only one Ace can possibly add value of 11. Two would lead to bust.
         * SOLUTION: Break out of first successful iteration of while loop
         * For each Ace in hand, keep adding extra value of 10 to total while 
         * total is 21 (Blackjack) or less. That Ace added overall value of 
         * 11 to total (Soft Ace).
         */
        while (acesCount && (total <= 11)) {
            total += 10;
            acesCount--;
        }

        return total;
    }

    /**
     * Returns true if Hand has bust, else false.
     * @returns {boolean}
     */
    isBust() {
        return this.getTotal() > 21;
    }

    /**
     * Returns true if Hand has blackjack, else false.
     * @returns {boolean}
     */
    hasBlackjack() {
        return this.getTotal() === 21;
    }

    /**
     * Returns true is Hand is soft, else false.
     * @returns {boolean}
     */
    isSoft() {
        return this.cards.findIndex((card) => card.rank.value === 1) !== -1;
    }
}

class DealerHand extends Hand {
    /**
     * @constructor
     * @param {Card[]} cardsArr - Array of Card objects to add to DealerHand
     */
    constructor(cardsArr) {
        super(cardsArr);

        this.isSecondCardFaceDown = true;
    }

    /**
     * Returns string representation of the DealerHand instance (overriden 
     * from Hand and Object class).
     * @returns {string}
     */
    toString() {
        /**
         * If second card is face down, display special character for card 
         * back and string representation of only face up card.
         */
        if (this.isSecondCardFaceDown) {
            return String.fromCodePoint(parseInt('1F0A0', 16)) + ' '
                + this.cards.slice(1).map((card) => card.toString()).join(' ');
        }

        // Else return string representation of all face up cards
        return this.cards.map((card) => card.toString()).join(' ');
    }

    /**
     * Adds new Card objects to the DealerHand.
     * @todo Override addCard from base class Hand instead
     * @param {Card} newCard 
     */
    addNewCard(newCard) {
        super.addCard(newCard);

        // If more than 2 cards in DealerHand, make sure second card is face up
        if (this.cards.length > 2) {
            this.turnSecondCardFaceUp();
        }
    }

    /** Clears DealerHand of any cards in preparation for next round. */
    clear() {
        this.cards = [];
    }

    /**
     * Returns total value of all Card objects in DealerHand (overrides base 
     * class method).
     * @returns {number}
     */
    getTotal() {
        // If second card is face down, should only be two cards in hand.
        // Just return value of first card.
        if (this.isSecondCardFaceDown) {
            if (this.cards[1].rank.value === 1) {
                return 11;
            }
            // Else if card is Ten, Jack, Queen, or King, add ten to total
            if (this.cards[1].rank.value >= 10) {
                return 10;
            }
            // Else card rank is 2-9, add card rank value to total
            return this.cards[1].rank.value;
        }

        // Else return total of entire hand
        return super.getTotal();
    }

    /** Turns second card face up so all Card objects in DealerHand are now visible. */
    turnSecondCardFaceUp() {
        this.isSecondCardFaceDown = false;
    }
}

/**
 * @todo If PlayerHand already has cards, cannot change bet
 */
class PlayerHand extends Hand {
    // Private fields
    #bet;

    /**
     * @constructor
     * @param {number} bet - Bet amount for the PlayerHand
     * @param {Card[]} cardsArr - Array of Card objects to add to PlayerHand
     */
    constructor(bet, cardsArr = []) {
        super(cardsArr);

        // Make sure the bet amount is NOT negative
        this.#bet = (bet < 0) ? 0 : bet;

        // Initialie hasStand boolean state to false
        this.hasStand = false;
    }

    // Getters/Setters

    get bet() {
        return this.#bet;
    }

    set bet(newBet) {
        /**
         * Cannot change bet if cards have already been added.
         * Cannot change bet if newBet is not greater than or equal to zero.
         */
        if ((this.cards.length !== 0) || (newBet < 0)) { return; }

        this.#bet = newBet;
    }

    // Public Methods

    /** Sets the PlayerHand to stand (no more cards added). */
    stand() {
        this.hasStand = true;
    }

    /**
     * Splits the PlayerHand so one Card remains in this PlayerHand and second 
     * card is returned to create new PlayerHand.
     * @returns {Card|undefined}
     */
    split() {
        if (!this.canSplit()) { return; }

        // Save second Card object to return before removing from cards array
        const cardForNewHand = this.cards[1];

        // Remove second Card object from the PlayerHand, leaving only one Card
        this.cards = this.cards.slice(0, 1);

        // Return saved second Card object from PlayerHand
        return cardForNewHand;
    }

    /**
     * Returns true if PlayerHand can be split, else false.
     * @returns {boolean}
     */
    canSplit() {
        return (
            (this.cards.length === 2) 
            && (this.cards[0].rank.value === this.cards[1].rank.value)
        );
    }

    /**
     * Returns true if PlayerHand can surrender, else false.
     * @returns {boolean}
     */
    canSurrender() {
        return (this.cards.length === 2);
    }


}

export default Hand;
export { DealerHand, PlayerHand, };
