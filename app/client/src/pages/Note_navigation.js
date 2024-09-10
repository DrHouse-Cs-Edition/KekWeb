import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { marked } from 'marked'; // Correct import
import '../components/Note/Prewiew.js';
import Prewiew from '../components/Note/Prewiew.js';
//import './Note_navigation.css'

function Note() {
  // Inizializziamo lo stato con un array vuoto
  const [paragraphs, setParagraphs] = useState([]);
  const [notes, setNotes] = useState([{},{}]);


  // Funzione per aggiungere un nuovo paragrafo
  const handleClick = () => {
    // Aggiorniamo lo stato aggiungendo un nuovo paragrafo all'array
    setParagraphs([...paragraphs, `Paragrafo ${paragraphs.length + 1}`]); // ...paragraphs adds elem as single elems
  };
  const insertNotes = (string) => {
    
  }
  /*
  const handleLoad = () => {
    if (getName()) {
      fetch(`http://localhost:5000/api/notes/load?noteName=${noteName}`, {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          setNotes(json.text);
          alert("Note loaded");
        } else {
          alert("Failed to load note");
        }
      })
      .catch(err => console.error('Failed to load note:', err));
    }
  };
  */
  return (
    <>
      <Navbar></Navbar>
      <header>Note</header>
      <button onClick={handleClick}>
        Aggiungi un nuovo paragrafo
      </button>

      <div>
        {paragraphs.map((paragraph, index) => <p key={index}>{paragraph}</p> )}
        {notes.map( (note)=> <Prewiew id={note.id} title={note.title} text={note.text}></Prewiew> )}
      </div>
      <footer>Footer: Note V2.0</footer>
    </>
  );
}

export default Note;