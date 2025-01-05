import React from 'react';
import { Handle, HandleProps, useHandleConnections } from '@xyflow/react';

const CustomHandle: React.FC<
  HandleProps & {
    connectionCount?: number;
  }
> = (props) => {
  const connections = useHandleConnections({
    type: props.type,
  });

  const { connectionCount, ...rest } = props;

  return (
    <Handle
      {...rest}
      style={{
        height: '14px',
        width: '14px',
        background: 'var(--accent-9)',
        border: '3px solid var(--accent-5)',
      }}
      isConnectable={connectionCount ? connections.length < connectionCount : true}
    />
  );
};

export default CustomHandle;
