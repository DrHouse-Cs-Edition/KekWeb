import React, { useState, useEffect } from 'react';
import { marked } from 'marked';
import Style from "./Note.module.css";
import { useParams } from 'react-router-dom'; //per permettere di avere id come Parametro di percorso
import { useNavigate } from "react-router-dom";
import CategoriesList from '../components/Note/CategoriesList.jsx';

function Note() {

  const navigate=useNavigate(); // useNavigate ritorna una funzione

  const { id } = useParams(); // id come Parametro di percorso ( Note/:id )

  const [noteName, setNoteName] = useState(''); // utile perché con setNoteName cambia ogni istanza della variabile nel DOM con nuovo valore
  const [noteText, setNoteText] = useState('');
  const [noteCategories, setNoteCategories] = useState([]);
  //const [noteLastModified,...]
  //const [noteCreatedAt,...]

  marked.setOptions({
    breakkggs: true,  // converte `\n` in `<br>` IN TEORIA
  });

  
  useEffect(() => { // possibile alternativa: usare OnChange()?

    marked.use({ // anche questo converte `\n` in `<br>` IN TEORIA
      gfm: true,
      breaks: true,
    });
    
    let txt = marked.parse(noteText);
    txt = txt.replace("<p>",""); // elimino primo paragrafo
    txt = txt.replaceAll("</p>","");
    txt = txt.replaceAll("<p>","<br>"); // converto tutti altri in linea vuota
    document.getElementById('outputText').innerHTML = txt; // usare variabile useState(tipo "setOutputText") non va bene perché txt è in html
  }, [noteText]);  // funzione viene applicata ogni volta che cambia noteText
  
  const handleDelete = () => {
    fetch('http://localhost:5000/api/notes/remove/' + id, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        alert(json.message);
        navigate(`/noteNavigation`); // torno alle note
      } else {
        alert(json.message);
      }
    })
    .catch(err => console.error('Failed to remove note:', err));
    
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText)
      .then(() => alert("Testo copiato su appunti"))
      .catch(err => console.error('Errore durante la copia:', err));
  };

  //prende i dati della pagina e li invia al server perché siano salvati su mongoDB
  const handleSave = () => {
    if (getName()) { // se c'é un titolo
      const note = {
        title: noteName.trim(),
        categories: noteCategories,
        text: noteText,
        lastModified: new Date().toISOString(), // Use current date in ISO format
      };

      fetch('http://localhost:5000/api/notes/update/' + id, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(note)
      })
      .then(response => response.json())
      .then(json => {
        if (!json.success)
          alert(json.message);
      })
      .catch(err => console.error('Failed to save note:', err));
    }
    else{
      alert("per salvare la nota devi inserire un titolo")
    }
  };

  // riceve dati dal server (li prende da mongoDB) e li carica sulla pagina.
  const handleLoad = () => {
    fetch(`http://localhost:5000/api/notes/load/` + id, {
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        setNoteName(json.title);
        setNoteText(json.text);
        setNoteCategories(json.categories)
      } else {
        alert(json.message);
      }
    })
    .catch(err => console.error('error while loading note:' + err));
  };

  const getName = () => {
    if (noteName)
      return true;
    else
      return false;
  };

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();  // Chiamare la funzione al caricamento del componente
  }, []);

  return (
    <>
        <header>Note</header>
        
        <input
          id="noteName"
          classNameName={Style.title}
          type="text"
          value={noteName} // val iniziale è quello dentro noteName
          onChange={(e) => setNoteName(e.target.value)} // ogni volta che valore cambia => setNoteName(val aggiornato)
        />

        <CategoriesList categories={noteCategories} setCategories={setNoteCategories}></CategoriesList>

        <div className= {Style.container}>
            <textarea id="noteText" className={Style.text} value={noteText} onChange={(e) => setNoteText(e.target.value)}></textarea>
            <p id="outputText" className={Style.output}></p>
        </div>

        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleSave}>Save</button>
        <footer>Footer: Note V2.0</footer>
    </>
  );
}

export default Note;