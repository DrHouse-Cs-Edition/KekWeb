import { useState, useEffect } from 'react';
import { marked } from 'marked';
import style from "./Note.module.css";
import { useParams } from 'react-router-dom'; //per permettere di avere id come Parametro di percorso
import { useNavigate } from "react-router-dom";
import CategoriesList from '../components/NoteCategoriesList/NoteCategoriesList.jsx';
import { ArrowLeft } from "lucide-react";

function Note() {

  const navigate=useNavigate(); // useNavigate ritorna una funzione

  const { id } = useParams(); // id come Parametro di percorso ( Note/:id )

  const [noteName, setNoteName] = useState(''); // utile perché con setNoteName cambia ogni istanza della variabile nel DOM con nuovo valore
  const [noteText, setNoteText] = useState('');
  const [noteCategories, setNoteCategories] = useState([]);
  //const [noteLastModified,...]
  //const [noteCreatedAt,...]
  const [saved, setSaved] = useState(true); // se la nota è stata appena salvata
  const [editing, setEditing] = useState(false); // se sto editando la nota

  marked.setOptions({
    breakkggs: true,  // converte `\n` in `<br>` IN TEORIA
  });

  
  useEffect(() => { // possibile alternativa: usare OnChange()?
    let txt = marked.parse(noteText, { gfm: true, breaks: true } );
    document.getElementById('outputText').innerHTML = txt; // usare variabile useState(tipo "setOutputText") non va bene perché txt è in html
  }, [noteText]);  // funzione viene applicata ogni volta che cambia noteText
  
  const handleDelete = () => {

    if (!window.confirm("Sei sicuro di voler eliminare la tua nota?")) {
      return;
    }

    fetch('http://localhost:5000/api/notes/remove/' + id, {
      method: 'DELETE',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      }
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        navigate(`/noteNavigation`); // torno alle note
      } else {
        alert(json.message);
      }
    })
    .catch(err => console.error('Failed to remove note:', err));
    
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText)
      .then(() => {/*alert("Testo copiato su appunti")*/})
      .catch(err => console.error('Errore durante la copia:', err));
  };

  //prende i dati della pagina e li invia al server perché siano salvati su mongoDB
  const handleSave = async () => {
    if (getName()) { // se c'é un titolo

      let date = null;
      // prendo data dal server
      const response = await fetch('http://localhost:5000/api/timeMachine/date', {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
      });
      const json = await response.json();
      date = new Date(json.date);

      const note = {
        title: noteName.trim(),
        categories: noteCategories,
        text: noteText,
        lastModified: date.toISOString(), // Use current date in ISO format
      };

      try{
        const response = await fetch('http://localhost:5000/api/notes/update/' + id, {
          method: 'PUT',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json; charset=UTF-8',
          },
          body: JSON.stringify(note)
        });
        const json = await response.json();
        if (json.success){
          // alert("Nota salvata");
          setSaved(true);
        }
        else
          alert(json.message);
      }catch(err){
        console.error('Failed to save note:', err)
      };
    }
    else{
      alert("per salvare la nota devi inserire un titolo")
    }
  };

  // riceve dati dal server (li prende da mongoDB) e li carica sulla pagina.
  const handleLoad = () => {
    fetch(`http://localhost:5000/api/notes/load/` + id, {
      method: 'GET',
      credentials: 'include',
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


  const resizeTextarea = () => {
    const textarea = document.getElementById("noteText");
    textarea.style.height = "auto"; // reset altezza
    textarea.style.height = (textarea.scrollHeight+5) + "px"; // altezza contenuto (+3px per eliminare scrollbar)
  }

  const returnNoteNavigation = () =>{
    if(!saved){
      const result = window.confirm("Sicuro di voler uscire senza salvare?");
      if (result) {
        navigate("/noteNavigation");
      }
    }else {
      navigate("/noteNavigation");
    }
    
  }

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();  // Chiamare la funzione al caricamento del componente
  }, []);

  useEffect(() => {
    if(editing){
      resizeTextarea();
      setSaved(false);
    }
  }, [noteText]); // anche al caricamento pagina (perché handleLoad cambia noteText)

  useEffect(() => { // intercetto Ctrl + s
    const handleKeyDown = (event) => {
      if ((event.ctrlKey || event.metaKey) && event.key === "s") { // windows/linux o mac
        event.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown); // aggiungo eventListener pressione tastiera
    return () => {
      window.removeEventListener("keydown", handleKeyDown); // cleanup
    };
  }, [noteName, noteText, noteCategories]); // devo ricrearlo ogni volta che valori cambiano

  return (
    <>
      
      <div className={style.contenent}>
        <header className={style.header}>
          <button
            className={`${style.button} ${style.returnButton}`}
            onClick={()=>returnNoteNavigation()}
            title="Ritorna alla navigazione note"
          >
            <ArrowLeft/>
          </button>
          <h1 className={style.headerTitle}>Note</h1>
        </header>
        
        <input
          id="noteName"
          classNameName={style.title}
          type="text"
          value={noteName} // val iniziale è quello dentro noteName
          onChange={(e) => setNoteName(e.target.value)} // ogni volta che valore cambia => setNoteName(val aggiornato)
        />

        <CategoriesList categories={noteCategories} setCategories={setNoteCategories}></CategoriesList>

        <div className= {style.container}>
          {editing && // solo se sto editando
          <textarea
            id="noteText"
            className={style.textareaMarkdown}
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => setEditing(false)} // exit when focus is lost
            autoFocus // focus quando viene renderizzato
            onFocus={(e) => { // muovo il cursore alla fine
              const len = e.target.value.length;
              e.target.setSelectionRange(len, len); // inizio e fine selection
            }}
          >
          </textarea>
          }
          <p id="outputText"
            className={style.output}
            onClick={() => setEditing(true)}
          >
          </p>
        </div>

        <div>
          <button className= {style.button} onClick={handleDelete}>Elimina</button>
          <button className= {style.button} onClick={handleCopy}>Copia su appunti</button>
          <button className= {saved? style.usedButton : style.button} title="Scorciatoia: Ctrl+S" onClick={handleSave}>{saved? "Salvato" : "Salva modifiche"}</button>
        </div>
      </div>
    </>
  );
}

export default Note;