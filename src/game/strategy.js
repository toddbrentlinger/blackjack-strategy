/** Enumerator class for actions on a Blackjack hand. */
class BlackjackAction {
    static H = new BlackjackAction('hit');
    static S = new BlackjackAction('stand');
    static P = new BlackjackAction('split');
    static DH = new BlackjackAction('double down if possible, else split');
    static DS = new BlackjackAction('double down if possible, else stand');
    static PH = new BlackjackAction('split if double down after split is possible, else hit');
    static RH = new BlackjackAction('surrender if possible, else hit');

    /**
     * @constructor
     * @param {string} desc - Description of action  
     */
    constructor(desc) {
        this.desc = desc;
    }

    /**
     * Returns object of all enumerator values where keys are static property 
     * name and values are corresponding BlackjackAction instance.
     * @returns {Object}
     */
    getAllActions() {
        return {
            H: BlackjackAction.H,
            S: BlackjackAction.S,
            P: BlackjackAction.P,
            DH: BlackjackAction.DH,
            DS: BlackjackAction.DS,
            PH: BlackjackAction.PH,
            RH: BlackjackAction.RH,
        };
    }
}

/** Single type of Blackjack strategy charts for basic hands, splitting, and soft hands. */
class BlackjackStrategyGrid {
    /**
     * Constructs Blackjack strategy using 2D-arrays of BlackjackActions where 
     * columns represent dealer card value from 2-to-Ace
     * @constructor
     * @param {Array} base - Rows represent Player hand 3-20
     * @param {Array} ace - Rows represent Player hand A2-A9
     * @param {Array} split - Rows represent Player hand 2,2-A,A
     */
    constructor(base, ace, split) {
        this.base = base;
        this.ace = ace;
        this.split = split;
    }
}

/** Module for Blackjack strategies. */
const blackjackStrategies = (() => {
    /**
     * Reference BlackjackAction enumerator values for all strategies as 
     * simplified variable names.
     */
    const H = BlackjackAction.H;
    const S = BlackjackAction.S;
    const P = BlackjackAction.P;
    const DH = BlackjackAction.DH;
    const DS = BlackjackAction.DS;
    const PH = BlackjackAction.PH;
    const RH = BlackjackAction.RH;

    // Object to hold all Blackjack strategies with key as strategy name
    const strategies = {};

    // Basic strategy
    strategies.basic = new BlackjackStrategyGrid(
        // Player hand 3-20
        [
            [ H, H, H, H, H, H, H, H, H, H],
            [ H, H, H, H, H, H, H, H, H, H],
            [ H, H, H, H, H, H, H, H, H, H],
            [ H, H, H, H, H, H, H, H, H, H],
            [ H, H, H, H, H, H, H, H, H, H],
            [ H, H, H, H, H, H, H, H, H, H],
            [ H,DH,DH,DH,DH, H, H, H, H, H],
            [DH,DH,DH,DH,DH,DH,DH,DH, H, H],
            [DH,DH,DH,DH,DH,DH,DH,DH,DH,DH],
            [ H, H, S, S, S, H, H, H, H, H],
            [ S, S, S, S, S, H, H, H, H, H],
            [ S, S, S, S, S, H, H, H, H, H],
            [ S, S, S, S, S, H, H, H,RH, H],
            [ S, S, S, S, S, H, H,RH,RH,RH],
            [ S, S, S, S, S, S, S, S, S, S],
            [ S, S, S, S, S, S, S, S, S, S],
            [ S, S, S, S, S, S, S, S, S, S],
            [ S, S, S, S, S, S, S, S, S, S],
        ],
        // Player hand A2-A9
        [
            [ H, H, H,DH,DH, H, H, H, H, H],
            [ H, H, H,DH,DH, H, H, H, H, H],
            [ H, H,DH,DH,DH, H, H, H, H, H],
            [ H, H,DH,DH,DH, H, H, H, H, H],
            [ H,DH,DH,DH,DH, H, H, H, H, H],
            [ S,DS,DS,DS,DS, S, S, H, H, H],
            [ S, S, S, S, S, S, S, S, S, S],
            [ S, S, S, S, S, S, S, S, S, S],
        ],
        // Player hand 2,2-A,A
        [
            [PH,PH, P, P, P, P, H, H, H, H],
            [PH,PH, P, P, P, P, H, H, H, H],
            [ H, H, H,PH,PH, H, H, H, H, H],
            [DH,DH,DH,DH,DH,DH,DH,DH, H, H],
            [PH, P, P, P, P, H, H, H, H, H],
            [ P, P, P, P, P, P, H, H, H, H],
            [ P, P, P, P, P, P, P, P, P, P],
            [ P, P, P, P, P, S, P, P, S, S],
            [ S, S, S, S, S, S, S, S, S, S],
            [ P, P, P, P, P, P, P, P, P, P],
        ]
    );
    
    return strategies;
})();

export default blackjackStrategies;
