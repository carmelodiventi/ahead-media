import React, { useMemo } from 'react';
import { NodeProps } from '@xyflow/react';
import {
  RegularWorkflowNodeType,
  WorkflowNode,
} from '../../../../types/Workflow.types';
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
import MappingEditor from '../components/mappingEditor';
import useWorkflowState from '../../../../hooks/useWorkflowState';
import { extractVariables } from '../../utils/extractVariables';
import { getCandidateSources } from '../../utils/getCandidateSources';

const SequentialNode: React.FC<NodeProps<RegularWorkflowNodeType>> = (
  props
) => {
  const { data, id } = props;
  const { nodes, edges, config, onNodeChange, onConfigChange } =
    useWorkflowState();

  const candidateSources = useMemo(() => {
    return getCandidateSources(nodes as WorkflowNode[], edges, config, id);
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
          defaultValue={data.name}
          onChange={(e) => onNodeChange(id, { ...data, name: e.target.value })}
        />

        {/* System Prompt */}
        <InputPrompt
          label="System Prompt"
          prompt={data.systemPrompt}
          setPrompt={(prompt) =>
            onNodeChange(id, { ...data, systemPrompt: prompt })
          }
        />

        {/* User Prompt */}
        <InputPrompt
          label="User Prompt"
          prompt={data.userPrompt}
          setPrompt={(prompt) => {
            onNodeChange(id, {
              ...data,
              userPrompt: prompt,
              variables: extractVariables(prompt),
            });
            onConfigChange({
              ...config,
              variables: {
                ...config.variables,
                ...extractVariables(prompt),
              },
            });
          }}
        />

        {/* Display Variables */}
        <Text size="2">Variables in Prompt:</Text>
        <Flex direction="column" gap="1" style={{ marginBottom: '8px' }}>
          <Text size="2" color="gray">
            Required: {data.variables?.required?.join(', ') || 'None'}
          </Text>
          <Text size="2" color="gray">
            Optional: {data.variables?.optional?.join(', ') || 'None'}
          </Text>
        </Flex>

        {/* LLM Parameter Sliders */}
        <InputSlider
          label="Temperature"
          defaultValue={[data?.llmParams?.temperature ?? 0.2]}
          step={0.1}
          min={0}
          max={1}
          onValueChange={([val]) => {
            onNodeChange(id, {
              ...data,
              llmParams: {
                ...data.llmParams,
                temperature: val,
              },
            });
          }}
        />
        <InputSlider
          label="Frequency Penalty"
          defaultValue={[data?.llmParams?.frequencyPenalty ?? 0]}
          step={1}
          min={0}
          max={2}
          onValueChange={([val]) =>
            onNodeChange(id, {
              ...data,
              llmParams: {
                ...data.llmParams,
                frequencyPenalty: val,
              },
            })
          }
        />
        <InputSlider
          label="Frequency Penalty"
          defaultValue={[data?.llmParams?.presencePenalty ?? 0]}
          step={1}
          min={0}
          max={2}
          onValueChange={([val]) =>
            onNodeChange(id, {
              ...data,
              llmParams: {
                ...data.llmParams,
                presencePenalty: val,
              },
            })
          }
        />

        {/* Stream Toggle */}
        <Text size="2">Stream:</Text>
        <Flex align="center">
          <Switch
            className="nodrag"
            checked={data.stream}
            onCheckedChange={(checked) =>
              onNodeChange(id, { ...data, stream: checked })
            }
          />
        </Flex>

        <Text size="2">Expect JSON:</Text>
        <Flex align="center">
          <Switch
            className="nodrag"
            checked={data.expectJson}
            onCheckedChange={(checked) =>
              onNodeChange(id, { ...data, expectJson: checked })
            }
          />
        </Flex>
        {data.expectJson && (
          <>
            <Text size="2">Zod Schema:</Text>
            <TextArea
              className="nodrag"
              placeholder="Zod Schema"
              value={data.zodSchema as string}
              onChange={(e) =>
                onNodeChange(id, { ...data, zodSchema: e.target.value })
              }
            />
          </>
        )}

        <MappingEditor
          label="Input Mapping"
          mapping={data.inputMapping}
          setMapping={(mapping) =>
            onNodeChange(id, { ...data, inputMapping: mapping })
          }
          variablePlaceholder="Enter prompt var to fill"
          sourcePlaceholder="Source (e.g. initialInputs.about)"
          readOnlyKeys={false}
        />

        {/* Output Mapping (reuse MappingEditor) */}
        <MappingEditor
          label="Output Mapping"
          mapping={data?.outputMapping ?? {}}
          setMapping={(mapping) =>
            onNodeChange(id, { ...data, outputMapping: mapping })
          }
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
            typeof data.stepOutput === 'string'
              ? data.stepOutput
              : JSON.stringify(data.stepOutput, null, 2)
          }
          onChange={(e) =>
            onNodeChange(id, { ...data, stepOutput: e.target.value })
          }
        />
      </Grid>
    </CustomNode>
  );
};

export default SequentialNode;
