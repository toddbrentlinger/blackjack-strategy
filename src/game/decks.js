import Card, { Suit, Rank, } from './card.js';

class Decks {
    constructor(nDecks = 1) {
        // Throw error if nDecks is less than 0
        if (nDecks < 1) {
            throw new Error('Number of decks needs to be more 1 or more.');
        }

        this.nDecks = nDecks;
        this.cardsNotUsed = []; // Array used as stack to hold Cards not yet used
        this.cardsUsed = []; // Array used as stack to hold Cards already used

        this.populate();
        this.shuffle();
    }

    getTopCard() {
        // If no more cards can be used, shuffle
        if (!this.cardsNotUsed.length) {
            return;
        }

        const topCard = this.cardsNotUsed.pop();
        this.cardsUsed.push(topCard);
        return topCard;
    }

    populate() {
        // Empty cardsNotUsed array in case it has any cards
        this.cardsNotUsed = [];

        // Add nDecks of cards to cardsNotUsed array
        for (let n = 0; n < this.nDecks; n++) {
            Object.keys(Suit).forEach((suit) => {
                Object.keys(Rank).forEach((rank) => {
                    this.cardsNotUsed.push(new Card(Suit[suit], Rank[rank]));
                });
            });
        }
    }

    shuffle() {
        let iRand;

        // Add all cardsUsed items to cardsNotUsed array so all cards back in same array
        this.cardsNotUsed = this.cardsNotUsed.concat(this.cardsUsed);

        // Reset cardsUsed array to empty array
        this.cardsUsed = [];

        // Randomize order of cardsNotUsed array
        for (let i = 0; i < this.cardsNotUsed.length; i++) {
            // Find random index in array
            iRand = Math.floor(Math.random() * this.cardsNotUsed.length);

            // Switch cards in i and iRand indices
            [this.cardsNotUsed[i], this.cardsNotUsed[iRand]] = [this.cardsNotUsed[iRand], this.cardsNotUsed[i]];
        }
    }
}

export default Decks;
