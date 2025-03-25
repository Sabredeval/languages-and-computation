import React from 'react';
import { Handle } from '@xyflow/react';

const StateNode = ({ data }) => {
  const { label, isStart, isAccept, isCurrentState } = data;
  
  return (
    <div className={`state-node ${isAccept ? 'accept-state' : ''} ${isCurrentState ? 'current-state' : ''}`}>
      <Handle type="target" position="left" id="left-target" />
      <Handle type="source" position="left" id="left-source" />
      <Handle type="target" position="right" id="right-target" />
      <Handle type="source" position="right" id="right-source" />
      <Handle type="target" position="top" id="top-target" />
      <Handle type="source" position="top" id="top-source" />
      <Handle type="target" position="bottom" id="bottom-target" />
      <Handle type="source" position="bottom" id="bottom-source" />
      {isStart && <div className="start-indicator">Start</div>}
      <div className="state-content">
        <div className="state-label">{label}</div>
      </div>
    </div>
  );
};

export default StateNode;