import React from 'react';
import { Handle } from '@xyflow/react';

const StateNode = ({ data }) => {
  const { label, isStart, isAccept, isCurrentState } = data;
  
  return (
    <div className={`state-node ${isAccept ? 'accept-state' : ''} ${isCurrentState ? 'current-state' : ''}`}>
      <Handle type="target" position="left" id="left" />
      <Handle type="source" position="right" id="right" />
      <Handle type="target" position="top" id="top" />
      <Handle type="source" position="bottom" id="bottom" />
      {isStart && <div className="start-indicator">Start</div>}
      <div className="state-content">
        <div className="state-label">{label}</div>
      </div>
    </div>
  );
};

export default StateNode;