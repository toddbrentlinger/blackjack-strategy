import { useState } from "react";
import Player from "../game/player";

const formDataInit = { name: '', bankroll: 0 };

/** React component to add new Player to game. */
function AddNewPlayer({ handleAddNewPlayer }) {
    /** State of form data to use controlled components. */
    const [formData, setFormData] = useState(formDataInit);

    /**
     * Event handler when add new player form is submitted.
     * @param {Event} e 
     */
    const handleAddNewPlayerFormSubmit = function(e) {
        e.preventDefault();

        // Create Player instance from form values in state variable
        const player = new Player(
            formData.name,
            formData.bankroll
        );
        
        // Pass new Player to method passed by props
        handleAddNewPlayer(player);

        // Reset form data by changing state to initial empty values
        setFormData(formDataInit);
    }

    /**
     * Event handler when input value in form is changed.
     * @param {Event} e 
     */
    const handleInputChange = function(e) {
        e.preventDefault();

        // Get name and value of input element
        const { name, value } = e.currentTarget;

        /**
         * Update name property of form data state with new value.
         * Make sure to convert certain values from string to number.
         */
        setFormData((prevFormData) => {
            return {
                ...prevFormData,
                [name]: (name === 'bankroll') ? +value : value
            };
        });
    };

    /**
     * Returns ReactElement of form to add new Player to game.
     * @returns {React.ReactElement}
     */
    const renderAddNewPlayerForm = function() {
        return (
            <form onSubmit={handleAddNewPlayerFormSubmit} action="" method="post">
                <label>
                    Name:
                    <input name="name" value={formData.name} onChange={handleInputChange} autoFocus={true} />
                </label>
                <label>
                    Bankroll:
                    <input type="number" name="bankroll" value={formData.bankroll} onChange={handleInputChange} />
                </label>
                <button>Add Player</button>
            </form>
        );
    };

    return renderAddNewPlayerForm();
}

export default AddNewPlayer;
