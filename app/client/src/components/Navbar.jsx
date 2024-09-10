import React from "react";
import { Link } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  return (
    <header className="header">
      <Link to="/" className="logo">Logo</Link>

      <nav className="navbar">
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/calendario" className="nav-link">Calendario</Link>
        <Link to="/note" className="nav-link">Note</Link>
        <Link to="/note_navigation" className="nav-link">Tutte le Note</Link>
        <Link to="/pomodoro" className="nav-link">Pomodoro</Link>
        <Link to="/utente" className="nav-link">Utente</Link>
      </nav>
    </header>
  );
}

export default Navbar;
