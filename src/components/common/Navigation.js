import React from 'react';
import { NavLink } from 'react-router-dom';

const Navigation = () => {
  return (
    <nav className="main-nav">
      <h1>LAC Visualizer</h1>
      <ul>
        <li><NavLink to="/">Home</NavLink></li>
        <li><NavLink to="/fa">Finite Automata</NavLink></li>
        <li><NavLink to="/cfg">Context-Free Grammars</NavLink></li>
        <li><NavLink to="/pa">Pushdown Automata</NavLink></li>
        <li><NavLink to="/tm">Turing Machines</NavLink></li>
        <li><NavLink to="/pl">Pumping Lemma</NavLink></li>
      </ul>
    </nav>
  );
};

export default Navigation;