import React, { useState, useEffect, useCallback, Fragment } from 'react';
import {
  Text,
  Select,
  Flex,
  Button,
  TextField,
  Grid,
  Switch,
  Heading,
} from '@radix-ui/themes';
import { WorkflowInput } from '../../../../../types/Workflow.types';

interface InputsEditorProps {
  inputs?: Record<string, WorkflowInput>;
  onChange: (updatedInputs: Record<string, WorkflowInput>) => void;
}

const InputsEditor: React.FC<InputsEditorProps> = ({ inputs, onChange }) => {
  const [currentInputs, setCurrentInputs] =
    useState<Record<string, WorkflowInput>>(inputs || {});
  const [newInputName, setNewInputName] = useState('');

  useEffect(() => {
    setCurrentInputs(inputs || {});
  }, [inputs]);

  const handleInputChange = useCallback(
    <K extends keyof WorkflowInput>(
      inputName: string,
      field: K,
      value: WorkflowInput[K]
    ) => {
      setCurrentInputs((prevInputs) => ({
        ...prevInputs,
        [inputName]: { ...prevInputs[inputName], [field]: value },
      }));
    },
    []
  );

  const handleAddInput = (name: string) => {
    if (name === '' || currentInputs[name]) return; // Prevent adding empty or duplicate names
    setCurrentInputs((prevInputs) => ({
      ...prevInputs,
      [name]: {
        type: 'string',
        description: '',
        defaultValue: '',
        required: false,
      },
    }));
    setNewInputName(''); // Clear input field after adding
  };

  const handleDeleteInput = useCallback((inputName: string) => {
    setCurrentInputs((prevInputs) => {
      const { [inputName]: _, ...rest } = prevInputs;
      return rest;
    });
  }, []);

  useEffect(() => {
    onChange(currentInputs); // Call onChange with updated inputs
  }, [currentInputs, onChange]);

  return (
    <Flex direction="column" gap="2" mt={'4'}>

      <Heading size="2">Initial inputs</Heading>

      {Object.entries(currentInputs).map(([inputName, input]) => (
        <Flex direction="column" gap="2" key={inputName} my={"2"} p={"3"} style={{
          borderRadius: '4px',
          border: "1px solid var(--gray-6)"
        }}>
          <Text size={'2'} className={'nodrag'}>
            {inputName}
          </Text>
          <Grid gap="2" align="center" mb="2">
            <Select.Root
              size="1"
              value={input.type}
              onValueChange={(value) =>
                handleInputChange(
                  inputName,
                  'type',
                  value as WorkflowInput['type']
                )
              }
            >
              <Select.Trigger>
                <Text size="1">{input.type}</Text>
              </Select.Trigger>
            </Select.Root>

            <TextField.Root
              size="1"
              className={'nodrag'}
              placeholder="Description"
              value={input?.description || ''} // Handle undefined description
              onChange={(e) =>
                handleInputChange(inputName, 'description', e.target.value)
              }
            />

            <TextField.Root
              size="1"
              placeholder="Default Value"
              className={'nodrag'}
              value={input?.defaultValue || ''} // Handle undefined description
              onChange={(e) =>
                handleInputChange(inputName, 'defaultValue', e.target.value)
              }
            />

            <Flex gap="2" align="center">
              <Text size="1">Required:</Text>

              <Switch
                checked={input.required}
                onCheckedChange={(checked) =>
                  handleInputChange(inputName, 'required', checked)
                }
              />

              <Button
                type="button"
                color="red"
                size="1"
                onClick={() => handleDeleteInput(inputName)}
              >
                Delete
              </Button>
            </Flex>
          </Grid>
        </Flex>
      ))}

      <Flex gap="2">
        <TextField.Root
          size="1"
          placeholder="Add new input"
          value={newInputName} // Controlled input for new name
          onChange={(e) => setNewInputName(e.target.value)} // Update newInputName state
          onKeyDown={(e) => {
            // Handle Enter key
            if (e.key === 'Enter') {
              handleAddInput(newInputName); // Add input if name is valid
            }
          }}
        />
      </Flex>
    </Flex>
  );
};

export default InputsEditor;
