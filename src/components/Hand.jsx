import Card from './Card';
import './Hand.scss';

function Hand({ handObj }) {
    return (
        <div className="hand">
            {
                handObj.cards.map((cardObj) => (
                    <Card 
                        rank={cardObj.card.rank.name} 
                        suit={cardObj.card.suit.name} 
                        key={cardObj.card.id} 
                        initialIsFaceUp={cardObj.initialIsFaceUp}
                        dealDelay={cardObj.dealDelay}
                    />
                ))
            }
        </div>
    );
}

export default Hand;
