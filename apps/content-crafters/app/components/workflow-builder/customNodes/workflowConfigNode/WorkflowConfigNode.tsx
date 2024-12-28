import React, { useCallback, useEffect, useState } from 'react';
import { NodeProps, Position } from '@xyflow/react';
import {
  WorkflowConfig,
  WorkflowConfigNodeType,
  WorkflowInput,
} from '../../../../types/Workflow.types';
import CustomNode from '../customNode/CustomNode';
import { Grid, Text, TextField } from '@radix-ui/themes';
import InputsEditor from '../components/inputsEditor';
import CustomHandle from '../../customHandle';

const WorkflowConfigNode: React.FC<NodeProps<WorkflowConfigNodeType>> = (
  props
) => {
  const { data, id } = props;
  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>(data);

  const handleInputsChange = useCallback(
    (updatedInputs: Record<string, WorkflowInput>) => {
      setWorkflowConfig((prevConfig) => ({
        ...prevConfig,
        inputs: updatedInputs,
      }));
    },
    []
  );

  useEffect(() => {
    data.onChange(id, workflowConfig); //Call onChange
  }, [workflowConfig, data.onChange, id]);

  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setWorkflowConfig((prevConfig) => ({
        ...prevConfig,
        name: e.target.value,
      }));
    },
    []
  );

  return (
    <CustomNode
      data={{
        label: 'Workflow Config',
        description: 'Configure the workflow',
        handles: {
          source: {
            show: true,
            connectionCount: 1,
          },
        },
      }}
    >
      <Grid gap={'2'} columns={'1'} mt={'4'}>
        <Text size={'2'}>Name</Text>
        <TextField.Root
          type="text"
          size={'1'}
          placeholder="Name"
          className="nodrag"
          value={workflowConfig.name}
          onChange={handleNameChange}
        />
      </Grid>
      <InputsEditor
        inputs={workflowConfig.inputs}
        onChange={handleInputsChange}
      />
      <CustomHandle
        type="source"
        position={Position.Right}
        connectionCount={1}
      />
    </CustomNode>
  );
};

export default WorkflowConfigNode;
