import Card from './card.js';
import { PlayerHand, } from './hand.js';

class Player {
    constructor(name, bankroll) {
        this.name = name;
        this.bankroll = bankroll;
        this.hands = [];
    }

    clearHands() {
        this.hands = [];
    }

    addHand(firstCard) {
        if (firstCard !== undefined && !(firstCard instanceof Card)) {
            return;
        }

        this.hands.push(new PlayerHand(firstCard));
    }
}

export default Player;
