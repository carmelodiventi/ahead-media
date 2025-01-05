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
      isConnectable={connectionCount ? connections.length < connectionCount : true}
    />
  );
};

export default CustomHandle;
