class Suit {
    static Heart = new Suit('heart');
    static Spade = new Suit('spade');
    static Diamond = new Suit('diamond');
    static Club = new Suit('club');

    constructor(name) {
        this.name = name;
    }

    toString() {
        switch (this.name) {
            case 'heart':
                return '\u2665';
            case 'spade':
                return '\u2660';
            case 'diamond':
                return '\u2666';
            default:
                return '\u2663';
        }
    }
}

class Rank {
    static Ace = new Rank('ace', 1);
    static Two = new Rank('two', 2);
    static Three = new Rank('three', 3);
    static Four = new Rank('four', 4);
    static Five = new Rank('five', 5);
    static Six = new Rank('six', 6);
    static Seven = new Rank('seven', 7);
    static Eight = new Rank('eight', 8);
    static Nine = new Rank('nine', 9);
    static Ten = new Rank('ten', 10);
    static Jack = new Rank('jack', 11);
    static Queen = new Rank('queen', 12);
    static King = new Rank('king', 13);

    constructor(name, value) {
        this.name = name;
        this.value = value;
    }

    toString() {
        if (this.value > 1 && this.value < 11) {
            return this.value;
        } else {
            return this.name[0].toUpperCase();
        }
    }
}

class Card {
    constructor(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }

    toString() {
        // Rank
        let rank;
        // If this Card rank is 1-9, use Card rank value for unicode
        if (this.rank.value < 10) {
            rank = this.rank.value;
        }
        // Else if this Card rank is 10 or 11, use 'A' or 'B' for unicode. 
        // 'A' char code is 65.
        else if (this.rank.value < 12) {
            rank = String.fromCharCode(55 + this.rank.value);
        }
        // Else this Card rank is 12 or more, skip one hexadecimal letter since 'C'
        // corresponds to Knight Rank cards which are not used. Rank of 12 corresponds
        // to 'D' (char code of 68) for unicode.
        else {
            rank = String.fromCharCode(56 + this.rank.value);
        }

        // Suit
        let suit;
        switch (this.suit.name) {
            case 'heart':
                suit = 'B';
                break;
            case 'spade':
                suit = 'A';
                break;
            case 'diamond':
                suit = 'C';
                break;
            default:
                suit = 'D';
        }

        // Get unicode string for this Card
        const playingCardUnicode = String.fromCodePoint(parseInt('1F0' + suit + rank, 16))

        return `${this.rank}${this.suit}${playingCardUnicode}`;
    }
}

export default Card;
export { Rank, Suit, };
