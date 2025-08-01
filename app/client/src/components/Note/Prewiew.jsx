// import React, { useEffect } from 'react';
import Trash from './Trash.png'
import Style from "./Prewiew.module.css";
import { marked } from 'marked';
// import DOMPurify from 'dompurify'; lo mettiamo?

function Prewiew({id, title, categories, text, modified, handleDelete, handleClick}) {

  const marker = (txt) =>{
    if(txt != '' && txt != null){
      txt = txt.substring(0,200) + "...";
      txt = marked.parse(txt);
      txt = txt.replace("<p>","");
      txt = txt.replaceAll("</p>","");
      txt = txt.replaceAll("<p>","<br>");
      return txt;
    }
    else return ('');
    //document.getElementById('outputText').innerHTML = txt;
  }

  return (
    <>
      <div className={Style.div}>
        <h1 className={Style.title}>{title}</h1>
        <p className={Style.categories}>categorie: { categories?.map( (cat,index)=> (index+1 < categories.length)? cat+", " : cat ) } </p>
        <p className={Style.text} dangerouslySetInnerHTML={ {__html: marker(text)} } ></p>
        <p className={Style.date}>ultima modifica: {modified? modified.ToLocaleDateString() : null}</p>
        <button className={Style.button} onClick={handleClick}>Open</button>
        <img src={Trash} alt='trash bin' className={Style.bin} onClick={ ()=>handleDelete() }></img>
      </div>
    </>
  );
}

export default Prewiew;