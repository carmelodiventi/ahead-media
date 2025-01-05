import {
  Box,
  Button,
  DropdownMenu,
  Flex,
  Grid,
  Strong,
  Text,
  TextField,
} from '@radix-ui/themes';
import {
  RegularWorkflowStep,
  WorkflowNode,
} from '../../../../../types/Workflow.types';
import useWorkflowState from '../../../../../hooks/useWorkflowState';
import React, { Fragment } from 'react';
import CustomHandle from '../../../customHandle';
import { Position } from '@xyflow/system';
import { OnConnect } from '@xyflow/react';
import { InputIcon } from '@radix-ui/react-icons';

const PromptVariables: React.FC<{
  data: RegularWorkflowStep & Record<string, unknown>;
}> = ({ data }) => {
  const { onNodeChange, nodes } = useWorkflowState();

  const onConnect: OnConnect = (params) => {
    const targetNode = nodes.find((node) => node.id === params.target)?.data;
    const sourceNode = nodes.find((node) => node.id === params.source)?.data;

    if (!targetNode || !sourceNode) return;

    // @ts-ignore
    const { inputMapping }: { inputMapping: Record<string, string> } =
      sourceNode.data as WorkflowNode['data'];

    onNodeChange(params.target, {
      ...(sourceNode.data as WorkflowNode['data']),
      inputMapping: {
        ...inputMapping,
        [params.targetHandle as string]: `${data.id}`,
      },
    });
  };

  if (!data?.variables) {
    return null;
  }

  return (
    <Flex direction="column" gap="2">
      <Box px={'4'}>
        <Text size="2">Variables in Prompt</Text>
      </Box>
      {data?.inputMapping && (
        <>
          {data?.variables?.required
            ?.concat(data?.variables?.optional ?? [])
            .map((variable) => (
              <Fragment key={variable}>
                <Grid
                  align="center"
                  gap="2"
                  my={'2'}
                  position={'relative'}
                  px={'4'}
                >
                  <Strong>{variable}</Strong>



                  <DropdownMenu.Root modal={true}>
                    <DropdownMenu.Trigger>
                      <TextField.Root
                        placeholder={'Type something...'}
                        className={'nodrag noflow'}
                        defaultValue={
                          data.inputMapping[variable]
                            ? data.inputMapping[variable].startsWith('initialInput')
                              ? `Initial Input: ${variable}`
                              : `Receiving Input`
                            : 'Select Source'
                        }
                        readOnly={Boolean(data.inputMapping[variable])}
                      >
                        <TextField.Slot side={'right'}>
                          <InputIcon />
                        </TextField.Slot>
                      </TextField.Root>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        onClick={() =>
                          onNodeChange(data.id as string, {
                            ...data,
                            inputMapping: {
                              ...data.inputMapping,
                              [variable]: `initialInput.${variable}`,
                            },
                          })
                        }
                      >
                        Initial Input
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {!data.inputMapping[variable]?.includes('initialInput') ? (
                    <CustomHandle
                      position={Position.Left}
                      type="target"
                      id={variable}
                      onConnect={onConnect}
                      connectionCount={1}
                    />
                  ) : null}
                </Grid>
              </Fragment>
            ))}
        </>
      )}
    </Flex>
  );
};

export default PromptVariables;
