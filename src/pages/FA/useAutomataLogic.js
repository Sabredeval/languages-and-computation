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
  
  const setStartState = useCallback((stateId) => {
    setStates(states.map(state => ({
      ...state,
      isStart: state.id === stateId
    })));
  }, [states]);
  
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
    setStartState,
    handleAddTransition,
    handleRemoveTransition,
    resetAutomaton
  };
}