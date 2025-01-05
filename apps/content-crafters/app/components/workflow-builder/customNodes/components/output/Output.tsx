import React from 'react';
import { Dialog, Flex, Text, TextField } from '@radix-ui/themes';
import { InputIcon } from '@radix-ui/react-icons';
import {RegularWorkflowStep, WorkflowNode} from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';
import AceEditor from 'react-ace';
import 'ace-builds/src-noconflict/mode-json';
import 'ace-builds/src-noconflict/theme-github';
import {OnConnect, Position} from "@xyflow/react";
import CustomHandle from "../../../customHandle";

interface OutputProps {
  data: RegularWorkflowStep;
}

const Output: React.FC<OutputProps> = ({ data }) => {
  const { onNodeChange, nodes } = useWorkflowState();
  const [showEditor, setShowEditor] = React.useState(false);

  const onConnect: OnConnect = (params) => {
    const targetNode = nodes.find((node) => node.id === params.target)?.data;
    const sourceNode = nodes.find((node) => node.id === params.source)?.data;

    if (!targetNode || !sourceNode) return;

    onNodeChange(params.target, {
      ...targetNode.data as WorkflowNode['data'],
      inputMapping: {
        ...data.inputMapping,
        [params.targetHandle as string]: `${data.id}`,
      },
    });
  }

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

        {data.expectJson ? (
          <TextField.Root
            onClick={() => setShowEditor(!showEditor)}
            value={data.stepOutput ? JSON.stringify(data.stepOutput) : ""}
          >
            <TextField.Slot side={'right'}>
              <InputIcon />
            </TextField.Slot>
          </TextField.Root>
        ) : null}

        <CustomHandle
          position={Position.Right}
          type="source"
          id={`output-${data.name}`}
          connectionCount={1}
          onConnect={onConnect}
        />

      </Flex>
      <Dialog.Root open={showEditor} onOpenChange={() => setShowEditor(false)}>
        <Dialog.Content>
          <Dialog.Title>Edit JSON</Dialog.Title>
          <Dialog.Description size="2" mb="4">
            Edit the JSON output of this step.
          </Dialog.Description>
          <AceEditor
            mode="json"
            theme="github"
            value={JSON.stringify(data.stepOutput) || ""}
            onChange={(newValue) => {
              onNodeChange(data.id as string, {
                ...data,
                stepOutput: newValue,
              });
            }}
            name="UNIQUE_ID_OF_DIV"
            editorProps={{ $blockScrolling: true }}
          />
        </Dialog.Content>
      </Dialog.Root>
    </>
  );
};

export default Output;
