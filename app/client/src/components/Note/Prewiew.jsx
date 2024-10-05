//import React, { useState, useEffect } from 'react';
import Trash from './Trash.png'
//import { marked } from 'marked'; // Correct import
import Style from "./Prewiew.module.css";

function Prewiew({id, title, text, handleDelete}) {
/*
  const [noteText, setNoteText] = useState('');

  useEffect(() => { // possibile alternativa: usare OnChange()?
    
  }, []);  // funzione viene applicato ogni volta che cambia noteText*/

  return (
    <>

      <div className={Style.div}>
        <h1>{title}</h1>
        <p>{id} {text}</p>
        <img src={Trash} alt='trash bin' className={Style.bin} onClick={ ()=>handleDelete() }></img>
      </div>
    </>
  );
}

export default Prewiew;