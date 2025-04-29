import React from 'react';
import { NodeProps } from '@xyflow/react';
import { RegularWorkflowNodeType } from '../../../../types/Workflow.types';
import CustomNode from '../customNode/CustomNode';
import { Box, Grid, Text } from '@radix-ui/themes';
import InputPrompt from '../components/inputPrompt/InputPrompt';
import InputSlider from '../components/inputSlider';
import MappingEditor from '../components/mappingEditor';
import useWorkflowState from '../../../../hooks/useWorkflowState';
import { extractVariables } from '../../utils/extractVariables';
import PromptVariables from '../components/promptVariables/PromptVariables';
import StepName from '../components/stepName/StepName';
import InputSwitch from '../components/inputSwitch/inputSwitch';
import Output from '../components/output/Output';
import SchemaBuilder from '../components/schemaBuilder';
import StepType from "../components/stepType";

const SequentialNode: React.FC<NodeProps<RegularWorkflowNodeType>> = (
  props
) => {
  const { data, id } = props;
  const { onNodeChange } = useWorkflowState();

  return (
    <CustomNode
      data={{
        label: 'Langflow Step',
        description: 'Executes a step in the flow',
      }}
    >
      <Grid gap="4" align="start">
        <StepType data={data} />

        <StepName data={data} />

        <InputPrompt
          label="System Prompt"
          prompt={data.systemPrompt}
          setPrompt={(prompt) =>
            onNodeChange(id, { ...data, systemPrompt: prompt })
          }
        />

        <InputPrompt
          label="User Prompt"
          prompt={data.userPrompt}
          setPrompt={(prompt) => {
            onNodeChange(id, {
              ...data,
              userPrompt: prompt,
              variables: extractVariables(prompt),
            });
          }}
        />

        <PromptVariables data={data} />

        <MappingEditor
          label="Input Mapping"
          mapping={data.inputMapping}
          setMapping={(mapping) =>
            onNodeChange(id, { ...data, inputMapping: mapping })
          }
        />

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

        <InputSlider
          label="Frequency Penalty"
          defaultValue={[data?.llmParams?.frequencyPenalty ?? 0.2]}
          step={0.1}
          min={0}
          max={1}
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
          label="Presence Penalty"
          defaultValue={[data?.llmParams?.presencePenalty ?? 0.2]}
          step={0.1}
          min={0}
          max={1}
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
            <Text size="2">Schema:</Text>
            <SchemaBuilder
              value={data.zodSchema}
              onChange={(schema) => {
                onNodeChange(id, {
                  ...data,
                  zodSchema: schema,
                });
              }}
            />
          </Box>
        )}

        <Output data={data} />
      </Grid>
    </CustomNode>
  );
};

export default SequentialNode;
