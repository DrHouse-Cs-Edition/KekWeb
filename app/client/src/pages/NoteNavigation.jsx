import React, { useState, useEffect } from 'react';
import Prewiew from '../components/Note/Prewiew.jsx';
import { useNavigate } from "react-router-dom";
//import './Note_navigation.css'

function NoteNavigation() {

  const navigate = useNavigate(); // useNavigate ritorna solo una funzione, che poi va usata per navigare

  const [notes, setNotes] = useState([{id: "1", title: "TestNota", text: "provaprova123"}]);

  // Funzione per aggiungere un nuovo paragrafo alla visualizzazione
  const loadNotes = (newNotesArray) => {
    setNotes([...newNotesArray.map(note => ({
      id: note._id,
      title: note.title,
      text: note.text,
      date: note.date
      }))
    ]);
  }

  const deleteNote = (index) => {
    setNotes((prevItems) => prevItems.filter((elem, i) => i !== index)); // prevItems = restituisce valore attuale (dato da setState)
    // filter = filtra tutti gli elementi che soddisfano condizione
  }

  // MONGODB

  const handleRemove = (index) => {
    fetch('http://localhost:5000/api/notes/remove/' + notes[index].id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        alert(json.message);
        deleteNote(index); // rimuove solo l'eliminato, non ricarica tutto
      } else {
        alert("Failed to remove note");
      }
    })
    .catch(err => console.error('Failed to remove note:', err));
  };

  // riceve dati dal server (li prende da mongoDB) e li carica sulla pagina.
  const handleLoad = () => {
    fetch(`http://localhost:5000/api/notes/all`, {
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        loadNotes(json.list); // aggiorna tutte note html
        alert("Notes loaded");
      } else {
        alert("Failed to load notes");
      }
    })
    .catch(err => console.error('Failed to load notes:', err));
  };

  //prende i dati della pagina e li invia al server perché siano salvati su mongoDB
  const handleAdd = () => {
    const note = {
      title: "insert title",
      text: "",
      date: new Date().toISOString(), // Use current date in ISO format
    };

    fetch('http://localhost:5000/api/notes/save', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      },
      body: JSON.stringify(note),
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        alert(json.message);
        handleLoad(); // devo rifare richiesta al server perché l'id lo crea mongoDB
      } else {
        alert("Failed to save note");
      }
    })
    .catch(err => console.error('Failed to save note:', err));
  };

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();  // Chiamare la funzione al caricamento del componente
  }, []);

  const openNote = (id)=>{
    navigate(`/note/${id}`);
  }

  return (
    <>
      <header>Note</header>
      <button onClick={()=>handleAdd()}>
        Aggiungi nota
      </button>

      <div>
        {notes.map( (note,index)=> <Prewiew id={note.id} title={note.title} text={note.text} date={note.date} handleDelete={()=>handleRemove(index)} handleClick={()=>openNote(note.id)}></Prewiew> )}
      </div>
      <footer>Footer: Note V2.0</footer>
    </>
  );
  // array.map( (elem) => {funz} ) = funzione js che esegue "funz" una volta per ogni elemento "elem" dell'array
}

export default NoteNavigation;