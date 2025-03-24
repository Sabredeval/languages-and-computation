import React from 'react';

const FAControlPanel = ({ automataType, setAutomataType, 
    alphabet, setAlphabet, transitions, states, newStateName, setNewStateName,
    inputSymbol, setInputSymbol, setStartState, 
    handleAddState, handleAddTransition, handleRemoveState, handleRemoveTransition,
    toggleAcceptState, resetAutomaton, showInputOptions, setShowInputOptions,
    fromState, setFromState, toState, setToState
  }) => { return(

    <div className="control-panel">
        <div className="panel-section">
        <h2>Automata Type</h2>
        <div className="toggle-buttons">
            <button 
            className={`control-button ${automataType === 'dfa' ? 'active' : ''}`}
            onClick={() => setAutomataType('dfa')}
            >
            DFA
            </button>
            <button 
            className={`control-button ${automataType === 'nfa' ? 'active' : ''}`}
            onClick={() => setAutomataType('nfa')}
            disabled={true} // TODO: Implement NFA
            >
            NFA
            </button>
        </div>
        </div>


        <div className="panel-section">
        <h2>Alphabet (Σ)</h2>
        <div className="alphabet-container">
            <div className="alphabet-symbols">
            {alphabet.map(symbol => (
                <span key={symbol} className="alphabet-chip">
                {symbol}
                <button 
                    className="remove-symbol"
                    onClick={(e) => {
                    e.stopPropagation();
                    // Don't remove if in use by transitions
                    if (transitions.some(t => t.input === symbol)) {
                        alert(`Cannot remove symbol '${symbol}' because it's used in transitions.`);
                        return;
                    }
                    setAlphabet(alphabet.filter(s => s !== symbol));
                    }}
                >
                    ×
                </button>
                </span>
            ))}
            <button 
                className="add-symbol-button"
                onClick={() => {
                const newSymbol = prompt('Enter a new alphabet symbol:');
                if (!newSymbol || newSymbol.length !== 1) {
                    alert('Please enter a single character.');
                    return;
                }
                if (alphabet.includes(newSymbol)) {
                    alert('This symbol already exists in the alphabet.');
                    return;
                }
                setAlphabet([...alphabet, newSymbol]);
                }}
            >
                + Add Symbol
            </button>
            </div>
            <div className="alphabet-info">
            <p>The alphabet defines all possible input symbols for your automaton.</p>
            </div>
        </div>
        </div>
        
        
        <div className="panel-section">
        <h2>States (Q)</h2>
        <div className="control-group">
            <div className="input-with-button">
            <input
                type="text"
                placeholder="State name (e.g., q1)"
                value={newStateName}
                onChange={(e) => setNewStateName(e.target.value)}
            />
            <button className="control-button" onClick={handleAddState}>Add</button>
            </div>
        </div>
        
        <div className="state-list">
            {states.map(state => (
            <div key={state.id} className="state-item">
                <span className={`state-name ${state.isAccept ? 'accept-state' : ''}`}>
                {state.name} {state.isStart && '(start)'}
                </span>
                <div className="state-actions">
                <button 
                    className="control-button small"
                    onClick={() => toggleAcceptState(state.id)}
                >
                    {state.isAccept ? 'Unmark Accept' : 'Mark Accept'}
                </button>
                {!state.isStart && (
                    <button 
                    className="control-button small"
                    onClick={() => setStartState(state.id)}
                    >
                    Set as Start
                    </button>
                )}
                <button 
                    className="control-button small danger"
                    onClick={() => handleRemoveState(state.id)}
                >
                    Remove
                </button>
                </div>
            </div>
            ))}
        </div>
        </div>
        
        <div className="panel-section">
        <h2>Transitions (δ)</h2>
        <div className="control-group">
            <div className="transition-inputs">
            <div className="select-group">
                <label>From</label>
                <select 
                value={fromState}
                onChange={(e) => setFromState(e.target.value)}
                >
                <option value="">Select state</option>
                {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                ))}
                </select>
            </div>
            <div className="select-group">
                <label>To</label>
                <select 
                value={toState}
                onChange={(e) => setToState(e.target.value)}
                >
                <option value="">Select state</option>
                {states.map(state => (
                    <option key={state.id} value={state.id}>{state.name}</option>
                ))}
                </select>
            </div>
            
            <div className="select-group">
                <label>Input</label>
                <div className="input-with-options">
                <input 
                    type="text"
                    value={inputSymbol}
                    onChange={(e) => setInputSymbol(e.target.value)}
                    placeholder="e.g., 0"
                    maxLength={1}
                    onFocus={() => setShowInputOptions(true)}
                    onBlur={() => setTimeout(() => setShowInputOptions(false), 200)}
                />
                {showInputOptions && (
                    <div className="input-options">
                    {alphabet.map(symbol => (
                        <button 
                        key={symbol} 
                        className="option-button"
                        onClick={() => setInputSymbol(symbol)}
                        >
                        {symbol}
                        </button>
                    ))}
                    <button 
                        className="option-button add-symbol"
                        onClick={() => {
                        const newSymbol = prompt('Enter a new alphabet symbol');
                        if (newSymbol && newSymbol.length === 1) {
                            setAlphabet([...alphabet, newSymbol]);
                            setInputSymbol(newSymbol);
                        }
                        }}
                    >
                        +
                    </button>
                    </div>
                )}
                </div>
            </div>
            </div>
            <button 
                className="control-button"
                onClick={handleAddTransition}
            >
                Add
            </button>
            
            <div className="helper-text">
            <small>You can also create transitions by dragging between states in the diagram.</small>
            </div>
        </div>
        
        <div className="transitions-list">
            {transitions.map(transition => (
            <div key={transition.id} className="transition-item">
                <span>
                {states.find(s => s.id === transition.from)?.name} 
                {' → '} 
                {states.find(s => s.id === transition.to)?.name} 
                {' on '} 
                <strong>'{transition.input}'</strong>
                </span>
                <button 
                className="control-button small danger"
                onClick={() => handleRemoveTransition(transition.id)}
                >
                Remove
                </button>
            </div>
            ))}
            {transitions.length === 0 && (
            <div className="empty-message">No transitions defined</div>
            )}
        </div>
        </div>
        
        <div className="panel-section">
        <div className="button-row">
            <button 
            className="control-button danger"
            onClick={resetAutomaton}
            >
            Reset Automaton
            </button>
        </div>
        </div>
    </div>
)}

export default FAControlPanel;