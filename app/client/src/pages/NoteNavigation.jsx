import React, { useState, useEffect } from 'react';
import Prewiew from '../components/Note/Prewiew.jsx';
import { useNavigate } from "react-router-dom";
import Style from './NoteNavigation.module.css'

function NoteNavigation() {

  const navigate = useNavigate(); // useNavigate ritorna solo una funzione, che poi va usata per navigare

  const [notes, setNotes] = useState([{id: "1", title: "TestNota", text: "provaprova123"}]);

  const [sortOption, setSortOption] = useState("");

  // Funzione per aggiornare la visualizzazione note
  const loadNotes = (newNotesArray) => {
    setNotes([...newNotesArray.map(note => ({
      id: note._id,
      categories: note.categories,
      title: note.title,
      text: note.text,
      createdAt: note.createdAt,
      lastModified: note.lastModified
      }))
    ]);
  }

  const deleteNote = (index) => { // cancela solo visivamente
    setNotes((prevItems) => prevItems.filter((elem, i) => i !== index)); // prevItems = restituisce valore attuale (dato da setState)
    // filter = filtra tutti gli elementi che soddisfano condizione
  }

  const handleSortChange = (event) => {  // Quando un utente seleziona un'opzione nel <select>, il browser genera un evento che contiene informazioni sull'azione compiuta
    const value = event.target.value;
    setSortOption(value); // è importante che il value nel select (html) sia il valore che vogliamo mettere nella variabile sortOption (js react) 
    handleLoad(value);
  };

  // API

  const handleRemove = (index) => {
    fetch('http://localhost:5000/api/notes/remove/' + notes[index].id, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        deleteNote(index); // rimuove solo l'eliminato, non ricarica tutto
      } else {
        alert(json.message);
      }
    })
    .catch(err => console.error(err));
  };

  // riceve dati dal server (li prende da mongoDB) e li carica sulla pagina.
  const handleLoad = (sorting) => {
    let requestUrl = 'http://localhost:5000/api/notes/all'
    if( sorting && sorting.localeCompare("") != 0)
      requestUrl = 'http://localhost:5000/api/notes/all' + '?sort=' + sorting;
    fetch(requestUrl , {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        loadNotes(json.list); // aggiorna tutte note html
      } else {
        alert(json.messge);
      }
    })
    .catch(err => console.error(err));
  };

  //prende i dati della pagina e li invia al server perché siano salvati su mongoDB
  const handleAdd = () => {
    const time =  new Date().toISOString();
    const note = {
      title: "insert title",
      categories: [],
      text: "",
      createdAt: time, // Use current date in ISO format
      lastModified: time,
      // user
    };

    fetch('http://localhost:5000/api/notes/save', {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(note),
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        openNote(json.id); // devo rifare richiesta al server perché l'id lo crea mongoDB
      } else {
        alert(json.message);
      }
    })
    .catch(err => console.error(err));
  };

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();  // Chiamare la funzione al caricamento del componente
  }, []);

  const openNote = (id)=>{
    navigate(`/noteEditor/${id}`);
  }

  return (
    <>
      <img
        src="sfondo.jpg" 
        /*alt="sfondo (tramonto su città)" */c
        className={Style.background}
      />

      <div className={Style.contenent}>

        <header className={Style.title}>Note</header>

        <select className={Style.selecto} value={sortOption} onChange={handleSortChange}>
          <option value="">Seleziona...</option>
          <option value="asc">Alfabetico A-Z</option>
          <option value="desc">Alfabetico Z-A</option>
          <option value="date">Per data</option>
          <option value="length">Per lunghezza</option>
        </select>

        <button onClick={()=>handleAdd()}>
          Aggiungi nota
        </button>

        <div>
          {notes.map( (note,index)=> <Prewiew id={note.id} title={note.title} categories={note.categories} text={note.text} modified={note.lastModified} handleDelete={()=>handleRemove(index)} handleClick={()=>openNote(note.id)}></Prewiew> )}
        </div>

      </div>
    </>
  );
  // array.map( (elem) => {funz} ) = funzione js che esegue "funz" una volta per ogni elemento "elem" dell'array
}

export default NoteNavigation;