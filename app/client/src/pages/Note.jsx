import React, { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import { marked } from 'marked'; // Correct import
import './Note.css'

function Note() {
  const [noteName, setNoteName] = useState('test1');
  const [noteText, setNoteText] = useState('');
  const [outputText, setOutputText] = useState('');

  useEffect(() => {
    console.log('NoteText:', noteText);
    setOutputText(marked.parse(noteText));
  }, [noteText]);
  
  console.log('OutputText:', outputText);
  
  const handleDelete = () => {
    setNoteText('');
    setOutputText('');
    removeNote();
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(noteText)
      .then(() => alert("Copied the text: " + noteText))
      .catch(err => console.error('Failed to copy text:', err));
  };

  const handleSave = () => {
    if (getName()) {
      const note = {
        title: noteName,
        text: noteText,
        date: new Date().toISOString(), // Use current date in ISO format
      };

      fetch('http://localhost:3000/api/notes/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=UTF-8',
        },
        body: JSON.stringify(note),
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          alert(json.message);
        } else {
          alert("Failed to save note");
        }
      })
      .catch(err => console.error('Failed to save note:', err));
    }
  };

  const removeNote = () => {
    if (getName()) {
      fetch('http://localhost:3000/api/notes/remove', {
        method: 'POST',
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
        body: noteName,
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          alert(json.message);
        } else {
          alert("Failed to remove note");
        }
      })
      .catch(err => console.error('Failed to remove note:', err));
    }
  };

  const handleLoad = () => {
    if (getName()) {
      fetch(`http://localhost:3000/api/notes/load?noteName=${noteName}`, {
        headers: {
          'Content-Type': 'text/plain; charset=UTF-8',
        },
      })
      .then(response => response.json())
      .then(json => {
        if (json.success) {
          setNoteText(json.text);
          alert("Note loaded");
        } else {
          alert("Failed to load note");
        }
      })
      .catch(err => console.error('Failed to load note:', err));
    }
  };

  const getName = () => {
    if (!noteName) {
      alert("Insert a name");
      return false;
    }
    return true;
  };

  return (
    <>
      <Navbar />
      <main>
        <header>Note</header>
        <input
          type="text"
          value={noteName}
          onChange={(e) => setNoteName(e.target.value)}
          placeholder="Insert title"
        />
        <button onClick={handleLoad}>Load</button>
        <textarea
          value={noteText}
          onChange={(e) => setNoteText(e.target.value)}
          className="text"
          placeholder="Write your note here..."
        />
        <button onClick={handleDelete}>Delete</button>
        <button onClick={handleCopy}>Copy</button>
        <button onClick={handleSave}>Save</button>
        <div className="output" dangerouslySetInnerHTML={{ __html: outputText }} />
        <footer>Footer: Note V1.0</footer>
      </main>
    </>
  );
}

export default Note;
