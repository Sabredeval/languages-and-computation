import React, { useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, applyNodeChanges, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SelfConnectingEdge from '../../components/SelfConnecting';
import BiDirectionalEdge from '../../components/BiDirectional';
import FAControlPanel from './FAControlPanel';
import StateNode from './StateNode';
import useAutomataLogic from './useAutomataLogic';
import useSimulation from './useSimulation';
import { importAutomaton, exportAutomaton } from './util';
import '../../styles/Pages.css';
import '../../styles/FiniteAutomata.css';

// Define node and edge types outside the component to prevent recreation on renders
const nodeTypes = {
  stateNode: StateNode
};

const edgeTypes = {
  selfconnecting: SelfConnectingEdge,
  default: BiDirectionalEdge
};

const FiniteAutomata = () => {
  // Get automata logic
  const automataLogic = useAutomataLogic();
  const { 
    states, 
    transitions, 
    setTransitions,
    setStates,
    automataType,
    setAutomataType,
    toggleStartState,
    alphabet,
    setAlphabet,
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
    handleAddState,
    handleRemoveState,
    toggleAcceptState,
    toggleAutomataType,
    setStartState,
    handleAddTransition,
    handleRemoveTransition,
    resetAutomaton,
    showInputOptions,
    setShowInputOptions
  } = automataLogic;

  // Get simulation logic
  const simulation = useSimulation(states, transitions, automataType);
  const { 
    currentSimulation,
    setCurrentSimulation,
    inputString,
    setInputString,
    testResult,
    setTestResult,
    simulationStep,
    setSimulationStep,
    testString,
    highlightSimulationPath
  } = simulation;
  
  // React Flow states
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = React.useState(null);

  // Node positions
  const [nodePositions, setNodePositions] = React.useState({});

  // Handle node dragging to update stored positions
  const onNodeDragStop = useCallback((event, node) => {
    setNodePositions(prev => ({
      ...prev,
      [node.id]: { x: node.position.x, y: node.position.y }
    }));
  }, []);

  // Memoize the creation of nodes and edges to prevent unnecessary recalculations
  const flowNodes = useMemo(() => (
    states.map(state => {
      let isCurrentState = false;
      
      if (currentSimulation) {
        if (currentSimulation.isNFA) {
          isCurrentState = currentSimulation.currentStates?.includes(state.id);
        } else {
          isCurrentState = state.id === currentSimulation.currentState;
        }
      }
      
      return {
        id: state.id,
        type: 'stateNode',
        position: nodePositions[state.id] || { x: 0, y: 0 },
        data: {
          label: state.name,
          isStart: state.isStart,
          isAccept: state.isAccept,
          isCurrentState: isCurrentState
        }
      };
    })
  ), [states, nodePositions, currentSimulation]);
  
  const flowEdges = useMemo(() => {
    const edgeGroups = {};
    
    transitions.forEach(t => {
      const key = `${t.from}-${t.to}`;
      if (!edgeGroups[key]) {
        edgeGroups[key] = {
          transitions: [],
          isHighlighted: false,
          sourceHandle: t.sourceHandle,
          targetHandle: t.targetHandle,
          isSelfLoop: t.from === t.to
        };
      }
      edgeGroups[key].transitions.push(t);
      if (t.highlight) {
        edgeGroups[key].isHighlighted = true;
      }
    });
    
    return Object.entries(edgeGroups).map(([key, group]) => {
      const inputs = Array.from(new Set(group.transitions.map(t => t.input)))
        .sort()
        .join(', ');
      
      const firstTransition = group.transitions[0];
      const edgeId = `edge-${firstTransition.from}-${firstTransition.to}`;
      
      let sourceHandle = group.sourceHandle;
      let targetHandle = group.targetHandle;
      
      if (group.isSelfLoop) {
        sourceHandle = 'right-source';
        targetHandle = 'left-target';
      }
        
      return {
        id: edgeId,
        source: firstTransition.from,
        target: firstTransition.to,
        label: inputs,
        animated: group.isHighlighted,
        isSelfLoop: firstTransition.from === firstTransition.to,
        type: group.isSelfLoop ? 'selfconnecting' : 'default',
        style: { 
          stroke: group.isHighlighted ? '#FF5733' : '#333',
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 10,
          height: 10,
          color: group.isHighlighted ? '#FF5733' : '#333',
        },
        sourceHandle: sourceHandle,
        targetHandle: targetHandle,
        data: {
          transitionIds: group.transitions.map(t => t.id),
          isHighlighted: group.isHighlighted
        }
      };
    });
  }, [transitions]);

  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);
  
  const onReconnect = useCallback(
    (oldEdge, newConnection) => {
      const relevantTransitionIds = oldEdge.data?.transitionIds || [];
      
      const updatedTransitions = [...transitions];
      
      relevantTransitionIds.forEach(id => {
        const transitionIndex = updatedTransitions.findIndex(t => t.id === id);
        if (transitionIndex !== -1) {
          const oldTransition = updatedTransitions[transitionIndex];
          const input = oldTransition.input;
          
          const newId = `${newConnection.source}-${input}-${newConnection.target}`;
          
          updatedTransitions[transitionIndex] = {
            ...oldTransition,
            id: newId,
            from: newConnection.source,
            to: newConnection.target,
            sourceHandle: newConnection.sourceHandle,
            targetHandle: newConnection.targetHandle
          };
        }
      });
      
      // extra check for dfa to see if it created duplicate transitions
      if (automataType === 'dfa') {
        const duplicates = updatedTransitions.filter(t => 
          t.from === newConnection.source && 
          updatedTransitions.filter(other => 
            other.from === t.from && 
            other.input === t.input && 
            other.id !== t.id
          ).length > 0
        );
        
        if (duplicates.length > 0) {
          alert('This change would create duplicate transitions for a DFA. Reconnection cancelled.');
          return;
        }
      }
      
      // Update transitions state with the modified transitions
      setTransitions(updatedTransitions);
    },
    [transitions, automataType, setTransitions]
  );

  // Handle edge creation by user interaction - optimized with proper dependencies
  const onConnect = useCallback(
    (params) => {
      if (!inputSymbol) {
        alert('Please select an input symbol before creating a transition');
        return;
      }
      
      // For DFAs, validate that there's no duplicate transition
      if (automataType === 'dfa') {
        const existingTransition = transitions.find(
          t => t.from === params.source && t.input === inputSymbol
        );
        
        if (existingTransition) {
          alert('A DFA cannot have multiple transitions from the same state with the same input');
          return;
        }
      }
      
      const newTransition = {
        id: `${params.source}-${inputSymbol}-${params.target}`,
        from: params.source,
        to: params.target,
        input: inputSymbol,
        sourceHandle: params.sourceHandle,
        targetHandle: params.targetHandle
      };
      
      setTransitions(prevTransitions => [...prevTransitions, newTransition]);
      setInputSymbol('');
    },
    [automataType, inputSymbol, transitions, setTransitions, setInputSymbol]
  );

  // Wrapper for highlightSimulationPath to update transitions
  const handleHighlightPath = useCallback((stepIndex) => {
    const updatedTransitions = highlightSimulationPath(stepIndex);
    if (updatedTransitions) {
      setTransitions(updatedTransitions);
    }
  }, [highlightSimulationPath, setTransitions]);

  // Memoize the ReactFlow initialization function
  const onInit = useCallback(instance => {
    setReactFlowInstance(instance);
  }, []);
  
  // Performance-optimized rendering
  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Finite Automata</h1>
        <p className="subtitle">Create, visualize, and test deterministic and non-deterministic finite automata</p>
      </div>

      <div className="content-grid">
        <FAControlPanel
          automataType={automataType}
          setAutomataType={setAutomataType}
          toggleStartState={toggleStartState}
          states={states}
          transitions={transitions}
          alphabet={alphabet}
          setAlphabet={setAlphabet}
          newStateName={newStateName}
          setNewStateName={setNewStateName}
          isAcceptState={isAcceptState}
          setIsAcceptState={setIsAcceptState}
          inputSymbol={inputSymbol}
          setInputSymbol={setInputSymbol}
          setStartState={setStartState}
          exportAutomaton={() => exportAutomaton(states, transitions, alphabet, automataType, nodePositions)}
          importAutomaton={(jsonData) => {
            const imported = importAutomaton(jsonData);
            setStates(imported.states);
            setTransitions(imported.transitions);
            setAlphabet(imported.alphabet);
            setAutomataType(imported.automataType);
            if (imported.nodePositions && Object.keys(imported.nodePositions).length > 0) {
              setNodePositions(imported.nodePositions);
            }
            setCurrentSimulation(null);
            setTestResult(null);
            alert('Automaton successfully imported!');
          }}
          handleAddState={handleAddState}
          handleAddTransition={handleAddTransition}
          handleRemoveState={handleRemoveState}
          handleRemoveTransition={handleRemoveTransition}
          toggleAcceptState={toggleAcceptState}
          toggleAutomataType={toggleAutomataType}
          resetAutomaton={resetAutomaton}
          showInputOptions={showInputOptions}
          setShowInputOptions={setShowInputOptions}
          fromState={fromState}
          setFromState={setFromState}
          toState={toState}
          setToState={setToState}
        />
        
        <div className="visualization-area">
          <div className="reactflow-wrapper" style={{ height: 600 }}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onReconnect={onReconnect}
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={onInit}
              onNodeDragStop={onNodeDragStop}
              fitView
            >
              <Controls />
              <Background variant="dots" gap={12} size={1} />
            </ReactFlow>
          </div>
          
          <div className="testing-panel">
            <h2>Test Input String</h2>
            <div className="input-group">
              <input
                type="text"
                value={inputString}
                onChange={(e) => setInputString(e.target.value)}
                placeholder="Enter string to test..."
              />
              <button className="control-button" onClick={testString}>Test</button>
            </div>
            
            {currentSimulation && (
              <div className="simulation-controls">
                <div className="button-group">
                  <button
                    className="control-button"
                    onClick={() => handleHighlightPath(-1)}
                    disabled={simulationStep <= -1}
                  >
                    Reset
                  </button>
                  <button
                    className="control-button"
                    onClick={() => handleHighlightPath(simulationStep - 1)}
                    disabled={simulationStep <= 0}
                  >
                    Prev
                  </button>
                  <button
                    className="control-button"
                    onClick={() => handleHighlightPath(simulationStep + 1)}
                    disabled={simulationStep >= currentSimulation.steps.length}
                  >
                    Next
                  </button>
                  <button
                    className="control-button"
                    onClick={() => handleHighlightPath(currentSimulation.steps.length)}
                    disabled={simulationStep >= currentSimulation.steps.length}
                  >
                    End
                  </button>
                </div>
                
                <div className="string-display">
                  {currentSimulation.inputString.split('').map((char, i) => (
                    <span 
                      key={i}
                      className={`input-char ${i === currentSimulation.position ? 'active-char' : ''} ${i < currentSimulation.position ? 'processed-char' : ''}`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="result-display">
              {testResult ? (
                <div className={`result-message ${testResult.accepted ? 'accepted' : 'rejected'}`}>
                  {testResult.reason}
                </div>
              ) : (
                <div className="placeholder-result">Test a word to see results</div>
              )}
            </div>

            {currentSimulation && currentSimulation.steps && currentSimulation.steps.length > 0 && (
              <div className="steps-display">
                <h3>Simulation Steps</h3>
                <div className="steps-container">
                  {currentSimulation.steps.map((step, index) => {
                    // Get CSS classes for highlighting current step
                    const isCurrentStep = simulationStep === index;
                    const stepClasses = `step-item ${isCurrentStep ? 'current-step' : ''}`;
                    
                    if (currentSimulation.isNFA) {
                      return (
                        <div key={index} className={stepClasses}>
                          <div className="step-header">
                            <div className="step-left">
                              <span className="step-number">Step {index + 1}</span>
                            </div>
                            <span className="step-indicator">{isCurrentStep ? '●' : ''}</span>
                          </div>
                          
                          <div className="step-content">
                            <div className="nfa-state-flow">
                              <div className="state-set from-states">
                                <div className="state-set-label">From States:</div>
                                <div className="state-bubbles">
                                  {step.fromStates.map((id, i) => (
                                    <div key={i} className="state-bubble">
                                      {states.find(s => s.id === id)?.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              <div className="flow-arrow">→</div>
                              <div className="state-set to-states">
                                <div className="state-set-label">To States:</div>
                                <div className="state-bubbles">
                                  {step.toStates.map((id, i) => (
                                    <div key={i} className="state-bubble">
                                      {states.find(s => s.id === id)?.name}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                            
                            <div className="transitions-table">
                              <div className="table-header">
                                <div>From</div>
                                <div></div>
                                <div>To</div>
                              </div>
                              {step.transitions.map((t, tidx) => (
                                <div key={tidx} className="transition-row">
                                  <div className="from-state">{states.find(s => s.id === t.fromState)?.name}</div>
                                  <div className="transition-symbol">{t.symbol}</div>
                                  <div className="to-state">{states.find(s => s.id === t.toState)?.name}</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div key={index} className={stepClasses}>
                          <div className="step-header">
                            <div className="step-left">
                              <span className="step-number">Step {index + 1}</span>
                              <span className="step-symbol-badge">{step.symbol}</span>
                            </div>
                            <span className="step-indicator">{isCurrentStep ? '●' : ''}</span>
                          </div>
                          
                          <div className="step-content">
                            <div className="dfa-transition">
                              <div className="state-bubble from-state">
                                {states.find(s => s.id === step.fromState)?.name}
                              </div>
                              <div className="transition-path">
                                <div className="transition-label">{step.symbol}</div>
                                <div className="transition-line"></div>
                                <div className="transition-arrow">▶</div>
                              </div>
                              <div className="state-bubble to-state">
                                {states.find(s => s.id === step.toState)?.name}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FiniteAutomata);