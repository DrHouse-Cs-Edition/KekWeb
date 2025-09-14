// import React, { useEffect } from 'react';
import Trash from './Trash.png'
import Style from "./Prewiew.module.css";
import { marked } from 'marked';
import { Trash2 } from "lucide-react";
// import DOMPurify from 'dompurify'; lo mettiamo?

function Prewiew({id, title, categories, text, modified, handleDelete, handleClick}) {

  const marker = (txt) =>{
    if(txt != '' && txt != null){
      if(txt.length > 200)
        txt = txt.substring(0,200) + "...";
      txt = marked.parse(txt, { gfm: true, breaks: true } );
      return txt;
    }
    else return ('');
  }

  return (
    <>
      <div className={Style.div}>
        <h1 className={Style.title}>{title}</h1>
        <p className={Style.categories}>categorie: { categories?.map( (cat,index)=> (index+1 < categories.length)? cat+", " : cat ) } </p>
        <p className={Style.text} dangerouslySetInnerHTML={ {__html: marker(text)} } ></p>
        <p className={Style.date}>ultima modifica: {modified? modified.toLocaleString() : null}</p>
        <div className={Style.row}>
          <button className={Style.button} onClick={handleClick}>Open</button>
          <Trash2 className={Style.delete} onClick={ ()=>handleDelete() } />
        </div>
      </div>
    </>
  );
}

export default Prewiew;