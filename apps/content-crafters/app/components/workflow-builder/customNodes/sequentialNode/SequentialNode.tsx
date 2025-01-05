import React from 'react';
import { NodeProps } from '@xyflow/react';
import { RegularWorkflowNodeType } from '../../../../types/Workflow.types';
import CustomNode from '../customNode/CustomNode';
import {
  Box,
  Grid,
  Text,
  TextArea,
} from '@radix-ui/themes';
import InputPrompt from '../components/inputPrompt/InputPrompt';
import InputSlider from '../components/inputSlider';
import MappingEditor from '../components/mappingEditor';
import useWorkflowState from '../../../../hooks/useWorkflowState';
import { extractVariables } from '../../utils/extractVariables';
import PromptVariables from '../components/promptVariables/PromptVariables';
import StepName from '../components/stepName/StepName';
import InputSwitch from '../components/inputSwitch/inputSwitch';
import Output from '../components/output/Output';

const SequentialNode: React.FC<NodeProps<RegularWorkflowNodeType>> = (
  props
) => {
  const { data, id } = props;
  const { config, onNodeChange, onConfigChange } =
    useWorkflowState();


  return (
    <CustomNode
      data={{
        label: 'Sequential Step',
        description: 'Executes a step sequentially in the workflow',
      }}
    >
      <Grid gap="4" align="start">
        {/* Name */}
        <StepName data={data} />
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

        <PromptVariables data={data} />

        {/* Input Mapping */}
        <MappingEditor
          label="Input Mapping"
          mapping={data.inputMapping}
          setMapping={(mapping) =>
            onNodeChange(id, { ...data, inputMapping: mapping })
          }
        />

        {/* LLM Parameter Sliders */}
        <InputSlider
          label="Temperature"
          defaultValue={[data?.llmParams?.temperature ?? 0.2]}
          step={0.1}
          min={0}
          max={1}
          onValueChange={([val]) =>
            onNodeChange(id, {
              ...data,
              llmParams: {
                ...data.llmParams,
                temperature: val,
              },
            })
          }
        />

        <InputSwitch
          label="Stream"
          data={data}
          checked={data.stream}
          targetKey="stream"
        />

        <InputSwitch
          label="Expect JSON"
          data={data}
          checked={Boolean(data.expectJson)}
          targetKey="expectJson"
        />

        {data.expectJson && (
          <Box px={'4'}>
            <Text size="2">Zod Schema:</Text>
            <TextArea
              className="nodrag"
              placeholder="Zod Schema"
              value={data.zodSchema as string}
              onChange={(e) =>
                onNodeChange(id, { ...data, zodSchema: e.target.value })
              }
            />
          </Box>
        )}

        <Output data={data} />

      </Grid>
    </CustomNode>
  );
};

export default SequentialNode;
