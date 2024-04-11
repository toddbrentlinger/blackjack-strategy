import Card from './card.js';

class Hand {
    constructor(cardsArr = []) {
        this.cards = cardsArr;
    }

    toString() {
        return this.cards.map((card) => card.toString()).join(' ');
    }

    addCard(newCard) {
        // Check if Card object was passed as argument
        if (!newCard || !(newCard instanceof Card)) {
            return;
        }

        this.cards.push(newCard);
    }

    getTotal() {
        let total = 0;
        let acesCount = 0;

        for (const card of this.cards) {
            // If card is Ace, add to acesCount to decide values of Aces (11 or 1) AFTER rest of cards total is calculated
            if (card.rank.number === 1) {
                acesCount++;
            }
            // Else if card is Ten, Jack, Queen, or King, add ten to total
            else if (card.rank.number >= 10) {
                total += 10;
            }
            // Else card rank is 2-9, add card rank number to total
            else {
                total += card.rank.number;
            }
        }

        // Add any Aces to total
        // Start by adding value of 1 to total for each Ace (Hard Ace)
        total += acesCount;
        // TODO: Only one Ace can possibly add value of 11. Two would lead to bust.
        // For each Ace in hand, keep adding extra value of 10 to total while total is 21 (Blackjack) or less. That Ace added overall value of 11 to total (Soft Ace).
        while (acesCount && total + 10 <= 21) {
            total += 10;
            acesCount--;
        }

        return total;
    }

    isBust() {
        return this.getTotal() > 21;
    }
}

class DealerHand extends Hand {
    constructor(cardsArr) {
        super(cardsArr);
        this.isFirstCardFaceDown = true;
    }

    toString() {
        if (this.isFirstCardFaceDown) {
            return String.fromCodePoint(parseInt('1F0A0', 16)) + ' '
                + this.cards.slice(1).map((card) => card.toString()).join(' ');
        }

        return this.cards.map((card) => card.toString()).join(' ');
    }

    addNewCard(newCard) {
        super.addNewCard(newCard);

        // If more than 2 cards in Hand, make sure first card is face up
        if (this.cards.length > 2) {
            this.turnFirstCardFaceUp();
        }
    }

    clear() {
        this.cards = [];
    }

    getTotal() {
        // If first card is face down, should only be two cards in hand.
        // Just return value of second card.
        if (this.isFirstCardFaceDown) {
            if (this.cards[1].rank.number === 1) {
                return 11;
            }
            // Else if card is Ten, Jack, Queen, or King, add ten to total
            if (this.cards[1].rank.number >= 10) {
                return 10;
            }
            // Else card rank is 2-9, add card rank number to total
            return this.cards[1].rank.number;
        }

        // Else return total of entire hand
        return super.getTotal();
    }

    turnFirstCardFaceUp() {
        this.isFirstCardFaceDown = false;
    }
}

class PlayerHand extends Hand {
    constructor(player, bet, cardsArr) {
        super(cardsArr);
        this.player = player;
        this.bet = bet;
        this.hasStand = false;
    }

    stand() {
        this.hasStand = true;
    }
}

export default Hand;
export { DealerHand, PlayerHand, };
