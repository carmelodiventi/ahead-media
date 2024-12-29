import React from 'react';
import { Button, Flex, Text, TextField } from '@radix-ui/themes';
import * as Select from '@radix-ui/react-select';

interface MappingEditorProps {
  label: string; // e.g. "Input Mapping" or "Output Mapping"
  mapping: Record<string, string>;
  setMapping: (value: Record<string, string>) => void;
  variablePlaceholder?: string; // placeholder for the key (e.g. "Enter prompt var...")
  sourcePlaceholder?: string; // placeholder for the value (e.g. "Source or alias...")
  readOnlyKeys?: boolean; // whether the keys (object keys) are read-only
  candidateSources?: string[]; // list of possible auto-complete values for the mapping value
}

/**
 * A generic component that renders a list of [key, value] pairs and
 * allows adding/removing/updating them. Also supports auto-complete
 * for the value using Radix UI's Select component.
 */
const MappingEditor: React.FC<MappingEditorProps> = ({
  label,
  mapping,
  setMapping,
  variablePlaceholder = 'Enter key',
  sourcePlaceholder = 'Enter value',
  readOnlyKeys = true,
  candidateSources = [],
}) => {
  // Handler to update a mapping entry
  const handleChange = (key: string, value: string) => {
    setMapping({
      ...mapping,
      [key]: value,
    });
  };

  // Handler to remove a mapping entry
  const handleDelete = (key: string) => {
    const newMapping = { ...mapping };
    delete newMapping[key];
    setMapping(newMapping);
  };

  // Handler to add a new mapping entry
  const handleAddKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && e.currentTarget.value.trim() !== '') {
      const newKey = e.currentTarget.value.trim();
      setMapping({
        ...mapping,
        [newKey]: '',
      });
      e.currentTarget.value = '';
    }
  };

  return (
    <div>
      <Text size="2" style={{ marginBottom: 4 }}>
        {label}
      </Text>

      {/* Render existing entries */}
      {Object.entries(mapping).map(([key, value]) => (
        <Flex key={key} gap="2" align="center" style={{ marginBottom: 4 }}>
          {/* The key field */}
          <TextField.Root
            className="nodrag"
            type="text"
            value={key}
            readOnly={readOnlyKeys}
            style={{ width: '130px' }}
          />

          {/* The value field: Using a Select for candidateSources */}
          <Select.Root
            value={value ?? ''}
            onValueChange={(val) => handleChange(key, val)}
          >
            <Select.Trigger className="nodrag" style={{ minWidth: 140 }}>
              <Select.Value placeholder={sourcePlaceholder} />
            </Select.Trigger>
            <Select.Content>
              <Select.Viewport>
                {candidateSources.map((sourceItem) => (
                  <Select.Item key={sourceItem} value={sourceItem}>
                    <Select.ItemText>{sourceItem}</Select.ItemText>
                  </Select.Item>
                ))}
              </Select.Viewport>
            </Select.Content>
          </Select.Root>

          <Button type="button" onClick={() => handleDelete(key)} size="2">
            Delete
          </Button>
        </Flex>
      ))}

      {/* Input for adding new key */}
      <Flex gap="2">
        <TextField.Root
          className="nodrag"
          type="text"
          placeholder={variablePlaceholder}
          onKeyDown={handleAddKey}
        />
      </Flex>
    </div>
  );
};

export default MappingEditor;
