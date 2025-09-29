import Style from "./NoteCategoriesList.module.css";
import { useState } from "react";

function CategoriesList({categories, setCategories}) { // {} servono per destructuring delle prop

    const [inputValue, setInputValue] = useState("");

    // Aggiunge una categoria all'array
    const addCategory = () => {
        if (inputValue.trim() && !categories.includes(inputValue.trim())) { // trim per rimuovere spazi bianchi extra
        setCategories([...categories, inputValue.trim()]);
        setInputValue(""); // Pulisce il campo dopo l'aggiunta
        }
    };

    const removeCategory = (category) => {
        setCategories(categories.filter((c) => c !== category)); // lascia stare solo le categorie con valore !== da category
    };


    return (
        <div className={Style.all}>
            <h2 className={Style.title}>Categorie</h2>

            {/* Input e bottone */}
            <div className={Style.textContainer}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Aggiungi una categoria..."
                />
                <button onClick={addCategory}>+ Aggiungi</button>
            </div>

            {/* Lista categorie */}
            <div className={Style.list}>
                {categories && categories.length>0 && categories.map((category, index) => ( // controllo prima se esiste
                    <div>
                        {category + " "}
                        <button onClick={() => removeCategory(category)} className={Style.removeCategory}>
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoriesList;