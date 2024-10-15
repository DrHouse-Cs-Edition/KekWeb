import React from "react";
import { Link } from "react-router-dom";
import Style from "./Navbar.module.css";

function Navbar() {
  return (
    <header className={Style.header}>
      <Link to="/" className={Style.logo}>Logo</Link>

      <nav className={Style.navbar}>
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/calendario" className="nav-link">Calendario</Link>
        <Link to="/note" className="nav-link">Note</Link>
        <Link to="/noteNavigation" className="nav-link">Tutte le Note</Link>
        <Link to="/pomodoro" className="nav-link">Pomodoro</Link>
        <Link to="/utente" className="nav-link">Utente</Link>
      </nav>
    </header>
  );
}

export default Navbar;
