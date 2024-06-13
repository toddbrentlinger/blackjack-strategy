import Hand, { DealerHand, PlayerHand, } from './hand.js';
import Decks from './decks.js';
import Player from './player.js';
import Rules from './rules.js';

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

    constructor(name) {
        this.name = name;
    }
}

class Game {
    constructor(nDecks = 6) {
        this.state = GameState.Preparing;
        this.players = [];
        this.dealerHand = new DealerHand();
        this.playerHands = [];
        this.decks = new Decks(nDecks);
        this.rules = new Rules();
        this.shuffleUsesCSM = false; // CSM: Continuous-shuffling-machine
        this.currentPlayerIndex = 0; // Used to keep correct play order of Players
    }

    setState(newState) {
        if (!newState || !(newState instanceof GameState)) { return; }

        this.state = newState;
    }

    addPlayer(player) {
        // If playerName is NOT valid string, return
        if (!player || !(player instanceof Player)) { return; }

        this.players.push(player);
    }

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
        /*for (const player of this.players) {
          player.clearHands();
          player.addHand()
        }*/

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
    }

    hit(hand) {
        if (!hand || !(hand instanceof Hand)) {
            return;
        }

        // If Hand is already bust, do not add new card
        if (hand.isBust()) {
            return;
        }

        // Add deck top card to Hand
        hand.addCard(this.decks.getTopCard());
    }

    stand(playerHand) {
        if (!playerHand || !(playerHand instanceof PlayerHand)) {
            return;
        }

        playerHand.stand();
    }

    split(player, playerHandIndex) {
        player.playerHands[playerHandIndex];
    }
}

export default Game;
export { GameState, };
