import Card from './Card';
import './Hand.scss';

function Hand({ handObj, canPlayerFlip = true, isActive = false}) {
    return (
        <div className="hand-container">
            <div className={isActive ? "active-hand hand" : "hand"}>
                {
                    handObj.cards.map((cardObj) => (
                        <Card 
                            rank={cardObj.card.rank.name} 
                            suit={cardObj.card.suit.name} 
                            key={cardObj.card.id} 
                            initialIsFaceUp={cardObj.initialIsFaceUp}
                            dealDelay={cardObj.dealDelay}
                            canPlayerFlip={canPlayerFlip}
                        />
                    ))
                }
            </div>
            {
                (handObj.hand === null)
                    ? null 
                    : (
                        <div>
                            <div>Bet: {handObj.bet}</div>
                        </div>
                    )
            }
        </div>
    );
}

export default Hand;
