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
import { RegularWorkflowStep } from '../../../../../types/Workflow.types';
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
      targetNode;

    onNodeChange(params.target, {
      ...targetNode,
      inputMapping: {
        ...inputMapping,
        [params.targetHandle as string]: `${sourceNode.id}`,
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
                            ? data.inputMapping[variable].startsWith(
                                'initialInput'
                              ) ||
                              data.inputMapping[variable].startsWith(
                                'queryPrompt'
                              )
                              ? data.inputMapping[variable]
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
                    <DropdownMenu.Content
                      style={{
                        width: '100%',
                      }}
                    >
                      <DropdownMenu.Item
                        onClick={() => {
                          delete data.inputMapping[variable];
                          onNodeChange(data.id as string, {
                            ...data,
                            inputMapping: {
                              ...data.inputMapping,
                            },
                          });
                        }}
                      >
                        Select Source
                      </DropdownMenu.Item>
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
                      <DropdownMenu.Item
                        onClick={() =>
                          onNodeChange(data.id as string, {
                            ...data,
                            inputMapping: {
                              ...data.inputMapping,
                              [variable]: `queryPrompt.${variable}`,
                            },
                          })
                        }
                      >
                        Query Prompt
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>

                  {!(
                    data.inputMapping[variable]?.includes('initialInput') ||
                    data.inputMapping[variable]?.includes('queryPrompt')
                  ) ? (
                    <CustomHandle
                      id={variable}
                      position={Position.Left}
                      type="target"
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
