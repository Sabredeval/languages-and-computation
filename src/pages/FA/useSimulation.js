import { useState, useCallback } from 'react';

export default function useSimulation(states, transitions) {
  const [inputString, setInputString] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  
  const testString = useCallback(() => {
    if (!inputString && inputString !== '') {
      alert('Please enter an input string to test');
      return;
    }
    
    // Find the start state
    const startState = states.find(state => state.isStart);
    if (!startState) {
      alert('No start state defined');
      return;
    }
    
    // For DFA simulation
    let currentState = startState.id;
    const steps = [];
    let accepted = false;
    let rejected = false;
    let rejectReason = '';
    
    // Process each character
    for (let i = 0; i < inputString.length; i++) {
      const char = inputString[i];
      
      // Find the transition for this state and input
      const transition = transitions.find(
        t => t.from === currentState && t.input === char
      );
      
      if (!transition) {
        rejected = true;
        rejectReason = `No transition found from state ${currentState} on input '${char}'`;
        break;
      }
      
      steps.push({
        position: i,
        symbol: char,
        fromState: currentState,
        toState: transition.to
      });
      
      // Move to the next state
      currentState = transition.to;
    }
    
    // Check if final state is an accept state
    if (!rejected) {
      accepted = states.some(s => s.id === currentState && s.isAccept);
      if (!accepted) {
        rejectReason = `Ended in state ${currentState}, which is not an accept state`;
      }
    }
    
    const simResult = {
      steps,
      currentState,
      accepted,
      rejected,
      rejectReason,
      inputString,
      position: -1
    };
    
    setCurrentSimulation(simResult);
    
    setTestResult({
      accepted,
      rejected,
      reason: accepted ? `String accepted! Ended in accept state ${currentState}.` 
                       : `String rejected: ${rejectReason}`
    });
    
    return simResult;
  }, [inputString, states, transitions]);
  
  const highlightSimulationPath = useCallback((stepIndex) => {
    if (!currentSimulation || !currentSimulation.steps.length) return;
    
    // Reset all transition highlights
    const resetTransitions = transitions.map(t => ({ ...t, highlight: false }));
    
    // If we're at the beginning, just reset
    if (stepIndex < 0) {
      setSimulationStep(stepIndex);
      setCurrentSimulation({
        ...currentSimulation,
        currentState: states.find(s => s.isStart)?.id,
        position: -1
      });
      return resetTransitions;
    }
    
    // If we're past the end, highlight all steps
    if (stepIndex >= currentSimulation.steps.length) {
      const highlightedTransitions = resetTransitions.map(t => {
        const isInPath = currentSimulation.steps.some(step => 
          step.fromState === t.from && 
          step.toState === t.to && 
          step.symbol === t.input
        );
        return { ...t, highlight: isInPath };
      });
      setSimulationStep(stepIndex);
      
      // Set current state to the final state after processing
      const finalState = currentSimulation.steps.length > 0
        ? currentSimulation.steps[currentSimulation.steps.length - 1].toState
        : states.find(s => s.isStart)?.id;
      
      setCurrentSimulation({
        ...currentSimulation,
        currentState: finalState,
        position: currentSimulation.steps.length - 1
      });
      return highlightedTransitions;
    }
    
    // Highlight just this step
    const currentStep = currentSimulation.steps[stepIndex];
    const highlightedTransitions = resetTransitions.map(t => {
      return { 
        ...t, 
        highlight: t.from === currentStep.fromState && 
                 t.to === currentStep.toState && 
                 t.input === currentStep.symbol
      };
    });
    
    setSimulationStep(stepIndex);
    
    setCurrentSimulation({
      ...currentSimulation,
      currentState: currentStep.toState,
      position: stepIndex
    });
    
    return highlightedTransitions;
  }, [currentSimulation, states, transitions]);

  return {
    inputString,
    setInputString,
    testResult,
    setTestResult,
    currentSimulation,
    setCurrentSimulation,
    simulationStep,
    setSimulationStep,
    testString,
    highlightSimulationPath
  };
}