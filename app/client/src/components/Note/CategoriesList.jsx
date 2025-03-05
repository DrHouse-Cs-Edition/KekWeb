// import Style from "./categories.module.css";
import { useState } from "react";

function CategoriesList(categories, setCategories) {

    const [inputValue, setInputValue] = useState("");

    // Aggiunge una categoria all'array
    const addCategory = () => {
        if (inputValue.trim() && categories.length>0 && !categories.includes(inputValue.trim())) { // trim per rimuovere spazi bianchi extra
        setCategories([...categories, inputValue.trim()]);
        setInputValue(""); // Pulisce il campo dopo l'aggiunta
        }
    };

    const removeCategory = (category) => {
        setCategories(categories.filter((c) => c !== category)); // lascia stare solo le categorie con valore !== da category
    };


    return (
        <div>
            <h2>Categorie</h2>

            {/* Input e bottone */}
            <div className="flex gap-2">
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Aggiungi una categoria..."
                />
                <button onClick={addCategory} className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                    Aggiungi
                </button>
            </div>

            {/* Lista categorie */}
            <div>
                {categories && categories.length && categories.map((category, index) => ( // controllo prima se esiste
                    <div key={index}>
                        {category}
                        <button onClick={() => removeCategory(category)}>
                            ✕
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default CategoriesList;