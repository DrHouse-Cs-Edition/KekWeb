import { useState, useEffect } from 'react';
import NotePreview from '../components/NotePreview/NotePreview.jsx';
import { useNavigate } from "react-router-dom";
import style from './NoteNavigation.module.css'

function NoteNavigation() {

  const navigate = useNavigate(); // useNavigate ritorna solo una funzione, che poi va usata per navigare

  const [notes, setNotes] = useState([]);

  const [sortOption, setSortOption] = useState("");

  // Funzione per aggiornare la visualizzazione note
  const loadNotes = (newNotesArray) => {
    setNotes([...newNotesArray.map(note => ({
      id: note._id,
      categories: note.categories,
      title: note.title,
      text: note.text,
      createdAt: new Date(note.createdAt),
      lastModified: new Date(note.lastModified)
      }))
    ]);
  }

  const deleteNote = (index) => { // cancela solo visivamente
    setNotes((prevItems) => prevItems.filter((elem, i) => i !== index)); // prevItems = restituisce valore attuale (dato da setState)
    // filter = filtra tutti gli elementi che soddisfano condizione
  }

  const addNote = (note) => {
    setNotes(prevNotes => [note, ...prevNotes]); // in cima
  }

  const handleSortChange = (event) => {  // Quando un utente seleziona un'opzione nel <select>, il browser genera un evento che contiene informazioni sull'azione compiuta
    const value = event.target.value;
    setSortOption(value); // è importante che il value nel select (html) sia il valore che vogliamo mettere nella variabile sortOption (js react) 
    handleLoad(value);
  };

  const handleClone = async (index) => {
    if (!window.confirm("Sei sicuro di voler clonare la nota " + notes[index].title +"?")) {
      return;
    }
    const time = new Date(); // placeholder, in realtà AddNote prende data server e sovrescrive createdAt e lastModified
    let note = {
      title: notes[index].title,
      categories: notes[index].categories,
      text: notes[index].text,
      createdAt: time, // data diversa, resto uguale
      lastModified: time,
    };
    note = await saveNoteOnDB(note);
    if(note != null)
      addNote(note); // la mostra senza ricaricare pagina
  };

  const handleAdd = async () => {

    const time = new Date(); // in realtà AddNote prende data server e sovrescrive createdAt e lastModified
    let note = {
      title: "",
      categories: [],
      text: "",
      createdAt: time,
      lastModified: time,
    };
    note = await saveNoteOnDB(note);
    if(note != null)
      await openNote(note.id); // devo rifare richiesta al server perché l'id lo crea mongoDB
  };


  // API


  const handleDelete = (index) => {

    if (!window.confirm("Sei sicuro di voler eliminare la nota " + notes[index].title +"?")) {
      return;
    }

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
      if (json.success) // se ho trovato almeno una nota
        loadNotes(json.list); // aggiorna tutte note html
    })
    .catch(err => console.error(err));
  };

  //prende i dati della pagina e li invia al server perché siano salvati su mongoDB
  const saveNoteOnDB = async (note) => {
    // const time =  new Date();//.toISOString();
    const timeJSON = await fetch('http://localhost:5000/api/timeMachine/date', {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json; charset=UTF-8',
      }
    });
    const jsonData = await timeJSON.json();
    const time = new Date(jsonData.date);
    note.createdAt = time;
    note.lastModified = time;

    try{
      const response = await fetch('http://localhost:5000/api/notes/save', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(note),
      });
      const json = await response.json();
      if (!json.success){
        alert(json.message); // json = {success, message, id}
        return null;
      }
      else{
        note.id = json.id;
        return note;
      }
    }catch(err){
      console.log(err);
    }
  };

  // extra

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();  // Chiamare la funzione al caricamento del componente
  }, []);

  const openNote = (id)=>{
    navigate(`/note/${id}`);
  }

  return (
    <>
      <div className={style.contenent}>

        <header className={style.header}>Note</header>

        <select className={style.selectorNote} value={sortOption} onChange={handleSortChange}>
          <option value="">Ordina per...</option>
          <option value="asc">Alfabetico A-Z</option>
          <option value="desc">Alfabetico Z-A</option>
          <option value="date">Per data</option>
          <option value="length">Per lunghezza</option>
        </select>

        <div  className={style.addButtonWrapper}>
          <button className={style.addButton} onClick={()=>handleAdd()}>
            Aggiungi nota
          </button>
        </div>

        {/*
        <div  className={Style.addButtonWrapper}>
          <button className={[Style.addButton, Style.addButtonV2].join(" ")} onClick={()=>handleAdd()}>
            +
          </button>
        </div>*/}

        <div className={style.notesList}>
          {notes.map( (note,index)=> <NotePreview id={note.id} title={note.title} categories={note.categories} text={note.text} modified={note.lastModified} handleClick={()=>openNote(note.id)} handleClone={()=>handleClone(index)} handleDelete={()=>handleDelete(index)} ></NotePreview> )}
        </div>

      </div>
    </>
  );
  // array.map( (elem) => {funz} ) = funzione js che esegue "funz" una volta per ogni elemento "elem" dell'array
}

export default NoteNavigation;