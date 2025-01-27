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
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
        <span className={isMenuOpen ? Style.hamburgerLineOpen : Style.hamburgerLine}></span>
      </button>

      <nav className={`${Style.navbar} ${isMenuOpen ? Style.navbarActive : ""}`}>
        <button className={Style.closeButton} onClick={toggleMenu}>✕</button>
        <Link to="/home" className={Style.navLink}>Home</Link>
        <Link to="/calendario" className={Style.navLink}>Calendario</Link>
        <Link to="/noteNavigation" className={Style.navLink}>Note</Link>
        <Link to="/pomodoro" className={Style.navLink}>Pomodoro</Link>
        <Link to="/utente" className={Style.navLink}>Utente</Link>
      </nav>
    </header>
  );
}

export default Navbar;