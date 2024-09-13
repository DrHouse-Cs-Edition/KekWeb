import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar.jsx';
import { marked } from 'marked'; // Correct import
import Prewiew from '../components/Note/Prewiew.jsx';
//import './Note_navigation.css'

function Note() {
  // Inizializziamo lo stato con un array di prova
  const [notes, setNotes] = useState([{id: "123", title: "NuovaNota", text: "provaprova123"}]);


  // Funzione per aggiungere un nuovo paragrafo
  const insertNotes = (string) => {
    setNotes([...notes,{id: "123", title: "NuovaNota", text: "provaprova123"}]);
  }

  return (
    <>
      <header>Note</header>
      <button onClick={insertNotes}>
        Aggiungi una nuova nota
      </button>

      <div>
        {notes.map( (note)=> <Prewiew id={note.id} title={note.title} text={note.text}></Prewiew> )}
      </div>
      <footer>Footer: Note V2.0</footer>
    </>
  );
}

export default Note;