import React from 'react';
import {
  getBezierPath,
  useStore,
  BaseEdge,
  EdgeLabelRenderer
} from '@xyflow/react';
 
export const getSpecialPath = (
  { sourceX, sourceY, targetX, targetY },
  offset,
) => {
  const centerX = (sourceX + targetX) / 2;
  const centerY = (sourceY + targetY) / 2;
 
  // Use a quadratic bezier curve with meaningful offset for better curving
  return `M ${sourceX} ${sourceY} Q ${centerX} ${
    centerY + offset
  } ${targetX} ${targetY}`;
};
 
export default function CustomEdge({
  id,
  source,
  target,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  markerEnd,
  label,
  style,
  data
}) {
  // Check for bidirectional relationship (edges going both ways between the same nodes)
  const isBiDirectionEdge = useStore(s => {
    return s.edges.some(
      (e) =>
        e.id !== id && // Not the same edge
        ((e.source === target && e.target === source) || // Reverse direction
         (e.target === source && e.source === target)) // Same connection
    );
  });
 
  const edgePathParams = {
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  };
 
  let path = '';
  let labelX, labelY;
 
  if (isBiDirectionEdge) {
    // Calculate the angle between nodes to determine best offset direction
    const dx = targetX - sourceX;
    const dy = targetY - sourceY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    
    // Use a larger offset for better visual separation
    // Scale offset based on distance between nodes for proportional curves
    const offset = 40 * (distance / 200); // 40px baseline offset scaled by distance
    
    // Apply offset in appropriate direction based on node positions
    const finalOffset = sourceX < targetX ? offset : -offset;
    
    path = getSpecialPath(edgePathParams, finalOffset);
    
    // Position label slightly off the midpoint of the curve
    const centerX = (sourceX + targetX) / 2;
    const centerY = (sourceY + targetY) / 2;
    
    // Position the label along the curve with an offset
    labelX = centerX;
    labelY = centerY + (finalOffset * 0.7); // Slightly closer to curve than the full offset
  } else {
    // Use standard bezier path for non-bidirectional edges
    [path] = getBezierPath(edgePathParams);
    
    // Position label at midpoint for standard edges
    labelX = (sourceX + targetX) / 2;
    labelY = (sourceY + targetY) / 2 - 10; // Slight upward offset for better visibility
  }
 
  // Check if edge is highlighted for styling
  const isHighlighted = data?.isHighlighted || style?.stroke === '#FF5733';
  
  return (
    <>
      <BaseEdge path={path} markerEnd={markerEnd} style={style} />
      
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
              boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
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