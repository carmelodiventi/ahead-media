import React from 'react';
import { Flex, Text } from '@radix-ui/themes';
import {
  RegularWorkflowStep,
  WorkflowNode,
} from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';
import { OnConnect, Position } from '@xyflow/react';
import CustomHandle from '../../../customHandle';

interface OutputProps {
  data: RegularWorkflowStep;
}

const Output: React.FC<OutputProps> = ({ data }) => {
  const { onNodeChange, nodes } = useWorkflowState();

  const onConnect: OnConnect = (params) => {
    const targetNode = nodes.find((node) => node.id === params.target)?.data;
    const sourceNode = nodes.find((node) => node.id === params.source)?.data;

    if (!targetNode || !sourceNode) return;

    // @ts-ignore
    const { inputMapping }: { inputMapping: Record<string, string> } =
      targetNode;

    onNodeChange(params.target, {
      ...(targetNode.data as WorkflowNode['data']),
      inputMapping: {
        ...inputMapping,
        [params.targetHandle as string]: `${data.id}`,
      },
    });
  };

  return (
    <>
      <Flex
        direction="column"
        p={'4'}
        gap="2"
        position={'relative'}
        style={{
          background: 'rgba(0, 0, 0, 0.05)',
        }}
      >
        <Text size="2" weight="bold">
          Output
        </Text>

        <CustomHandle
          position={Position.Right}
          type="source"
          id={`output-${data.name}`}
          connectionCount={1}
          onConnect={onConnect}
        />
      </Flex>
    </>
  );
};

export default Output;
