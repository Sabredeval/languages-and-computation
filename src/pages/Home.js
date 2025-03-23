import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
  const cards = [
    {
        id: 'fl',
        title: 'Formal Languages',
        description: 'Understand basic concepts of formal languages.',
        icon: '🔠',
        color: '#ACB9B1',
        topics: ['Language', 'Word', 'Alphabet', 'Subset construction']
    },
    {
      id: 'fa',
      title: 'Finite Automata',
      description: 'Create and edit DFAs and NFAs.',
      icon: '🔄',
      color: '#4CAF50',
      topics: ['DFA', 'NFA', 'State diagrams', 'Subset construction']
    },
    {
      id: 'cfg',
      title: 'Context-Free Grammars',
      description: 'Build and analyze CFGs with interactive parse trees and derivations.',
      icon: '🌳',
      color: '#2196F3',
      topics: ['Parse trees', 'Derivations', 'Ambiguity detection', 'Grammar analysis']
    },
    {
      id: 'pa',
      title: 'Pushdown Automata',
      description: 'Visualize PDAs with animated stack operations and step-by-step execution.',
      icon: '📚',
      color: '#FF9800',
      topics: ['Stack operations', 'Acceptance by final state', 'CFG equivalence']
    },
    {
        id: 'pl',
        title: 'Pumping Lemma',
        description: 'Learn about the pumping lemma through interactive demonstrations and counterexamples.',
        icon: '🔍',
        color: '#F44336',
        topics: ['Non-regularity proofs', 'Counterexample construction', 'String decomposition']
    },
    {
        id: 'tm',
        title: 'Turing Machines',
        description: 'Create and run Turing machines with visualization of tape and head movements.',
        icon: '🤖',
        color: '#9C27B0',
        topics: ['Tape operations', 'State transitions', 'Computability']
    }
    
  ];

  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Languages and Computation Visualizer</h1>
        <p className="subtitle">Interactive tools for exploring theoretical computer science concepts</p>
      </div>

      <div className="tools-container">
        {cards.map(tool => (
          <Link to={`/${tool.id}`} className="tool-card" key={tool.id} style={{ borderTop: `4px solid ${tool.color}` }}>
            <div className="tool-icon">{tool.icon}</div>
            <h2>{tool.title}</h2>
            <p>{tool.description}</p>
            <div className="tool-topics">
              {tool.topics.map(topic => (
                <span key={topic} className="topic-tag">{topic}</span>
              ))}
            </div>
            <div className="tool-button">Explore</div>
          </Link>
        ))}
      </div>

      <footer className="home-footer">
        <p>Created for educational purposes • LnC</p>
        <p><i>author: Maksym Saviuk</i></p> 
      </footer>
    </div>
  );
};

export default Home;