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
function Card({ rank, suit, initialIsFaceUp = true, dealDelay = 0, canPlayerFlip = true }) {
    /** State of Card being dealt. */
    const [cardDealState, setCardDealState] = useState(CardDealState.Initial);

    /** State of Card being flipped over. */
    const [cardFlipState, setCardFlipState] = useState(CardFlipState.Back);

    /** Reference to Card element to apply transform to style. */
    const cardElementRef = useRef(null);

    /** Reference to card back translating from one DOM position to another. */
    const translatingCardElementRef = useRef(null);

    /** Reference to timeout used for Card component. */
    const timeoutId = useRef(null);

    // Hooks - useEffect

    // OnComponentUnmount
    useEffect(() => {
        // Clear timeout in case it's currently running when component unmounts
        return () => {
            clearTimeout(timeoutId.current);
        };
    }, []);

    /**
     * Dealing useEffect:
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
            
            // Translate card back to deck position without transition (instant translation)
            translatingCardElementRef.current.style.transition = 'none';
            translatingCardElementRef.current.style.transform = `translate(${delta.x}px, ${delta.y}px)`;
            
            /**
             * Translating card back is initially hidden to avoid transition 
             * into initial deck postion from final position. After card back 
             * is positioned into deck position, make visible in preparation of
             * next translation into final card position in Player hand.
             */
            translatingCardElementRef.current.style.visibility = 'visible';

            // Change deal state to 'Dealing' after delay
            timeoutId.current = setTimeout(() => {
                setCardDealState(CardDealState.Dealing);
            }, dealDelay);
        } else if (cardDealState === CardDealState.Dealing) {
            // Set style properties to make card back transition from deck to Player hand
            translatingCardElementRef.current.style.transition = '';
            translatingCardElementRef.current.style.transform = 'none';
            
            // Add event listener to translating card to change properties when transition ends
            translatingCardElementRef.current.addEventListener('transitionend', () => {
                // Hide translating card once it transitions to final position in Player hand
                translatingCardElementRef.current.style.visibility = 'none';
                
                // Once transition ends, set deal state to 'Complete' to render final card in Player hand
                setCardDealState(CardDealState.Complete);
            });
        } else { // Else any deal state NOT 'Initial' OR 'Dealing'
            // If card is initially supposed to be face up, turn face up now
            if (initialIsFaceUp) {
                setCardFlipState(CardFlipState.TurningToFront);
            }
        }
    }, [cardDealState, dealDelay, initialIsFaceUp]);

    // Flipping useEffect
    useEffect(() => {
        if (cardFlipState === CardFlipState.TurningToFront) {
            cardElementRef.current.style.transform = 'rotateY(180deg)';
        } else if (cardFlipState === CardFlipState.TurningToBack) {
            cardElementRef.current.style.transform = 'rotateY(-180deg)';
        }
    }, [cardFlipState]);

    // Methods

    /**
     * Callback function for User clicking on card to flip.
     * @param {Event} e - Event object that occurred on the card
     * @param {CardFlipState} nextState - Next CardFlipState to change the state of the card
     */
    const handleFlipClick = function(e, nextState) {
        e.preventDefault();

        if (!canPlayerFlip) { return; }

        setCardFlipState(nextState);
    };

    /**
     * Returns object with x and y differences in distance from Deck element 
     * and Card's final element position in Player's hand.
     * @returns {object} obj
     * @returns {number} obj.x - Difference in x coordinate of DOM from Deck to final card position
     * @returns {number} obj.y - Difference in y coordinate of DOM from Deck to final card position
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
            x: deckClientRect.x - cardClientRect.x,
            y: deckClientRect.y - cardClientRect.y
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
                style={{ 
                    transition: 'none',
                    transform: 'none',
                }}
                className={isFaceUp ? `card ${rank} ${suit}` : 'card card-back'}
                onClick={(e) => handleFlipClick(e, nextState)}
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
                ref={cardElementRef}
                className='card card-back flipping-card-back'
                onTransitionEnd={() => setCardFlipState(CardFlipState.Front)}
            >
                <div
                    style={{ 
                        //transition: 'none',
                        transform: 'rotateY(180deg)',
                        backfaceVisibility: 'hidden', 
                    }}
                    className={`card ${rank} ${suit}`}
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
                ref={cardElementRef}
                style={{ 
                    //transform: 'rotateY(180deg)',
                    backfaceVisibility: 'hidden',
                }}
                className={`card ${rank} ${suit}`}
                onTransitionEnd={() => setCardFlipState(CardFlipState.Back)}
            >
                <div
                    style={{ 
                        transform: 'rotateY(180deg)', 
                        transition: 'none',
                    }}
                    className='card card-back flipping-card-back'
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
        if (cardDealState !== CardDealState.Complete) {
            return (
                <div 
                    ref={cardElementRef} 
                    className='card'
                    style={{
                        visibility: 'hidden'
                    }}
                >
                    <div
                        ref={translatingCardElementRef}
                        className='card card-back'
                        style={{
                            visibility: 'hidden'
                        }}
                    ></div>
                </div>
            );
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
