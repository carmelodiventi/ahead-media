import React, {useEffect, useMemo, useState} from 'react';
import {NodeProps, ReactFlowState} from '@xyflow/react';
import {RegularWorkflowNodeType, WorkflowNode} from '../../../../types/Workflow.types';
import CustomNode from '../customNode/CustomNode';
import {
  Flex,
  Grid,
  Switch,
  Text,
  TextArea,
  TextField,
} from '@radix-ui/themes';
import InputPrompt from '../components/inputPrompt/InputPrompt';
import InputSlider from '../components/inputSlider';
import { ExtractedVars, extractVariables } from '../../utils/extractVariables';
import MappingEditor from '../components/mappingEditor';
import {getCandidateSources} from "../../utils/getCandidateSources";
import {useWorkflowState} from "../../helpers/useWorkflowState";

const SequentialNode: React.FC<NodeProps<RegularWorkflowNodeType>> = (
  props
) => {
  const { data, id } = props;
  const { nodes, edges, config } = useWorkflowState();

  console.log(nodes);

  const [name, setName] = useState(data.name);
  const [systemPrompt, setSystemPrompt] = useState(data.systemPrompt);
  const [userPrompt, setUserPrompt] = useState(data.userPrompt);
  const [llmParams, setLlmParams] = useState(
    data.llmParams || { temperature: 0.2 }
  );
  const [stream, setStream] = useState(data.stream);
  const [expectJson, setExpectJson] = useState(data.expectJson);
  const [zodSchema, setZodSchema] = useState(data.zodSchema);

  // Mappings
  const [inputMapping, setInputMapping] = useState(data.inputMapping || {});
  const [outputMapping, setOutputMapping] = useState(data.outputMapping || {});

  const [variables, setVariables] = useState<ExtractedVars>(
    data.variables || { required: [], optional: [] }
  );

  // Step output
  const [stepOutput, setStepOutput] = useState<string | Record<string, any>>(
    data.stepOutput || ''
  );

  // Parse prompt variables
  useEffect(() => {
    const extracted = extractVariables(userPrompt);
    setVariables(extracted);
  }, [userPrompt]);

  // Sync node data
  useEffect(() => {
    data.onChange(id, {
      ...data,
      name,
      systemPrompt,
      userPrompt,
      llmParams,
      stream,
      expectJson,
      zodSchema,
      inputMapping,
      outputMapping,
      variables,
      stepOutput,
    });
  }, [
    name,
    systemPrompt,
    userPrompt,
    llmParams,
    stream,
    expectJson,
    zodSchema,
    inputMapping,
    outputMapping,
    variables,
    stepOutput,
    id,
    data,
  ]);

  // Handler for LLM param changes
  const handleLlmParamsChange = (
    target: keyof typeof llmParams,
    value: number
  ) => {
    setLlmParams((prevParams) => ({
      ...prevParams,
      [target]: Number(value),
    }));
  };

  const handleZodSchemaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setZodSchema(e.target.value);
  };

  const candidateSources = useMemo(() => {
    return getCandidateSources(
      nodes as WorkflowNode[],
      edges,
      config,
      id
    );
  }, [nodes, edges, config, id]);

  return (
    <CustomNode
      data={{
        label: 'Sequential Step',
        description: 'Step in the workflow and is executed sequentially',
        handles: {
          source: { show: true, connectionCount: 1 },
          target: { show: true, connectionCount: 1 },
        },
      }}
    >
      <Grid gap="4" align="start">
        {/* Name */}
        <Text size="2">Name:</Text>
        <TextField.Root
          type="text"
          placeholder="Name"
          className="nodrag"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        {/* System Prompt */}
        <InputPrompt
          label="System Prompt"
          prompt={systemPrompt}
          setPrompt={setSystemPrompt}
        />

        {/* User Prompt */}
        <InputPrompt
          label="User Prompt"
          prompt={userPrompt}
          setPrompt={setUserPrompt}
        />

        {/* Display Variables */}
        <Text size="2">Variables in Prompt:</Text>
        <Flex direction="column" gap="1" style={{ marginBottom: '8px' }}>
          <Text size="2" color="gray">
            Required: {variables?.required?.join(', ') || 'None'}
          </Text>
          <Text size="2" color="gray">
            Optional: {variables?.optional?.join(', ') || 'None'}
          </Text>
        </Flex>

        {/* LLM Parameter Sliders */}
        <InputSlider
          label="Temperature"
          max={1}
          min={0}
          step={0.1}
          value={[llmParams.temperature ?? 0.2]}
          defaultValue={[llmParams.temperature ?? 0.2]}
          onValueChange={(value) =>
            handleLlmParamsChange('temperature', value[0])
          }
        />
        <InputSlider
          label="Frequency Penalty"
          max={2}
          min={0}
          step={1}
          value={[llmParams.frequencyPenalty ?? 0]}
          defaultValue={[llmParams.frequencyPenalty ?? 0]}
          onValueChange={(value) =>
            handleLlmParamsChange('frequencyPenalty', value[0])
          }
        />
        <InputSlider
          label="Presence Penalty"
          max={2}
          min={0}
          step={1}
          value={[llmParams.presencePenalty ?? 0]}
          defaultValue={[llmParams.presencePenalty ?? 0]}
          onValueChange={(value) =>
            handleLlmParamsChange('presencePenalty', value[0])
          }
        />

        {/* Stream Toggle */}
        <Text size="2">Stream:</Text>
        <Flex align="center">
          <Switch
            className="nodrag"
            checked={stream}
            onCheckedChange={(checked) => setStream(checked)}
          />
        </Flex>

        {/* Expect JSON Toggle + Zod Schema */}
        <Text size="2">Expect JSON:</Text>
        <Flex align="center">
          <Switch
            className="nodrag"
            checked={expectJson}
            onCheckedChange={(checked) => setExpectJson(checked)}
          />
        </Flex>
        {expectJson && (
          <>
            <Text size="2">Zod Schema:</Text>
            <TextArea
              className="nodrag"
              placeholder="Zod Schema"
              value={zodSchema as string}
              onChange={handleZodSchemaChange}
            />
          </>
        )}

        {/* Input Mapping (reuse MappingEditor) */}
        <MappingEditor
          label="Input Mapping"
          mapping={inputMapping}
          setMapping={setInputMapping}
          variablePlaceholder="Enter prompt var to fill"
          sourcePlaceholder="Source (e.g. initialInputs.about)"
          readOnlyKeys={false}
        />

        {/* Output Mapping (reuse MappingEditor) */}
        <MappingEditor
          label="Output Mapping"
          mapping={outputMapping}
          setMapping={setOutputMapping}
          variablePlaceholder="Alias for this output"
          sourcePlaceholder="(Optional) JSON path or leave blank"
          readOnlyKeys={false}
          candidateSources={candidateSources}
        />

        {/* Step Output (Raw LLM Result) */}
        <Text size="2">Step Output (example):</Text>
        <TextArea
          className="nodrag"
          placeholder="LLM response or JSON"
          rows={3}
          value={
            typeof stepOutput === 'string'
              ? stepOutput
              : JSON.stringify(stepOutput, null, 2)
          }
          onChange={(e) => setStepOutput(e.target.value)}
        />
      </Grid>
    </CustomNode>
  );
};

export default SequentialNode;
