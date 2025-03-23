import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import '../../styles/Navigation.css';

const Navigation = () => {
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  return (
    <nav className="main-nav">
      <div className="nav-container">
        <div className="nav-logo">
          <NavLink to="/">LnC</NavLink>
        </div>

        <div className="mobile-menu-toggle" onClick={toggleMenu}>
          <span></span>
          <span></span>
          <span></span>
        </div>

        <ul className={`nav-links ${menuOpen ? 'active' : ''}`}>
          <li><NavLink to="/" end onClick={() => setMenuOpen(false)}>Home</NavLink></li>
          <li><NavLink to="/fa" onClick={() => setMenuOpen(false)}>Finite Automata</NavLink></li>
          <li><NavLink to="/cfg" onClick={() => setMenuOpen(false)}>Context-Free Grammars</NavLink></li>
          <li><NavLink to="/pa" onClick={() => setMenuOpen(false)}>Pushdown Automata</NavLink></li>
          <li><NavLink to="/tm" onClick={() => setMenuOpen(false)}>Turing Machines</NavLink></li>
          <li><NavLink to="/pl" onClick={() => setMenuOpen(false)}>Pumping Lemma</NavLink></li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;