import React, { useState, useEffect } from 'react';
import Trash from './Trash.png'
import { marked } from 'marked'; // Correct import
//import './Prewiew.css'

function Prewiew({title, text}) {
/*
  const [noteText, setNoteText] = useState('');

  useEffect(() => { // possibile alternativa: usare OnChange()?
    
  }, []);  // funzione viene applicato ogni volta che cambia noteText*/
  

  return (
    <>

        <h1>TITOLO</h1>
        <div>testo testo testo</div>
        <img src={Trash}></img>
    </>
  );
}

export default Prewiew;