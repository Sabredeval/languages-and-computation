import React, { useEffect, useCallback, useMemo } from 'react';
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, applyNodeChanges, MarkerType } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import SelfConnectingEdge from '../../components/SelfConnecting';
import FAControlPanel from './FAControlPanel';
import StateNode from './StateNode';
import useAutomataLogic from './useAutomataLogic';
import useSimulation from './useSimulation';
import { importAutomaton, exportAutomaton } from './util';
import '../../styles/FiniteAutomata.css';

// Define node and edge types outside the component to prevent recreation on renders
const nodeTypes = {
  stateNode: StateNode
};

const edgeTypes = {
  selfconnecting: SelfConnectingEdge
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

  // Calculate positions in a circle for new nodes - performance optimized
  useEffect(() => {
    // Only update positions for states that don't have positions yet
    let newPositionsAdded = false;
    const newNodePositions = { ...nodePositions };
    const radius = 150;
    const centerX = 250;
    const centerY = 150;
    
    states.forEach((state, index) => {
      if (!nodePositions[state.id]) {
        newPositionsAdded = true;
        const angle = (2 * Math.PI * index) / Math.max(states.length, 1);
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        newNodePositions[state.id] = { x, y };
      }
    });
    
    // Only update state if we actually added new positions
    if (newPositionsAdded) {
      setNodePositions(newNodePositions);
    }
  }, [states]); // Remove nodePositions from dependencies to prevent infinite loop

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
  
  const flowEdges = useMemo(() => (
    transitions.map(t => {
      const isSelfLoop = t.from === t.to;
      return {
        id: t.id,
        source: t.from,
        target: t.to,
        label: t.input,
        animated: t.highlight,
        type: isSelfLoop ? 'selfconnecting' : 'default',
        style: { 
          stroke: t.highlight ? '#f44336' : '#333',
          strokeWidth: t.highlight ? 3 : 1
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
        },
        sourceHandle: t.sourceHandle,
        targetHandle: t.targetHandle
      };
    })
  ), [transitions]);

  // Update nodes and edges only when their memoized values change
  useEffect(() => {
    setNodes(flowNodes);
    setEdges(flowEdges);
  }, [flowNodes, flowEdges, setNodes, setEdges]);
  
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
              onConnect={onConnect}
              nodeTypes={nodeTypes}
              edgeTypes={edgeTypes}
              onInit={onInit}
              onNodeDragStop={onNodeDragStop}
              fitView
            >
              <Controls />
              <MiniMap />
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
                <div className="placeholder-result">Test a string to see results</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(FiniteAutomata);