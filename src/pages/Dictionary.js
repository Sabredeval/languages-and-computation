import React from 'react';
import '../styles/Pages.css';
import json from '../data/dict.json';

const Tooltip = ({ term, definition }) => {
  return (
    <div className="tooltip">
      <div className="tooltip-header">
        <span className="tooltip-term">{term}</span>
        <span className="tooltip-category">Formal Languages</span>
      </div>
      <span className="tooltip-text">{definition}</span>
      <div className="tooltip-footer">
        <a href="#dictionary" className="tooltip-link">View in Dictionary</a>
      </div>
    </div>
  );
};

const HighlightedText = ({ text }) => {
  const dictionary = json.reduce((acc, entry) => {
    acc[entry.term.toLowerCase()] = entry.definition;
    return acc;
  }, {});

  const words = text.split(' ');

  return (
    <p>
      {words.map((word, index) => {
        const cleanWord = word.replace(/[^a-zA-Z0-9()]/g, '').toLowerCase(); // Remove punctuation
        if (dictionary[cleanWord]) {
          return (
            <span key={index} className="highlighted-word">
              {word}
              <Tooltip term={word} definition={dictionary[cleanWord]} />
            </span>
          );
        }
        return <span key={index}>{word} </span>;
      })}
    </p>
  );
};

const Dictionary = () => {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dictionary</h1>
        <p className="subtitle">A comprehensive dictionary of terms related to formal languages and computation.</p>
      </div>

      <div className="content">
      </div>

      <div id="dictionary" className="dictionary-content">
        {json.map((entry, index) => (
          <div key={index} className="dictionary-entry">
            <h3 className="term">{entry.term}</h3>
            <HighlightedText text={entry.definition} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default Dictionary;