import { memo } from 'react';
import { Position } from '@xyflow/react';
import { Node } from './CustomNode.styles';
import CustomHandle from '../customHandle';
import {useTheme} from "next-themes";

interface CustomNodeProps {
  data: {
    label: string;
    description?: string;
    handles?: {
      source?: { show?: boolean; connectionCount?: number };
      target?: { show?: boolean; connectionCount?: number };
    };
  };
  selected?: boolean;
  children: React.ReactNode;
}

export default memo(
  ({ data, selected, children, ...rest }: CustomNodeProps) => {

    const { resolvedTheme } = useTheme();

    return (
      <Node selected={selected ?? false} theme={resolvedTheme} {...rest}>
        {data?.handles?.target?.show ? (
          <CustomHandle
            type="target"
            position={Position.Left}
            connectionCount={data.handles?.target?.connectionCount}
          />
        ) : null}
        <div className={'label'}>
          <strong>{data.label}</strong>
          {data.description && <p>{data.description}</p>}
        </div>
        <div>{children}</div>
        {data?.handles?.source?.show ? (
          <CustomHandle
            type="source"
            position={Position.Right}
            connectionCount={data.handles?.source?.connectionCount}
          />
        ) : null}
      </Node>
    );
  }
);
