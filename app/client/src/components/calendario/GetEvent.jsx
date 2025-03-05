import React, { useState, useEffect } from 'react';
//import Style from "./GetEvent.module.css";
import { useParams } from 'react-router-dom'; //per permettere di avere id come Parametro di percorso
import { useNavigate } from "react-router-dom";

function EventForm() {
    const [evento, setEvento] = useState({
        title: "",
        description: "",
        location: "",
    });
  
    // Funzione per aggiornare lo stato
    const handleChange = (e) => { // cambiamento di un qualsiasi attributo
        const { name, value } = e.target; // name = input name
        setEvento((prev) => ({
            ...prev, // inserisce i valori precedenti
            [name]: value, // ma cambia il valore di [attr] (in react [attr] = chiave il cui nome è "attr")
        }));
    };
  
    // Funzione per inviare il form
    const handleSave = (e) => {
        e.preventDefault();
    
        fetch('http://localhost:5000/api/events/save', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(evento),
        })
        .then(response => response.json())
        .then(json => {
            if (json.success) {
                alert(json.message);
            } else {
                alert(json.message);
            }
        })

    };
  
    return (
        <div>
            <h2>Crea un nuovo evento</h2>
            <form onSubmit={handleSave} /*className="flex flex-col gap-3"*/>
                <input
                    type="text"
                    name="title"
                    value={evento.title}
                    onChange={handleChange}
                    placeholder="Nome evento"
                    //className="border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="description"
                    value={evento.description}
                    onChange={handleChange}
                    placeholder="Descrizione"
                    //className="border p-2 rounded"
                    required
                />
                <input
                    type="text"
                    name="location"
                    value={evento.location}
                    onChange={handleChange}
                    placeholder="Luogo evento"
                    //className="border p-2 rounded"
                    required
                />
                <button type="submit" className="button">
                    Crea Evento
                </button>
            </form>
        </div>
    );
}

export default EventForm;