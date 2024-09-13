import React, { useState, useEffect } from 'react';
import Trash from './Trash.png'
import { marked } from 'marked'; // Correct import
import './Prewiew.css'

function Prewiew({id, title, text}) {
/*
  const [noteText, setNoteText] = useState('');

  useEffect(() => { // possibile alternativa: usare OnChange()?
    
  }, []);  // funzione viene applicato ogni volta che cambia noteText*/
  

  return (
    <>

      <div className='prediv'>
        <h1>{title}</h1>
        <p>{id} {text}</p>
        <img src={Trash}></img>
      </div>
    </>
  );
}

export default Prewiew;