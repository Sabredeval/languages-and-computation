import React, { useState } from 'react';
import '../styles/Pages.css';

const PumpingLemma = () => {
  const [language, setLanguage] = useState('');
  const [pumpingLength, setPumpingLength] = useState(3);
  const [testString, setTestString] = useState('');
  const [decomposition, setDecomposition] = useState({ x: '', y: '', z: '' });
  const [pumpingFactor, setPumpingFactor] = useState(2);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>The Pumping Lemma</h1>
        <p className="subtitle">Interactive demonstrations for proving languages are not regular</p>
      </div>

      <div className="content-grid">
        <div className="control-panel">
          <div className="panel-section">
            <h2>Language Definition</h2>
            <textarea 
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              placeholder="Describe your language, e.g.:
L = {a^n b^n | n ≥ 1}"
              rows="3"
            ></textarea>
          </div>
          
          <div className="panel-section">
            <h2>Pumping Length</h2>
            <div className="input-with-label">
              <span>n = </span>
              <input 
                type="number" 
                min="1" 
                value={pumpingLength}
                onChange={(e) => setPumpingLength(parseInt(e.target.value))}
              />
            </div>
          </div>
          
          <div className="panel-section">
            <h2>Test String</h2>
            <input 
              type="text"
              value={testString}
              onChange={(e) => setTestString(e.target.value)}
              placeholder="String of length ≥ n that should be in the language"
            />
            <div className="button-group">
              <button>Generate Example String</button>
              <button>Verify String</button>
            </div>
          </div>
        </div>
        
        <div className="visualization-area pumping-visualization">
          <div className="decomposition-panel">
            <h2>String Decomposition</h2>
            <div className="decomposition-controls">
              <div className="decomp-section">
                <label>x =</label>
                <input 
                  type="text" 
                  value={decomposition.x}
                  onChange={(e) => setDecomposition({...decomposition, x: e.target.value})}
                />
              </div>
              <div className="decomp-section">
                <label>y =</label>
                <input 
                  type="text" 
                  value={decomposition.y}
                  onChange={(e) => setDecomposition({...decomposition, y: e.target.value})}
                />
              </div>
              <div className="decomp-section">
                <label>z =</label>
                <input 
                  type="text" 
                  value={decomposition.z}
                  onChange={(e) => setDecomposition({...decomposition, z: e.target.value})}
                />
              </div>
            </div>
            
            <div className="string-visualization">
              <div className="placeholder-viz">String visualization will appear here</div>
            </div>
          </div>
          
          <div className="pumping-panel">
            <h2>Pumping Demonstration</h2>
            <div className="pumping-controls">
              <label>Pumping factor (i):</label>
              <input 
                type="range" 
                min="0" 
                max="5" 
                value={pumpingFactor}
                onChange={(e) => setPumpingFactor(parseInt(e.target.value))}
              />
              <span className="pump-value">{pumpingFactor}</span>
            </div>
            
            <div className="pumped-strings">
              <div className="placeholder-pumped">Pumped strings will appear here</div>
            </div>
            
            <div className="conclusion-panel">
              <div className="placeholder-conclusion">Proof conclusion will appear here</div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="documentation-section">
        <h2>Understanding the Pumping Lemma</h2>
        <div className="tabs">
          <button className="tab active">Overview</button>
          <button className="tab">How to Apply</button>
          <button className="tab">Examples</button>
          <button className="tab">Common Mistakes</button>
        </div>
        <div className="tab-content">
          <p>
            The Pumping Lemma is a tool used to prove that certain languages are 
            <strong>not</strong> regular. It states that for any regular language, 
            there exists a pumping length 'n' such that any string in the language 
            with length at least 'n' can be "pumped" - meaning a section can be 
            repeated any number of times while still producing a string in the language.
          </p>
          <p>
            To use this visualizer, define a language you believe is not regular, 
            then follow the steps to construct a proof by contradiction.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PumpingLemma;