import React from 'react';
import { Box, Grid, Select, Text, TextField } from '@radix-ui/themes';
import {
  ForEachWorkflowStep,
  RegularWorkflowStep,
  StepType as StepNodeType,
} from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';
import CustomHandle from '../../../customHandle';
import { Position } from '@xyflow/system';

const StepType: React.FC<{
  data: RegularWorkflowStep | ForEachWorkflowStep;
}> = ({ data }) => {
  const { onNodeChange } = useWorkflowState();

  return (
    <>
      <Grid px={'4'} gap={'2'}>
        <Text size="2">Type</Text>
        <Select.Root
          defaultValue={data.type}
          onValueChange={(value: StepNodeType) => {
            onNodeChange(data.id as string, {
              ...data,
              type: value,
              ...(value === StepNodeType.ForEach
                ? {
                    for_each_config: {
                      source: '',
                      field: '',
                      item_input_parameter_name: '',
                    },
                  }
                : {}),
            });
          }}
        >
          <Select.Trigger />
          <Select.Content>
            <Select.Group>
              <Select.Label>Step Type</Select.Label>
              <Select.Item value={StepNodeType.Sequential}>
                sequential
              </Select.Item>
              <Select.Item value={StepNodeType.ForEach}>forEach</Select.Item>
            </Select.Group>
          </Select.Content>
        </Select.Root>
      </Grid>
      {data.type === StepNodeType.ForEach && (
        <Box position={'relative'}>
          <CustomHandle
            id={`${data.name}-for_each_config-source`}
            type={'target'}
            position={Position.Left}
            connectionCount={1}
            onConnect={(params) => {
              console.log(params);
            }}
          />
          <Grid px={'4'} gap={'2'}>
            <Text size="2">Source</Text>
            <TextField.Root
              type="text"
              placeholder="Source"
              className="nodrag"
              defaultValue={
                (data as ForEachWorkflowStep)?.for_each_config?.source
              }
              onChange={(e) =>
                onNodeChange(data.id as string, {
                  ...data,
                  for_each_config: {
                    ...(data as ForEachWorkflowStep)?.for_each_config,
                    source: e.target.value,
                  },
                })
              }
            />
            <Text size="2">Field</Text>
            <TextField.Root
              type="text"
              placeholder="Field"
              className="nodrag"
              defaultValue={
                (data as ForEachWorkflowStep)?.for_each_config?.field
              }
              onChange={(e) =>
                onNodeChange(data.id as string, {
                  ...data,
                  for_each_config: {
                    ...(data as ForEachWorkflowStep)?.for_each_config,
                    field: e.target.value,
                  },
                })
              }
            />
            <Text size="2">Parameter Name</Text>
            <TextField.Root
              type="text"
              placeholder="Parameter Name"
              className="nodrag"
              defaultValue={
                (data as ForEachWorkflowStep)?.for_each_config
                  ?.item_input_parameter_name
              }
              onChange={(e) =>
                onNodeChange(data.id as string, {
                  ...data,
                  for_each_config: {
                    ...(data as ForEachWorkflowStep)?.for_each_config,
                    item_input_parameter_name: e.target.value,
                  },
                })
              }
            />
          </Grid>
        </Box>
      )}
    </>
  );
};

export default StepType;
