class Rules {
    constructor(
        minBettingLimit = 25,
        maxBettingLimit = 1000,
        blackjackPayout = 1.5,
        dealerStandsOnSoft17 = true,
        isDoubleDownAllowed = true,
        isSplittingAllowed = true,
        isSurrenderAllowed = true
    ) {
        this.bettingLimit = {
            min: minBettingLimit,
            max: maxBettingLimit,
        };
        this.blackjackPayout = blackjackPayout;
        this.dealerStandsOnSoft17 = dealerStandsOnSoft17;
        this.doubleDown = {
            isAllowed: isDoubleDownAllowed,
            afterSplittingIsAllowed: true,
            excludedHands: [],
        };
        this.split = {
            isAllowed: isSplittingAllowed,
            resplitAcesIsAllowed: true,
            maxHands: 4, // Player can split until they have max of 4 hands
        };
        this.isSurrenderAllowed = isSurrenderAllowed;
    }
}

export default Rules;
