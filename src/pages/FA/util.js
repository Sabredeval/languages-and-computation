/**
 * Automata import/export utilities
 */

export function exportAutomaton(states, transitions, alphabet, automataType, nodePositions) {
    try {

        const statesWithPositions = states.map(state =>({
            ...state,
            position: nodePositions[state.id] || { x : 0, y : 0}
        }))

        const data = {
            automataType,
            alphabet,
            states: statesWithPositions,
            transitions,
        };
        
        console.log("exported automaton:", data);

        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement("a");
        link.href = url;
        link.download = `${automataType}-automaton.json`;
        document.body.appendChild(link);
        link.click();
        
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error("Error exporting automaton:", error);
        return false;
    }
  }
    
export function importAutomaton(jsonData) {
    try {
      const data = JSON.parse(jsonData);
      
      if (!data.states || !data.transitions || !data.alphabet || !data.automataType) {
        throw new Error("Invalid automaton format: missing required properties");
      }
      
      if (!['dfa', 'nfa'].includes(data.automataType)) {
        throw new Error("Invalid automaton type: must be 'dfa' or 'nfa'");
      }
      
      if (!data.states.every(state => 'id' in state && 'name' in state && 'isStart' in state && 'isAccept' in state)) {
        throw new Error("Invalid state format: states must have id, name, isStart, and isAccept properties");
      }
      
      if (!data.transitions.every(transition => 'id' in transition && 'from' in transition && 'to' in transition && 'input' in transition)) {
        throw new Error("Invalid transition format: transitions must have id, from, to, and input properties");
      }
      
      console.log("Imported automaton:", data);

      const nodePositions = {}
      const states = data.states.map(state => {
        if (state.position) {
            nodePositions[state.id] = {
                x: state.position.x,
                y: state.position.y
            }
        }
        
        const { position, ...stateWithoutPosition } = state;
        return stateWithoutPosition;
      })

      return {
        states,
        transitions: data.transitions,
        alphabet: data.alphabet,
        automataType: data.automataType,
        nodePositions
      };
    } catch (error) {
      throw new Error(`Failed to parse automaton file: ${error.message}`);
    }
  }