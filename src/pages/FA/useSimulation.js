import { useState, useCallback, useEffect, useRef } from 'react';

export default function useSimulation(states, transitions, automataType) {
  const [inputString, setInputString] = useState('');
  const [testResult, setTestResult] = useState(null);
  const [currentSimulation, setCurrentSimulation] = useState(null);
  const [simulationStep, setSimulationStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playSpeed, setPlaySpeed] = useState(500);
  
  // Use a ref for the timer to avoid issues with cleanup
  const playTimerRef = useRef(null);
  
  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, []);
  
  // Handle auto-play animation
  useEffect(() => {
    if (!isPlaying || !currentSimulation) return;
    
    const maxSteps = currentSimulation.steps.length;
    
    if (simulationStep >= maxSteps) {
      setIsPlaying(false);
      return;
    }
    
    playTimerRef.current = setTimeout(() => {
      const nextStep = simulationStep + 1;
      highlightSimulationPath(nextStep);
    }, playSpeed);
    
    return () => {
      if (playTimerRef.current) {
        clearTimeout(playTimerRef.current);
      }
    };
  }, [isPlaying, simulationStep, currentSimulation, playSpeed]);
  
  const togglePlayPause = useCallback(() => {
    setIsPlaying(current => !current);
  }, []);
  
  const stopSimulation = useCallback(() => {
    setIsPlaying(false);
    highlightSimulationPath(-1); // Reset to beginning
  }, []);
  
  const changePlaySpeed = useCallback((newSpeed) => {
    setPlaySpeed(newSpeed);
  }, []);
  
  const testString = useCallback(() => {
    if (!inputString && inputString !== '') {
      alert('Please enter an input string to test');
      return;
    }
    
    const startStates = states.filter(s => s.isStart);

    if (startStates.length === 0) {
      alert('No start states defined');
      return;
    }
    
    // Stop any current simulation
    if (isPlaying) {
      setIsPlaying(false);
    }
    
    // For DFA simulation
    if (automataType === 'dfa') {
      // Get single start state ID
      let startStateId = startStates[0].id;
      let currentState = startStateId;
      const steps = [];
      let accepted = false;
      let rejected = false;
      let rejectReason = '';
      
      // Process each character
      for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        
        // Find the transition for this state and input
        const transition = transitions.find(
          t => t.from === currentState && (t.input === char || t.input === 'ε') 
        );
        
        if (!transition) {
          rejected = true;
          rejectReason = `No transition found from state ${states.find(s => s.id === currentState)?.name} on input '${char}'`;
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
          rejectReason = `Ended in state ${states.find(s => s.id === currentState)?.name}, which is not an accept state`;
        }
      }
      
      const simResult = {
        steps,
        currentState: startStateId,
        accepted,
        rejected,
        rejectReason,
        inputString,
        position: -1,
        isNFA: false
      };
      
      setCurrentSimulation(simResult);
      setSimulationStep(-1);
      
      setTestResult({
        accepted,
        rejected,
        reason: accepted 
          ? `String accepted! Ended in accept state ${states.find(s => s.id === currentState)?.name}.` 
          : `String rejected: ${rejectReason}`
      });
      
      return simResult;
    } else {
      // NFA simulation
      let currentStates = startStates.map(s => s.id);
      const steps = [];
      let rejected = false;
      let rejectReason = '';
      
      for (let i = 0; i < inputString.length; i++) {
        const char = inputString[i];
        const nextStates = [];
        const currentStepTransitions = [];
        
        for (const stateId of currentStates) {
          const validTransitions = transitions.filter(t => 
            t.from === stateId && (t.input === char || t.input === 'ε') 
          );
          
          for (const transition of validTransitions) {
            if (!nextStates.includes(transition.to)) {
              nextStates.push(transition.to);
              currentStepTransitions.push({
                fromState: stateId,
                toState: transition.to,
                symbol: char
              });
            }
          }
        }
        
        if (nextStates.length === 0) {
          rejected = true;
          rejectReason = `No valid transitions found from states [${currentStates.map(id => states.find(s => s.id === id)?.name).join(', ')}] on input '${char}'`;
          break;
        }
        
        // Record this step
        steps.push({
          position: i,
          symbol: char,
          fromStates: [...currentStates],
          toStates: [...nextStates],
          transitions: currentStepTransitions
        });
        
        // Move to next states
        currentStates = nextStates;
      }
      
      // Check if any final state is an accept state
      const accepted = !rejected && currentStates.some(
        stateId => states.some(s => s.id === stateId && s.isAccept)
      );
      
      if (!rejected && !accepted) {
        rejectReason = `None of the final states [${currentStates.map(id => states.find(s => s.id === id)?.name).join(', ')}] are accept states`;
      }
      
      const simResult = {
        steps,
        currentStates: startStates.map(s => s.id), // Reset to start states
        accepted,
        rejected: !accepted,
        rejectReason,
        inputString,
        position: -1,
        isNFA: true
      };
      
      setCurrentSimulation(simResult);
      setSimulationStep(-1); 
      
      setTestResult({
        accepted,
        reason: accepted 
          ? `String accepted! Ended in at least one accept state: [${currentStates
              .filter(stateId => states.some(s => s.id === stateId && s.isAccept))
              .map(id => states.find(s => s.id === id)?.name)
              .join(', ')}]` 
          : `String rejected: ${rejectReason}`
      });
      
      return simResult;
    }
  }, [inputString, states, transitions, automataType, isPlaying]);
  
  const highlightSimulationPath = useCallback((stepIndex) => {
    if (!currentSimulation) return resetTransitions();
    
    // Reset all transition highlights
    const resetTransitions = () => transitions.map(t => ({ ...t, highlight: false }));
    const allResetTransitions = resetTransitions();
    
    if (!currentSimulation.steps || currentSimulation.steps.length === 0) {
      return allResetTransitions;
    }
    
    const isNFA = !!currentSimulation.isNFA;
    
    // If we're at the beginning, just reset
    if (stepIndex < 0) {
      setSimulationStep(stepIndex);
      
      if (isNFA) {
        setCurrentSimulation({
          ...currentSimulation,
          currentStates: states.filter(s => s.isStart).map(s => s.id),
          position: -1
        });
      } else {
        setCurrentSimulation({
          ...currentSimulation,
          currentState: states.find(s => s.isStart)?.id,
          position: -1
        });
      }
      
      return allResetTransitions;
    }
    
    if (isNFA) {
      if (stepIndex >= currentSimulation.steps.length) {
        const allTransitions = new Set();
        
        currentSimulation.steps.forEach(step => {
          if (!step.transitions) return;
          
          step.transitions.forEach(t => {
            if (!t.fromState || !t.symbol || !t.toState) return;
            allTransitions.add(`${t.fromState}-${t.symbol}-${t.toState}`);
          });
        });
        
        const highlightedTransitions = allResetTransitions.map(t => {
          const key = `${t.from}-${t.input}-${t.to}`;
          return { ...t, highlight: allTransitions.has(key) };
        });
        
        setSimulationStep(stepIndex);
        
        // Get the final states or start states if no steps
        const finalStates = currentSimulation.steps.length > 0
          ? currentSimulation.steps[currentSimulation.steps.length - 1].toStates
          : states.filter(s => s.isStart).map(s => s.id);
        
        setCurrentSimulation({
          ...currentSimulation,
          currentStates: finalStates,
          position: currentSimulation.steps.length - 1
        });
        
        return highlightedTransitions;
      }
      
      // Handle specific step for NFA
      const currentStep = currentSimulation.steps[stepIndex];
      if (!currentStep) return allResetTransitions; // Safety check
      
      const highlightedTransitions = allResetTransitions.map(t => {
        // Make sure transitions array exists
        if (!currentStep.transitions) return { ...t, highlight: false };
        
        return { 
          ...t, 
          highlight: currentStep.transitions.some(
            stepTrans => 
              stepTrans.fromState === t.from && 
              stepTrans.toState === t.to && 
              stepTrans.symbol === t.input
          )
        };
      });
      
      setSimulationStep(stepIndex);
      
      setCurrentSimulation({
        ...currentSimulation,
        currentStates: currentStep.toStates || [],
        position: stepIndex
      });
      
      return highlightedTransitions;
    }
    else {
      // Handle DFA visualization
      if (stepIndex >= currentSimulation.steps.length) {
        // Show the entire path
        const highlightedTransitions = allResetTransitions.map(t => {
          const isInPath = currentSimulation.steps.some(step => 
            step.fromState === t.from && 
            step.toState === t.to && 
            step.symbol === t.input
          );
          return { ...t, highlight: isInPath };
        });
        
        setSimulationStep(stepIndex);
        
        // Set to final state if available, otherwise start state
        const finalState = currentSimulation.steps.length > 0
          ? currentSimulation.steps[currentSimulation.steps.length - 1].toState
          : states.find(s => s.isStart)?.id;
        
        setCurrentSimulation({
          ...currentSimulation,
          currentState: finalState || '',
          position: currentSimulation.steps.length - 1
        });
        
        return highlightedTransitions;
      }
      
      // Handle specific step for DFA
      const currentStep = currentSimulation.steps[stepIndex];
      if (!currentStep) return allResetTransitions; // Safety check
      
      const highlightedTransitions = allResetTransitions.map(t => {
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
    }
  }, [currentSimulation, states, transitions]);
  
  const goToNextStep = useCallback(() => {
    if (!currentSimulation) return;
    const maxStep = currentSimulation.steps.length;
    const nextStep = Math.min(simulationStep + 1, maxStep);
    highlightSimulationPath(nextStep);
  }, [currentSimulation, simulationStep, highlightSimulationPath]);
  
  const goToPreviousStep = useCallback(() => {
    if (!currentSimulation) return;
    const prevStep = Math.max(simulationStep - 1, -1);
    highlightSimulationPath(prevStep);
  }, [currentSimulation, simulationStep, highlightSimulationPath]);
  
  const goToFirstStep = useCallback(() => {
    highlightSimulationPath(-1);
  }, [highlightSimulationPath]);
  
  const goToLastStep = useCallback(() => {
    if (!currentSimulation) return;
    highlightSimulationPath(currentSimulation.steps.length);
  }, [currentSimulation, highlightSimulationPath]);

  return {
    inputString,
    setInputString,
    testResult,
    setTestResult,
    currentSimulation,
    setCurrentSimulation,
    simulationStep,
    setSimulationStep,
    isPlaying,
    playSpeed,
    
    testString,
    highlightSimulationPath,
    
    togglePlayPause,
    stopSimulation,
    changePlaySpeed,
    goToNextStep,
    goToPreviousStep,
    goToFirstStep,
    goToLastStep
  };
}