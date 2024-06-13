import Card from './card.js';
import { PlayerHand, } from './hand.js';
import { v4 as uuidv4 } from 'uuid';

class Player {
    constructor(name, bankroll) {
        this.id = uuidv4();
        this.name = name;
        this.bankroll = bankroll;
        this.hands = [];
    }

    clearHands() {
        this.hands = [];
    }

    addHand(bet, firstCard) {
        if ((firstCard !== undefined) && !(firstCard instanceof Card)) {
            return;
        }

        if (bet > this.bankroll) { return; }

        const playerHand = new PlayerHand(
            bet, 
            (firstCard !== undefined) ? [firstCard] : undefined
        );

        this.hands.push(playerHand);
    }
}

export default Player;
