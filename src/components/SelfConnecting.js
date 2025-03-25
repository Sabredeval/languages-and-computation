import React from 'react';
import { BaseEdge, BezierEdge, EdgeLabelRenderer } from '@xyflow/react';
 
export default function SelfConnecting(props) {
  // we are using the default bezier edge when source and target ids are different
  if (props.source !== props.target) {
    return <BezierEdge {...props} />;
  }

  const { sourceX, sourceY, targetX, targetY, markerEnd, label, style, data } = props;
  
  const xOffset = 40;
  const yOffset = 85;

  const radiusX = (sourceX - targetX) * 0.6;
  const radiusY = 50;

  const edgePath = `M ${sourceX - 5} ${sourceY} A ${radiusX} ${radiusY} 0 1 0 ${
    targetX + 2
  } ${targetY}`;
  
  const labelX = sourceX - xOffset;
  const labelY = sourceY - yOffset;
  
  const isHighlighted = style?.stroke === '#FF5733' || data?.isHighlighted;
  
  return (
    <>
      <BaseEdge path={edgePath} markerEnd={markerEnd} style={style} />
      
      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
              background: isHighlighted ? '#fff3e0' : 'white',
              padding: '4px 6px',
              borderRadius: '4px',
              fontSize: '12px',
              fontWeight: 'bold',
              border: `1px solid ${isHighlighted ? '#FF5733' : '#ccc'}`,
              color: isHighlighted ? '#FF5733' : 'inherit',
              zIndex: 10,
              pointerEvents: 'all',
              userSelect: 'none',
              whiteSpace: 'nowrap'
            }}
            className="nodrag nopan"
          >
            {label}
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
}