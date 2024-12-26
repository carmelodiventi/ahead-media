import React, { useState, useEffect, useCallback } from 'react';
import { Handle, Position, NodeProps } from '@xyflow/react';
import {
  Card,
  Grid,
  Text,
  TextArea,
  TextField,
  Flex,
  Switch,
  Heading,
  Select,
  CheckboxCards,
} from '@radix-ui/themes';
import InputsEditor from './components/inputsEditor';
import InputMappingEditor from './components/inputMappingEditor';
import {
  ForEachWorkflowNodeType,
  RegularWorkflowNodeType,
  WorkflowConfig,
  WorkflowConfigNodeType,
  WorkflowInput,
} from '../../../types/Workflow.types';

export const WorkflowConfigNode: React.FC<NodeProps<WorkflowConfigNodeType>> = (
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
    <Card>
      <Heading size={'2'}>Workflow Config</Heading>
      <Text size={'1'} color={'gray'}>
        Add the workflow configuration
      </Text>
      <Grid gap={'2'} columns={'2'} mt={'4'}>
        <Text size={'2'}>Name</Text>
        <TextField.Root
          type="text"
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
      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export const SequentialNode: React.FC<NodeProps<RegularWorkflowNodeType>> = (
  props
) => {
  const { data, id } = props;
  const availableInputsFromProps = data.availableInputs;
  const initialWorkflowConfig = data.initialWorkflowConfig as WorkflowConfig;
  const availableInputs = availableInputsFromProps.filter(
    (input) =>
      !Object.keys(data.initialWorkflowConfig?.inputs || {}).includes(input)
  );

  const [name, setName] = useState(data.name);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt);
  const [userPrompt, setUserPrompt] = useState(data.userPrompt);
  const [useInputs, setUseInputs] = useState(data.usesInputs || []);
  const [inputMapping, setInputMapping] = useState(data.inputMapping || {});
  const [llmParams, setLlmParams] = useState(data.llmParams || {});
  const [stream, setStream] = useState(data.stream);
  const [expectJson, setExpectJson] = useState(data.expectJson);
  const [zodSchema, setZodSchema] = useState(data.zodSchema);

  useEffect(() => {
    data.onChange(id, {
      ...data,
      name,
      systemPrompt,
      userPrompt,
      usesInputs: useInputs,
      inputMapping,
      llmParams,
      stream,
      expectJson,
      zodSchema,
    });
  }, [
    name,
    systemPrompt,
    userPrompt,
    useInputs,
    inputMapping,
    llmParams,
    stream,
    expectJson,
    zodSchema,
    id,
    data,
  ]);

  const handleUseInputChange = (newValue: string[]) => {
    setUseInputs(newValue);
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

  const handleZodSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setZodSchema(e.target.value);
  };

  return (
    <Card>
      <Handle type="target" position={Position.Left} />

      <Grid gap={'4'} align={'start'}>
        <Text size={'2'}>Name:</Text>
        <TextField.Root
          type="text"
          placeholder="Name"
          className={'nodrag'}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <Text size={'2'}>System Prompt:</Text>
        <TextArea
          placeholder="System Prompt"
          className={'nodrag'}
          value={systemPrompt}
          onChange={(e) => setSystemPrompt(e.target.value)}
        />

        <Text size={'2'}>User Prompt:</Text>
        <TextArea
          placeholder="User Prompt"
          className={'nodrag'}
          value={userPrompt}
          onChange={(e) => setUserPrompt(e.target.value)}
        />

        <Text size={'2'}>Use Inputs:</Text>

        <CheckboxCards.Root
          defaultValue={['']}
          columns={{ initial: '1', sm: '3' }}
        >
          {Object.keys(initialWorkflowConfig?.inputs || {}).map((inputName) => (
            <CheckboxCards.Item value={inputName} key={inputName}>
              <Flex direction="column" width="100%">
                <Text weight="bold"> {inputName} </Text>
              </Flex>
            </CheckboxCards.Item>
          ))}
          {availableInputs.map((input) => (
            <CheckboxCards.Item value={input} key={input}>
              <Flex direction="column" width="100%">
                <Text weight="bold"> {input}</Text>
              </Flex>
            </CheckboxCards.Item>
          ))}
        </CheckboxCards.Root>

        <Text size={'2'}>Temperature:</Text>
        <TextField.Root
          className={'nodrag'}
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
          className={'nodrag'}
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
          className={'nodrag'}
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
            className={'nodrag'}
            checked={stream}
            onCheckedChange={(checked) => setStream(checked)}
          />
        </Flex>

        <Text size={'2'}>Expect JSON:</Text>
        <Flex align="center">
          <Switch
            className={'nodrag'}
            checked={expectJson}
            onCheckedChange={(checked) => setExpectJson(checked)}
          />
        </Flex>

        {expectJson ? (
          <>
            <Text size={'2'}>Zod Schema:</Text>
            <TextArea
              className={'nodrag'}
              placeholder="Zod Schema"
              value={data.zodSchema as string}
              onChange={handleZodSchemaChange}
            />
          </>
        ) : null}

        <InputMappingEditor
          inputMapping={inputMapping}
          setInputMapping={setInputMapping}
          availableInputs={[
            ...Object.keys(data.initialWorkflowConfig?.inputs || {}),
            ...availableInputs,
          ]}
          nodeId={id}
        />
      </Grid>

      <Handle type="source" position={Position.Right} />
    </Card>
  );
};

export const ForEachNode: React.FC<NodeProps<ForEachWorkflowNodeType>> = (
  props
) => {
  const { data } = props;
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
