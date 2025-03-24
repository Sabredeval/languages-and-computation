import React, { useState } from 'react';
import '../../styles/Pages.css';

const CFGrammar = () => {
  const [grammar, setGrammar] = useState('');
  const [inputString, setInputString] = useState('');
  const [parseTree, setParseTree] = useState(null);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Context-Free Grammars</h1>
        <p className="subtitle">Create and analyze context-free grammars with parse trees and derivations</p>
      </div>

      <div className="content-grid">
        <div className="control-panel">
          <div className="panel-section">
            <h2>Grammar Definition</h2>
            <textarea 
              className="grammar-editor"
              value={grammar}
              onChange={(e) => setGrammar(e.target.value)}
              placeholder="Enter grammar rules, e.g.:
                            S -> AB | BC
                            A -> a | aA
                            B -> b
                            C -> c | cC"
              rows="10"
            ></textarea>
          </div>
          
          <div className="panel-section">
            <h2>Grammar Tools</h2>
            <div className="button-group">
              <button>Check Grammar</button>
              <button>Remove Left Recursion</button>
              <button>Left Factor</button>
              <button>Check Ambiguity</button>
            </div>
          </div>
        </div>
        
        <div className="visualization-area">
          <div className="canvas-container">
            <div className="placeholder-canvas">Parse tree visualization will appear here</div>
          </div>
          
          <div className="testing-panel">
            <h2>Test Input String</h2>
            <div className="input-group">
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter string to parse..."
              />
              <button>Parse</button>
            </div>
            <div className="result-display">
              <div className="placeholder-result">Parse results will appear here</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="documentation-section">
        <h2>About Context-Free Grammars</h2>
        <div className="tabs">
          <button className="tab active">Overview</button>
          <button className="tab">Grammar Rules</button>
          <button className="tab">Derivations</button>
          <button className="tab">Parse Trees</button>
        </div>
        <div className="tab-content">
          <p>
            Context-free grammars are formal grammars used to describe programming languages, 
            natural language syntax, and other hierarchical structures. They are more 
            powerful than regular expressions and are used for parsing nested structures.
          </p>
          <p>
            Use the editor to define your grammar rules, then test input strings to see 
            if they can be derived from your grammar.
          </p>
        </div>
      </div>
    </div>
  );
};

export default CFGrammar;