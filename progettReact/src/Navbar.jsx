import React from "react";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="header">
      <a href="/" className="logo">Selfie</a>

      <nav className="navbar">
        <a href="/">Home</a>
        <a href="/">Calendario</a>
        <a href="/note/note_editor.html">Note</a>
        <a href="/Pomodoro/pomodoro.html">Pomodoro</a>
        <a href="/">Utente</a>
      </nav>
    </header>
  );
}

export default Navbar;
