import { useState, useCallback } from 'react';

export default function useAutomataLogic() {
  const [automataType, setAutomataType] = useState('dfa');
  const [states, setStates] = useState([{ id: 'q0', name: 'q0', isStart: true, isAccept: false }]);
  const [transitions, setTransitions] = useState([]);
  
  // For state creation
  const [newStateName, setNewStateName] = useState('');
  const [isAcceptState, setIsAcceptState] = useState(false);

  // For transition creation
  const [fromState, setFromState] = useState('');
  const [toState, setToState] = useState('');
  const [inputSymbol, setInputSymbol] = useState('');
  const [alphabet, setAlphabet] = useState(['0', '1']);
  const [showInputOptions, setShowInputOptions] = useState(false);
  
  const handleAddState = useCallback(() => {
    if (!newStateName.trim()) {
      alert('State name cannot be empty');
      return;
    }
    
    if (states.some(state => state.name === newStateName)) {
      alert('State with this name already exists');
      return;
    }
    
    const newState = {
      id: newStateName,
      name: newStateName,
      isStart: states.length === 0,
      isAccept: isAcceptState
    };
    
    setStates([...states, newState]);
    setNewStateName('');
    setIsAcceptState(false);
  }, [newStateName, isAcceptState, states]);
  
  const handleRemoveState = useCallback((stateId) => {
    // Remove the state
    const updatedStates = states.filter(state => state.id !== stateId);
    
    // Also remove any transitions involving this state
    const updatedTransitions = transitions.filter(
      t => t.from !== stateId && t.to !== stateId
    );
    
    // If we removed the start state, make another one the start state if available
    if (states.find(s => s.id === stateId)?.isStart && updatedStates.length > 0) {
      updatedStates[0].isStart = true;
    }
    
    setStates(updatedStates);
    setTransitions(updatedTransitions);
  }, [states, transitions]);
  
  const toggleAcceptState = useCallback((stateId) => {
    setStates(states.map(state => 
      state.id === stateId 
        ? { ...state, isAccept: !state.isAccept } 
        : state
    ));
  }, [states]);

  const toggleAutomataType = useCallback((type) => {
    if (type === 'dfa') {
      // Switching from NFA to DFA - enforce DFA constraints
      
      // 1. Check for multiple start states
      const startStates = states.filter(s => s.isStart);
      if (startStates.length > 1) {
        const firstStartState = startStates[0].id;
        
        // Keep only the first start state
        setStates(states.map(state => ({
          ...state,
          isStart: state.id === firstStartState ? true : false
        })));
        
        alert(`Multiple start states detected. Keeping only state "${startStates[0].name}" as start state.`);
      }
      
      // 2. Check for multiple transitions from the same state with the same input
      const transitionGroups = {};
      const duplicateTransitions = [];
      
      transitions.forEach(t => {
        const key = `${t.from}-${t.input}`;
        if (!transitionGroups[key]) {
          transitionGroups[key] = [t];
        } else {
          transitionGroups[key].push(t);
          duplicateTransitions.push(t.id);
        }
      });
      
      // Remove any duplicate transitions (keeping the first one for each group)
      if (duplicateTransitions.length > 0) {
        const removedCount = duplicateTransitions.length;
        setTransitions(transitions.filter(t => !duplicateTransitions.includes(t.id)));
        
        alert(`Removed ${removedCount} transition(s) that violated DFA constraints.`);
      }
    }
    
    // Update the automata type
    setAutomataType(type);
  }, [states, transitions, setStates, setTransitions]);

  const setStartState = useCallback((stateId) => {
    console.log("Toggling start status: ", automataType);
    if (automataType === 'nfa') {
      setStates(states.map(state => ({
      ...state,
      isStart: state.id === stateId ? !state.isStart : state.isStart
    })))} else {
      setStates(states.map(state => ({
      ...state,
      isStart: state.id === stateId
    })));}
  }, [states, automataType]);
  
  const handleAddTransition = useCallback(() => {
    if (!fromState || !toState || !inputSymbol) {
      alert('Please fill all transition fields');
      return;
    }
    
    // For DFAs, validate that there's no duplicate transition from the same state with the same input
    if (automataType === 'dfa') {
      const duplicateTransition = transitions.some(
        t => t.from === fromState && t.input === inputSymbol
      );
      
      if (duplicateTransition) {
        alert('A DFA cannot have multiple transitions from the same state with the same input');
        return;
      }
    }
    
    const newTransition = {
      id: `${fromState}-${inputSymbol}-${toState}`,
      from: fromState,
      to: toState,
      input: inputSymbol,
    };
    
    setTransitions([...transitions, newTransition]);
    setInputSymbol('');
  }, [automataType, fromState, toState, inputSymbol, transitions]);

  const handleRemoveTransition = useCallback((transitionId) => {
    setTransitions(transitions.filter(t => t.id !== transitionId));
  }, [transitions]);
  
  const resetAutomaton = useCallback(() => {
    if (window.confirm('Are you sure you want to reset the automaton? This will clear all states and transitions.')) {
      setStates([{ id: 'q0', name: 'q0', isStart: true, isAccept: false }]);
      setTransitions([]);
    }
  }, []);

  return {
    automataType,
    setAutomataType,
    states,
    setStates,
    transitions,
    setTransitions,
    newStateName,
    setNewStateName,
    isAcceptState,
    setIsAcceptState,
    fromState,
    setFromState,
    toState,
    setToState,
    inputSymbol,
    setInputSymbol,
    alphabet,
    setAlphabet,
    showInputOptions,
    setShowInputOptions,
    handleAddState,
    handleRemoveState,
    toggleAcceptState,
    toggleAutomataType,
    setStartState,
    handleAddTransition,
    handleRemoveTransition,
    resetAutomaton
  };
}