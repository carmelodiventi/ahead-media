import './index.css';
import React from 'react';
import { Toolbar, ToggleGroup, ToggleItem } from '@radix-ui/react-toolbar';
import {
  Box,
  Button,
  Dialog,
  Grid,
  Heading,
  Separator,
  TextField,
  Text,
} from '@radix-ui/themes';
import { ToolbarOptionsProps } from './Toolbar.types';
import useWorkflowState from '../../../hooks/useWorkflowState';
import { useFetcher } from '@remix-run/react';
import { WorkflowTemplate } from '../../../types/Workflow.types';
import { action } from '../../../routes/_admin.admin.workflows_.$id';

const ToolbarOptions: React.FC<ToolbarOptionsProps> = ({
  workflow,
  addNode,
  onSave,
  isSaving,
}) => {
  const fetcher = useFetcher<typeof action>();
  const { config, onConfigChange } = useWorkflowState();

  const handleEditTemplate = (updatedData: Partial<WorkflowTemplate>) => {
    const formData = new FormData();
    formData.append(
      'workflow',
      JSON.stringify({ ...workflow, ...updatedData })
    );
    fetcher.submit(formData, {
      method: 'post',
      action: `/admin/workflows/${workflow.id}`,
    });
  };

  const handleEditConfig = (
    key: string,
    {
      label,
      placeholder,
      defaultValue,
      required,
    }: {
      label: string;
      placeholder?: string;
      defaultValue: string;
      required: boolean;
    }
  ) => {
    const inputs = config.inputs ?? {};

    inputs[key] = {
      label,
      defaultValue,
      placeholder,
      required,
    };

    onConfigChange({
      ...config,
      inputs,
    });
  };

  return (
    <>
      <Toolbar className="ToolbarRoot nodrag">
        <Heading as={'h3'} size={'3'}>
          {workflow.name}
        </Heading>

        <ToggleGroup type="multiple">
          <ToggleItem
            className="ToolbarToggleItem"
            value="addSequentialNode"
            aria-label="addSequentialNode"
            onClick={addNode}
          >
            Add Sequential Step
          </ToggleItem>
          <Separator className="ToolbarSeparator" orientation={'vertical'} />
          <Button
            variant="ghost"
            loading={
              isSaving ||
              fetcher.state === 'loading' ||
              fetcher.state === 'submitting'
            }
            value="save"
            aria-label="save"
            onClick={onSave}
          >
            Save
          </Button>
          <Separator className="ToolbarSeparator" orientation={'vertical'} />
          <Dialog.Root>
            <Dialog.Trigger>
              <Button
                variant="ghost"
                value="editConfig"
                aria-label="editConfig"
              >
                Edit Config
              </Button>
            </Dialog.Trigger>
            <Dialog.Content>
              <Dialog.Title>Edit Config</Dialog.Title>
              <Dialog.Description size="2" mb="4">
                Edit the workflow configuration.
              </Dialog.Description>

              <Grid gap={'4'}>
                <TextField.Root
                  defaultValue={workflow.name}
                  onChange={(e) => handleEditTemplate({ name: e.target.value })}
                >
                  <TextField.Slot>Name</TextField.Slot>
                </TextField.Root>
                <TextField.Root
                  defaultValue={workflow.description}
                  onChange={(e) =>
                    handleEditTemplate({ description: e.target.value })
                  }
                >
                  <TextField.Slot>Description</TextField.Slot>
                </TextField.Root>
                <TextField.Root
                  defaultValue={workflow.template_prompt}
                  onChange={(e) =>
                    handleEditTemplate({ template_prompt: e.target.value })
                  }
                >
                  <TextField.Slot>Template Prompt</TextField.Slot>
                </TextField.Root>
              </Grid>

              <Grid gap={'4'} my={'4'}>
                <Heading as={'h4'} size={'4'}>
                  Inputs
                </Heading>
                {Object.keys(config.inputs ?? {})
                  .sort((a, b) => {
                    if (a < b) return -1;
                    if (a > b) return 1;
                    return 0;
                  })
                  .map((input) => {
                    const label = config.inputs[input]?.label ?? '';
                    const defaultValue =
                      config.inputs[input]?.defaultValue ?? '';
                    const placeholder = config.inputs[input]?.placeholder ?? '';
                    const required = config.inputs[input]?.required ?? false;

                    return (
                      <Grid key={input} as="div" gap={'2'}>
                        <Text color={'gray'}>{input}</Text>
                        <TextField.Root
                          defaultValue={label}
                          onChange={(e) =>
                            handleEditConfig(input, {
                              label: e.target.value,
                              defaultValue,
                              placeholder,
                              required,
                            })
                          }
                        >
                          <TextField.Slot>Label</TextField.Slot>
                        </TextField.Root>
                        <TextField.Root
                          defaultValue={defaultValue}
                          onChange={(e) =>
                            handleEditConfig(input, {
                              label,
                              defaultValue: e.target.value,
                              placeholder,
                              required,
                            })
                          }
                        >
                          <TextField.Slot>Default value</TextField.Slot>
                        </TextField.Root>

                        <TextField.Root
                          defaultValue={placeholder}
                          onChange={(e) =>
                            handleEditConfig(input, {
                              label,
                              defaultValue,
                              required,
                              placeholder: e.target.value,
                            })
                          }
                        >
                          <TextField.Slot>Placeholder</TextField.Slot>
                        </TextField.Root>
                      </Grid>
                    );
                  })}
              </Grid>
            </Dialog.Content>
          </Dialog.Root>
        </ToggleGroup>
      </Toolbar>
    </>
  );
};

export default ToolbarOptions;
