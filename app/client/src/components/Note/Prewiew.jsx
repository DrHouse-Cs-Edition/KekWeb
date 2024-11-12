import React, { useEffect } from 'react';
import Trash from './Trash.png'
import Style from "./Prewiew.module.css";
import { marked } from 'marked';
// import DOMPurify from 'dompurify'; lo mettiamo?

function Prewiew({id, title, text, date, handleDelete, handleClick}) {
/*
  const [noteText, setNoteText] = useState('');

  useEffect(() => { // possibile alternativa: usare OnChange()?
    
  }, []);  // funzione viene applicato ogni volta che cambia noteText*/

  const marker = (txt) =>{
    if(txt != '' && txt != null){
      //txt = txt.substring(0,200) + "...";
      txt = marked.parse(txt);
      txt = txt.replace("<p>","");
      txt = txt.replaceAll("</p>","");
      txt = txt.replaceAll("<p>","<br>");
      return txt;
    }
    else return ('');
    //document.getElementById('outputText').innerHTML = txt;
  }
/*
  useEffect(() => {
    marker(text);
  }, []);*/

  return (
    <>

      <div className={Style.div}>
        <h1>{title}</h1>
        <p>id: {id}</p>
        <p dangerouslySetInnerHTML={ {__html: marker(text)} } ></p>
        <p>ultima modifica: {date}</p>
        <button onClick={handleClick}>Open</button>
        <img src={Trash} alt='trash bin' className={Style.bin} onClick={ ()=>handleDelete() }></img>
      </div>
    </>
  );
}

export default Prewiew;