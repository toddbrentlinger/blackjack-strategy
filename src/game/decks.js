import Card, { Suit, Rank, } from './card.js';

class Decks {
    /**
     * @constructor
     * @param {number} nDecks - Number of decks, each 52 cards, to use
     */
    constructor(nDecks = 1) {
        // Throw error if nDecks is less than 0
        if (nDecks < 1) {
            throw new Error('Number of decks needs to be more 1 or more.');
        }

        this.nDecks = nDecks; // Total number of decks to use
        this.cards = []; // Array to hold all cards for all decks
        this.topCardIndex = -1; // Moving index in cards array of current top card

        this.populate();
        this.shuffle();
    }

    /**
     * Returns fractional number between [0,1] representing the number of cards 
     * left in the decks.
     * @returns {number}
     */
    getFractionThroughDecks() {
        if (this.topCardIndex === -1) {
            return 0;
        }

        return ((this.topCardIndex + 1) / this.cards.length);
    }

    /**
     * Returns top card of all decks.
     * @returns {Card}
     */
    getTopCard() {
        // If no more cards, throw error
        if (this.topCardIndex === -1) {
            throw new Error('No more cards in deck');
        }

        // Get reference to current top card
        const topCard = this.cards[this.topCardIndex];
        
        // Decrement index of top card to point to new card (or -1 if last card)
        this.topCardIndex--;
        
        return topCard;
    }

    /** Fills decks with cards. */
    populate() {
        // Clear any existing cards
        this.cards = [];

        // Add nDecks of cards to cards array
        for (let n = 0; n < this.nDecks; n++) {
            Object.keys(Suit).forEach((suit) => {
                Object.keys(Rank).forEach((rank) => {
                    this.cards.push(new Card(Suit[suit], Rank[rank]));
                });
            });
        }

        // Set topCardIndex to point to last card in card array (top card)
        this.topCardIndex = this.cards.length - 1;
    }

    /** Randomly shuffles positions of cards in the decks. */
    shuffle() {
        let iRand;

        // Randomize order of cards array
        for (let i = 0; i < this.cards.length; i++) {
            // Find random index in array
            iRand = Math.floor(Math.random() * this.cards.length);

            // Switch cards in i and iRand indices
            [this.cards[i], this.cards[iRand]] = [this.cards[iRand], this.cards[i]];
        }

        // Set topCardIndex to point to last card in card array (top card)
        this.topCardIndex = this.cards.length - 1;
    }
}

export default Decks;
