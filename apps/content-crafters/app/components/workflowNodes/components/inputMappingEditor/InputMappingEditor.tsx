import React, { useState, useEffect } from 'react';
import { Text, Select, Flex, Button, TextField, Grid } from '@radix-ui/themes';

interface InputMappingEditorProps {
  inputMapping: Record<string, string>;
  setInputMapping: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  availableInputs: string[];
  nodeId: string;
}

const InputMappingEditor: React.FC<InputMappingEditorProps> = ({
  inputMapping,
  setInputMapping,
  availableInputs,
  nodeId,
}) => {

  const [mappings, setMappings] =
    useState<Record<string, string>>(inputMapping);

  useEffect(() => {
    setInputMapping(mappings);
  }, [mappings, setInputMapping]);

  const handleMappingChange = (target: string, source: string) => {
    setMappings((prevMappings) => ({
      ...prevMappings,
      [target]: source,
    }));
  };

  const handleDeleteMapping = (target: string) => {
    setMappings((prevMappings) => {
      const newMappings = { ...prevMappings };
      delete newMappings[target];
      return newMappings;
    });
  };

  return (
    <>
      <Text size={'2'}>Input Mapping</Text>
      <Grid gap={"2"}>
        {Object.entries(mappings).map(([target, source]) => (
          <Flex key={`${nodeId}-${target}`} gap="2" align="center">
            <TextField.Root type="text" value={target} readOnly />
            <Select.Root
              value={source}
              onValueChange={(value) => handleMappingChange(target, value)}
            >
              <Select.Trigger />
              <Select.Content>
                <Select.Group>
                  <Select.Label>Select Input</Select.Label>
                  {availableInputs.map((input) => (
                    <Select.Item key={input} value={input}>
                      {input}
                    </Select.Item>
                  ))}
                  <Select.Item value="initialInputs">initialInputs</Select.Item>
                </Select.Group>
              </Select.Content>
            </Select.Root>
            <Button
              type="button"
              onClick={() => handleDeleteMapping(target)}
              size="2"
            >
              Delete
            </Button>
          </Flex>
        ))}
        <Flex gap="2">
          <TextField.Root
            type="text"
            placeholder="Add new input"
            onKeyDown={(e) => {
              if (
                e.key === 'Enter' &&
                e.currentTarget.value !== '' &&
                !Object.hasOwn(mappings, e.currentTarget.value)
              ) {
                setMappings((prevMappings) => ({
                  ...prevMappings,
                  [e.currentTarget.value]: '',
                }));
                e.currentTarget.value = '';
              }
            }}
          />
        </Flex>
      </Grid>
    </>
  );
};

export default InputMappingEditor;
