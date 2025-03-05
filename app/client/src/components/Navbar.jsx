import React, { useState } from "react";
import { Link } from "react-router-dom";
import Style from "./Navbar.module.css"; // Assuming your CSS module for styles


function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className={Style.header}>
      <Link to="/" className={Style.logo}>Logo</Link>

      <button className={Style.hamburger} onClick={toggleMenu}>
        {/* Hamburger icon: simple lines */}
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
      </button>

      <nav className={`${Style.navbar} ${isMenuOpen ? Style.navbarActive : ""}`}>
        <Link to="/home" className="nav-link">Home</Link>
        <Link to="/calendar" className="nav-link">Calendario</Link>
        <Link to="/noteNavigation" className="nav-link">Note</Link>
        <Link to="/pomodoro" className="nav-link">Pomodoro</Link>
        <Link to="/utente" className="nav-link">Utente</Link>
      </nav>
    </header>
  );
}

export default Navbar;
