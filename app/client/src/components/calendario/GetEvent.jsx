import React, { useState, useEffect } from 'react';
//import Style from "./GetEvent.module.css";
import { useParams } from 'react-router-dom'; //per permettere di avere id come Parametro di percorso
import { useNavigate } from "react-router-dom";

const EventForm = () => {

  const { id } = useParams(); // id come Parametro di percorso ( Note/:id )

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

  const handleUpdate = (e) => {
      fetch('http://localhost:5000/api/event/update/' + id, {
          method: 'PUT',
          headers: {
          'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify(evento)
      })
      .then(response => response.json())
      .then(json => {
          if (!json.success)
          alert(json.message);
      })
      .catch(err => console.error('Failed to save event: ', err));
  };

  const handleRemove = (index) => {
      fetch('http://localhost:5000/api/event/remove/' + evento[index].id, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        }
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          handleAllEvents(); // ricarico tutti eventi (o elimino solo questo in locale?) ?????????????????????????????????
        } else {
          alert(json.message);
        }
      })
      .catch(err => console.error(err));
  };

  const handleLoad = () => {
      fetch(`http://localhost:5000/api/events/load/` + id, {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          // CARICA INFO EVENTO OTTENUTO CON ID !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

        } else {
          alert(json.message);
        }
      })
      .catch(err => console.error('error while loading events:' + err));
  };

  const handleAllEvents = () => {
      fetch('http://localhost:5000/api/events/all' , {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          // loadevents(json.list); // crea funzione che carica tutti eventi sulla pagina !!!!!!!!!!!!!!!!!!!
        } else {
          alert(json.messge);
        }
      })
      .catch(err => console.error(err));
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