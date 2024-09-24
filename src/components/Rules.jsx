import './Rules.scss';

/** React component for single Rules instance. */
function Rules({ rules }) {
    return (
        <section id='rules' className='player'>
            <span id='rules-title' className='player-name'>Rules</span>
            <div id='min-bet'>
                <span>Min Bet:</span>
                <span>{rules.bettingLimit.min}</span>
            </div>
            <div id='max-bet'>
                <span>Max Bet:</span>
                <span>{rules.bettingLimit.max}</span>
            </div>
            <div id='bj-payout'>
                <span>Blackjack Payout:</span>
                <span>{rules.blackjackPayout}</span>
            </div>
            <div id='other-rules'>
                <div id='stand-on-soft-17'>
                    <span>Dealer Stands On Soft 17?</span>
                    <span>{rules.dealerStandsOnSoft17 ? 'YES' : 'NO'}</span>
                </div>
                <div id='double-down-allowed'>
                    <span>Double Down Allowed?</span>
                    <span>{rules.doubleDown.isAllowed ? 'YES' : 'NO'}</span>
                </div>
                <div id='splitting-allowed'>
                    <span>Splitting Allowed?</span>
                    <span>{rules.split.isAllowed ? 'YES' : 'NO'}</span>
                </div>
                <div id='surrender-allowed'>
                    <span>Surrender Allowed?</span>
                    <span>{rules.isSurrenderAllowed ? 'YES' : 'NO'}</span>
                </div>
            </div>
        </section>
    );
}

export default Rules;
