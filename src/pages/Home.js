import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <h1>Languages and Computation Visualizer</h1>
      
      <div className="visualization-categories">
        <div className="category-card">
          <h2>Finite Automata</h2>
          <p>Create and test DFAs and NFAs</p>
          <Link to="/fa">Explore</Link>
        </div>

      </div>
    </div>
  );
};

export default Home;