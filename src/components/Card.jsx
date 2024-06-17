import { useEffect, useRef, useState } from 'react';
import './Card.scss';

/**
 * @typedef {Object} DeltaPosition
 * @property {number} x - Difference in pixels in x-direction
 * @property {number} y - Difference in pixels in y-direction
 */

/** Enum class for state of Card component flipping over. */
class CardFlipState {
    static Front = new CardFlipState('front');
    static Back = new CardFlipState('back');
    static TurningToFront = new CardFlipState('turningToFront');
    static TurningToBack = new CardFlipState('turningToBack');

    constructor(name) {
        this.name = name;
    }
}

/** Enum class for state of Card component being dealt from Deck to PlayerHand components. */
class CardDealState {
    static Initial = new CardDealState('initial');
    static Dealing = new CardDealState('dealing');
    static Complete = new CardDealState('complete');

    constructor(name) {
        this.name = name;
    }
}

/** React component for single Card instance. */
function Card({ rank, suit, initialIsFaceUp = true, dealDelay = 0 }) {
    /** State of Card being dealt. */
    const [cardDealState, setCardDealState] = useState(CardDealState.Initial);

    /** State of Card being flipped over. */
    const [cardFlipState, setCardFlipState] = useState(
        initialIsFaceUp ? CardFlipState.Front : CardFlipState.Back
    );

    /** Reference to Card element to apply transform to style. */
    const cardElementRef = useRef(null);

    /**
     * When Card is first rendered, it's Deal state is Initial and is rendered 
     * as an empty element in it's final position in some Hand component.
     * When useEffect is first run OnComponentMount, it first applies the 
     * translation transform so the Card is on top of the Deck element
     * AND a transtion delay style property to delay the Card being dealt to
     * avoid all Cards being dealt at once.
     * The first useEffect also sets a timeout (using a delay from the props) 
     * that changes the Deal state to Dealing.
     * Once the deal state is changed to Dealing, the useEffect is run again
     * and sets the translation transform to none, causing the Card element to
     * transition from the Deck to it's final element position in some Hand
     * component.
     */
    useEffect(() => {
        if (cardDealState === CardDealState.Initial) {
            const delta = getDeckDeltaPosition();

            cardElementRef.current.style.transform = `translate(-${delta.x}px, -${delta.y}px)`;
            cardElementRef.current.style.transitionDelay = `${dealDelay}ms`;

            setTimeout(() => {
                setCardDealState(CardDealState.Dealing);
            }, dealDelay);
        } else if (cardDealState === CardDealState.Dealing) {
            cardElementRef.current.style.transform = 'none';
        }
    }, [cardDealState, dealDelay]);

    /**
     * Returns object with x and y differences in distance from Deck element 
     * and Card's final element position in Player's hand.
     * @returns {DeltaPosition}
     */
    const getDeckDeltaPosition = function () {
        /** Reference to Deck element in DOM */
        const deckElement = document.getElementById('deck');

        // If NO Deck element NOR Card element, return zero delta positions
        if (!deckElement || (cardElementRef.current === null)) {
            return { x: 0, y: 0 };
        }

        /** ClientRect of Deck element */
        const deckClientRect = deckElement.getBoundingClientRect();

        /** ClientRect of Card element */
        const cardClientRect = cardElementRef.current.getBoundingClientRect();

        // Return differences in x,y positions using ClientRects of Deck and Card
        return {
            x: cardClientRect.x - deckClientRect.x,
            y: cardClientRect.y - deckClientRect.y
        };
    };

    /**
     * Returns ReactElement of Card when in Front or Back flip state.
     * @param {boolean} isFaceUp 
     * @returns {React.ReactElement}
     */
    const renderFrontBackState = function (isFaceUp = true) {
        const nextState = (cardFlipState === CardFlipState.Back)
            ? CardFlipState.TurningToFront
            : CardFlipState.TurningToBack;

        return (
            <div
                ref={cardElementRef}
                className={isFaceUp ? `card ${rank} ${suit}` : 'card card-back'}
                onClick={() => setCardFlipState(nextState)}
            ></div>
        );
    };

    /**
     * Returns ReactElement of Card when in TurningToFront flip state.
     * @returns {React.ReactElement}
     */
    const renderTurningToFrontState = function () {
        return (
            <div
                className={`card ${rank} ${suit}`}
                onTransitionEnd={() => setCardFlipState(CardFlipState.Front)}
            >
                <div
                    style={{ transform: 'rotateY(180deg)' }}
                    className='card card-back'
                ></div>
            </div>
        );
    };

    /**
     * Returns ReactElement of Card when in TurningToBack flip state.
     * @returns {React.ReactElement}
     */
    const renderTurningToBackState = function () {
        return (
            <div
                style={{ transform: 'rotateY(180deg)' }}
                className={`card ${rank} ${suit}`}
                onTransitionEnd={() => setCardFlipState(CardFlipState.Back)}
            >
                <div
                    style={{ transform: 'rotateY(180deg)', transition: 'none' }}
                    className='card card-back'
                ></div>
            </div>
        );
    };

    /**
     * Returns ReactElement of Card.
     * @returns {React.ReactElement}
     */
    const render = function () {
        // If Card deal state is Initial, render empty Card element before it's dealt
        if (cardDealState === CardDealState.Initial) {
            return (<div ref={cardElementRef}></div>);
        }

        // Else render Card based on flip state
        switch (cardFlipState) {
            case CardFlipState.Front:
                return renderFrontBackState(true);
            case CardFlipState.TurningToFront:
                return renderTurningToFrontState();
            case CardFlipState.TurningToBack:
                return renderTurningToBackState();
            case CardFlipState.Back:
            default:
                return renderFrontBackState(false);
        }
    };

    return render();
}

export default Card;
