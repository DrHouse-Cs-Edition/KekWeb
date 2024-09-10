import React, { useState, useEffect } from 'react';
import { marked } from 'marked'; // Correct import
import './Note.css'

function Note() {
  const [noteName, setNoteName] = useState(''); // utile perche con setNoteName cambia ogni istanza della variabile nel DOM con nuovo valore
  const [noteText, setNoteText] = useState('');
  const [outputText, setOutputText] = useState('Qui comparirà il markdown corrispondente');


  marked.setOptions({
    breakkggs: true,  // Converti `\n` in `<br>`
  });

  
  useEffect(() => { // possibile alternativa: usare OnChange()?
    //console.log(marked.getOptions());
    //console.log('NoteText:', noteText);
    //console.log('Textarea value:', JSON.stringify(noteText));
    
    marked.use({
      gfm: true,
      breaks: true,
    });
    

    let txt = marked.parse(noteText);
    console.log(txt) 
    txt = txt.replace("<p>",""); // elimino primo paragrafo
    txt = txt.replaceAll("</p>","");
    txt = txt.replaceAll("<p>","<br>"); // converto tutti altri in linea vuota
    document.getElementById('outputNota').innerHTML = txt; // setOutputText(txt); non va bene perché txt è in html
  }, [noteText]);  // funzione viene applicato ogni volta che cambia noteText
  
  const handleDelete = () => {
    setNoteText('');
    setOutputText('');
    removeNote();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText)
      .then(() => alert("Copied the text: " + noteText))
      .catch(err => console.error('Failed to copy text:', err));
  };
  //prende i dati della pagina e li invia al server perche siano salvati su mongoDB
  const handleSave = () => {
    if (getName()) {
      const note = {
        title: noteName,
        text: noteText,
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
        } else {
          alert("Failed to save note");
        }
      })
      .catch(err => console.error('Failed to save note:', err));
    }
  };

  const removeNote = () => {
    if (getName()) {
      fetch('http://localhost:5000/api/notes/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
        body: noteName,
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          alert(json.message);
        } else {
          alert("Failed to remove note");
        }
      })
      .catch(err => console.error('Failed to remove note:', err));
    }
  };
  // riceve dati dal server (li prende da mongoDB) e li carica sulla pagina.
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
          setNoteText(json.text);
          alert("Note loaded");
        } else {
          alert("Failed to load note");
        }
      })
      .catch(err => console.error('Failed to load note:', err));
    }
  };

  const getName = () => {
    if (!noteName) {
      alert("Insert a name");
      return false;
    }
    return true;
  };

  return (
    <>
        <header>Note</header>
        <input
          id="title"
          type="text"
          // value={noteName} // val iniziale è quello dentro noteName
          onChange={(e) => setNoteName(e.target.value)} // ogni volta che valore cambia => setNoteName(val aggiornato)
          placeholder="Inserisci titolo"
        />
        <button onClick={handleLoad}>Load</button>

        <div className="container">
            <textarea id="nota" className="text" placeholder="Scrivi qui la tua nota..." onChange={(e) => setNoteText(e.target.value)}></textarea>
            <p id="outputNota" className="output">{outputText}</p>
        </div>

        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleSave}>Save</button>
        <footer>Footer: Note V2.0</footer>
    </>
  );
}

export default Note;