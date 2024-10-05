import React, { useState } from 'react';
//import { marked } from 'marked';
import Prewiew from '../components/Note/Prewiew.jsx';
//import './Note_navigation.css'

function NoteNavigation() {
  // Inizializziamo lo stato con un array di prova
  const [notes, setNotes] = useState([{id: "1", title: "TestNota", text: "provaprova123"}]); // iserisco prima nota di prova


  // Funzione per aggiungere un nuovo paragrafo
  const insertNotes = (string) => {
    setNotes([...notes,{id: "123", title: "NewNota", text: "added new nota!"}]); // ...notes = tutti gli elementi nell'array notes
  }

  const deleteNote = (index) => {
    setNotes((prevItems) => prevItems.filter((elem, i) => i !== index)); // prevItems = restituisce valore attuale (dato da setState)
    // filter = filtra tutti gli elementi che soddisfano condizione
  }

  return (
    <>
      <header>Note</header>
      <button onClick={insertNotes}>
        Aggiungi una nuova nota
      </button>

      <div>
        {notes.map( (note,index)=> <Prewiew id={note.id} title={note.title} text={note.text} handleDelete={()=>deleteNote(index)}></Prewiew> )}
      </div>
      <footer>Footer: Note V2.0</footer>
    </>
  );
  // array.map( (elem) => {funz} ) = funzione js che esegue "funz" una volta per ogni elemento "elem" dell'array
}

export default NoteNavigation;