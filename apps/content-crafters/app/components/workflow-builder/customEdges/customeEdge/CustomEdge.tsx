import { EdgeProps } from 'reactflow';
import { Text } from '@radix-ui/themes';
import React from 'react';

export const CustomEdge = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style,
  markerEnd,
}: EdgeProps) => {
  const edgePath = `M ${sourceX},${sourceY} L ${targetX},${targetY}`; // Simple path drawing logic

  return (
    <>
      <path
        id={id}
        style={style}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
      />
      {/* Your label here, position it accordingly using transform translate, or rotate */}
      <Text
        style={{
          marginLeft: 10,
          marginTop: -20,
          position: 'absolute',
          transform: 'rotate(-25deg)',
        }}
      >
        Workflow edge
      </Text>
    </>
  );
};

export default CustomEdge;
