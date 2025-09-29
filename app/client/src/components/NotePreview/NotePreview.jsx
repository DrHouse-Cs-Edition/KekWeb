// import React, { useEffect } from 'react';
import style from "./NotePreview.module.css";
import { marked } from 'marked';
import { Trash2, Copy } from "lucide-react";
// import DOMPurify from 'dompurify'; lo mettiamo?

function NotePreview({id, title, categories, text, modified, handleClick, handleClone, handleDelete }) {

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
      <div className={style.div} onClick={() => handleClick()}>
        <h1 className={title? style.title : style.noName}>{title? title : "no name"}</h1>
        <p className={style.categories}>categorie: { categories?.map( (cat,index)=> (index+1 < categories.length)? cat+", " : cat ) } </p>
        <p className={style.text} dangerouslySetInnerHTML={ {__html: marker(text)} } ></p>
        <p className={style.date}>ultima modifica: {modified? modified.toLocaleString() : "-"}</p>
        <div className={style.row}>
          <button onClick={ (e) => {e.stopPropagation(); handleClone();} } title="Clona la nota" className={style.button}>
            <Copy/>
          </button>
          <button onClick={ (e)=> {e.stopPropagation(); handleDelete()} } title="Elimina la nota" className={style.button}>
            <Trash2/>
          </button>
        </div>
      </div>
    </>
  );
}

export default NotePreview;