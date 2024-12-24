import React, { useState, useEffect } from 'react';
import { Handle, Position } from '@xyflow/react';
import {
  ForEachWorkflowStep,
  NodeData,
  RegularWorkflowStep,
} from '../../types/Workflow.types';
import {
  Card,
  Grid,
  Text,
  TextArea,
  TextField,
  Flex,
  Switch,
} from '@radix-ui/themes';
import InputMappingEditor from './components/inputMappingEditor';

export interface NodeProps<
  T extends {
    onChange: (id: string, updatedData: NodeData) => void;
    availableInputs: string[];
  }
> {
  data: T;
  id: string;
}

export const SequentialNode: React.FC<
  NodeProps<
    RegularWorkflowStep & {
      onChange: (id: string, updatedData: NodeData) => void;
      availableInputs: string[];
    }
  >
> = ({ data, id }) => {
  const { onChange, availableInputs } = data;
  const [name, setName] = useState(data.name);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt);
  const [userPrompt, setUserPrompt] = useState(data.userPrompt);
  const [requiredInputs, setRequiredInputs] = useState(
    data.required_inputs || []
  );
  const [optionalInputs, setOptionalInputs] = useState(
    data.optional_inputs || []
  );
  const [inputMapping, setInputMapping] = useState(data.inputMapping || {});
  const [llmParams, setLlmParams] = useState(data.llmParams || {});
  const [stream, setStream] = useState(data.stream);

  useEffect(() => {
    onChange(id, {
      ...data,
      name,
      systemPrompt,
      userPrompt,
      required_inputs: requiredInputs,
      optional_inputs: optionalInputs,
      inputMapping,
      llmParams,
      stream,
    });
  }, [
    name,
    systemPrompt,
    userPrompt,
    requiredInputs,
    optionalInputs,
    inputMapping,
    llmParams,
    stream,
    onChange,
    id,
    data,
  ]);

  const handleRequiredInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setRequiredInputs(e.target.value.split(',').map((item) => item.trim()));
  };

  const handleOptionalInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setOptionalInputs(e.target.value.split(',').map((item) => item.trim()));
  };

  const handleLlmParamsChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setLlmParams((prevParams) => ({
      ...prevParams,
      [event.target.name]:
        event.target.value === '' ? undefined : Number(event.target.value),
    }));
  };

  return (
    <Card>
      <Handle type="target" position={Position.Left} />

      <Grid gap={'4'} align={'start'}>
        <Text size={'2'}>Name:</Text>
        <TextField.Root
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Text size={'2'}>System Prompt:</Text>
        <TextArea
          placeholder="System Prompt"
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />

        <Text size={'2'}>User Prompt:</Text>
        <TextArea
          placeholder="User Prompt"
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />

        <Text size={'2'}>Required Inputs:</Text>

        <TextField.Root
          type="text"
          placeholder="Required Inputs (comma-separated)"
          value={requiredInputs.join(',')}
          onChange={handleRequiredInputChange}
        />

        <Text size={'2'}>Optional Inputs:</Text>
        <TextField.Root
          type="text"
          placeholder="Optional Inputs (comma-separated)"
          value={optionalInputs.join(',')}
          onChange={handleOptionalInputChange}
        />

        <Text size={'2'}>Temperature:</Text>
        <TextField.Root
          type="number"
          name="temperature"
          placeholder="0.7"
          max="1"
          min="0"
          value={llmParams.temperature ?? ''}
          onChange={handleLlmParamsChange}
        />

        <Text size={'2'}>Frequency Penalty:</Text>
        <TextField.Root
          type="number"
          name="frequencyPenalty"
          placeholder="0.5"
          max="1"
          min="0"
          value={llmParams.frequencyPenalty ?? ''}
          onChange={handleLlmParamsChange}
        />

        <Text size={'2'}>Presence Penalty:</Text>
        <TextField.Root
          type="number"
          name="presencePenalty"
          placeholder="0.5"
          max="1"
          min="0"
          value={llmParams.presencePenalty ?? ''}
          onChange={handleLlmParamsChange}
        />

        <Text size={'2'}>Stream:</Text>
        <Flex align="center">
          <Switch
            checked={stream}
            onCheckedChange={(checked) => setStream(checked)}
          />
        </Flex>

        <InputMappingEditor
          inputMapping={inputMapping}
          setInputMapping={setInputMapping}
          availableInputs={availableInputs}
          nodeId={id}
        />
      </Grid>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export const ForEachNode: React.FC<
  NodeProps<
    ForEachWorkflowStep & {
      onChange: (id: string, updatedData: NodeData) => void;
      availableInputs: string[];
    }
  >
> = ({ data }) => {
  const [name, setName] = useState(data.name);
  const [source, setSource] = useState(data.for_each_config.source);
  const [field, setField] = useState(data.for_each_config.field);
  const [itemInputParameterName, setItemInputParameterName] = useState(
    data.for_each_config.item_input_parameter_name
  );

  return (
    <Card>
      <Handle type="target" position={Position.Left} />
      <Grid gap={'2'} columns={'2'}>
        <Text size={'2'}>Name:</Text>
        <TextField.Root
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <Text size={'2'}>Source:</Text>
        <TextField.Root
          type="text"
          value={source}
          onChange={(e) => setSource(e.target.value)}
        />
        <Text size={'2'}>Field:</Text>
        <TextField.Root
          type="text"
          value={field}
          onChange={(e) => setField(e.target.value)}
        />
        <Text size={'2'}>Input Parameter Name:</Text>
        <TextField.Root
          type="text"
          value={itemInputParameterName}
          onChange={(e) => setItemInputParameterName(e.target.value)}
        />
      </Grid>
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};
