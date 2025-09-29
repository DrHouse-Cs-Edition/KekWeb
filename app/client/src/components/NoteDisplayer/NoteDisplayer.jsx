import Style from "./NoteDisplayer.module.css";
import { useState, useEffect } from 'react';
import { marked } from 'marked';
import { Link } from "react-router-dom";
import { useNavigate } from "react-router-dom";

function NoteDisplayer() { // {} servono per destructuring delle prop

  const [note, setNote] = useState({id: null, title:"", categories: [], text: "", date: new Date()});
  const [foundNote, setFoundNote] = useState(false);
  const navigate = useNavigate();

  const handleLoad = (sorting) => {
    let requestUrl = 'http://localhost:5000/api/notes/last'
    fetch(requestUrl , {
      method: 'GET',
      credentials: 'include',
      headers: {
        'Content-Type': 'text/plain; charset=UTF-8',
      },
    })
    .then(response => response.json())
    .then(json => {
      if (json.success) {
        // se necessario accorcio testo
        var textPreview = "";
        if (json.text.length > 200)
          textPreview = json.text.substring(0,200) + "...";
        else
          textPreview = json.text;
        // set
        setNote({
          id: json.id,
          title: json.title,
          categories: json.categories || [], // se non arriva niente fallback []
          text: textPreview,
          date: new Date(json.lastModified),
        });
        setFoundNote(true);
      } else {
        // nessuna nota trovata (o errore)
        setFoundNote(false);
      }
    })
    .catch(err => console.error(err));
  };

  const handleClick = (id) =>{
    navigate(`/noteEditor/${id}`);
  };

  // useEffect esegue handleLoad una volta quando il componente viene montato
  useEffect(() => {
    handleLoad();
  }, []);

  if (foundNote){
    return (
        <div className={Style.container} onClick={() => handleClick(note.id)}>
            <div className={Style.header}>
                <h1 className={Style.headerTitle}>Ultima nota:</h1>
            </div>

            <div className={Style.body}>
                <h1 className={Style.title}>{note.title}</h1>
                <p className={Style.categories}>categorie: { note.categories?.map( (cat,index)=> (index+1 < note.categories.length)? cat+", " : cat ) } </p>
                <p className={Style.text} dangerouslySetInnerHTML={ { __html: marked.parse(note.text, { gfm: true, breaks: true }) } } ></p>
                <p className={Style.date}>ultima modifica: {note.date.toLocaleString()}</p>
            </div>
        </div>
    );
  }
  else{
    return <NoNote></NoNote>
  }
}

const NoNote = ()=>{
    return (
        <div className={Style.container}>
            <div className={Style.header}>
                <h1 className={Style.title}>Nessuna nota trovata</h1>
            </div>

            <div className={Style.body}>
                <p>
                    Non hai ancora creato alcuna nota. <br></br>
                    Vai alla pagina delle note e creane una se ti va!
                </p>
                <Link to={"/note"} className={Style.link}>Pagina delle note</Link>
            </div>
        </div>
    )
}

export default NoteDisplayer;