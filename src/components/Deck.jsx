import './Deck.scss';

/** React component for single Deck instance. */
function Deck() {
    return (
        <div id='deck' className='deck hand'>
            <div className='card card-back'></div>
        </div>
    );
}

export default Deck;
