import Hand from './Hand';

/** React component for single Dealer instance. */
function Dealer({ cards }) {
    /**
     * Returns ReactElement of Dealer's hand of cards
     * @returns {React.ReactElement}
     */
    const renderHand = function() {
        // If NO cards, render nothing
        if (cards.length === 0) { 
            return (
                <div className='hand'></div>
            ); 
        }
        
        return (
            <Hand
                handObj={{
                    hand: null,
                    bet: 0,
                    hasStand: false,
                    cards: cards,
                }}
                canPlayerFlip={false}
            />
        );
    };

    return (
        <section id="dealer" className="player">
            <span className="player-info">Dealer</span>
            {renderHand()}
        </section>
    );
}

export default Dealer;
