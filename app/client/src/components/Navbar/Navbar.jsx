import React, { useState } from "react";
import { Link } from "react-router-dom";
import Style from "./Navbar.module.css";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className={Style.header}>
      <div className={Style.container}>
        <Link to="/" className={Style.logo} onClick={closeMenu}>
          SelfieApp
        </Link>

        <button 
          className={Style.hamburger} 
          onClick={toggleMenu}
          aria-label="Toggle menu"
        >
          <span className={`${Style.hamburgerLine} ${isMenuOpen ? Style.rotate45 : ''}`}></span>
          <span className={`${Style.hamburgerLine} ${isMenuOpen ? Style.opacity0 : ''}`}></span>
          <span className={`${Style.hamburgerLine} ${isMenuOpen ? Style.rotateMinus45 : ''}`}></span>
        </button>

        <nav className={`${Style.navbar} ${isMenuOpen ? Style.navbarOpen : ""}`}>
          <Link to="/" className={Style.navLink} onClick={closeMenu}>
            Home
          </Link>
          <Link to="/calendario" className={Style.navLink} onClick={closeMenu}>
            Calendario
          </Link>
          <Link to="/note" className={Style.navLink} onClick={closeMenu}>
            Note
          </Link>
          <Link to="/pomodoro" className={Style.navLink} onClick={closeMenu}>
            Pomodoro
          </Link>
          <Link to="/utente" className={Style.navLink} onClick={closeMenu}>
            Utente
          </Link>
        </nav>
      </div>
    </header>
  );
}

export default Navbar;