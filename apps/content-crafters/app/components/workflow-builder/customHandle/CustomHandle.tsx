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

  return (
    <Handle
      {...props}
      isConnectable={props.connectionCount ? connections.length < props.connectionCount : true}
    />
  );
};

export default CustomHandle;
