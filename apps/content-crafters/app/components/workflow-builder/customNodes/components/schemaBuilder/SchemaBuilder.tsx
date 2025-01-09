import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Flex,
  Grid,
  IconButton,
  Select,
  TextField,
  Text,
} from '@radix-ui/themes';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import Ajv from 'ajv';
const ajv = new Ajv();
const SCHEMA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

interface SchemaBuilderProps {
  value: Record<string, any>;
  onChange: (value: Record<string, any>) => void;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ value, onChange }) => {
  const handleChange = useCallback(
    (updatedSchema) => {
      onChange(updatedSchema);
    },
    [onChange]
  );

  const handleAddProperty = useCallback(
    (path) => {
      const updatedSchema = { ...value };

      // Traverse the path and initialize any missing objects
      let current = updatedSchema;
      for (const segment of path) {
        if (!current.properties) {
          current.properties = {}; // Ensure the current node has properties
        }
        current =
          current.properties[segment] ||
          (current.properties[segment] = { type: 'object', properties: {} });
      }

      if (!current.properties) {
        current.properties = {}; // Initialize properties if not already defined
      }

      // Add a new default property
      current.properties[`newKey${Object.keys(current.properties).length}`] = {
        type: 'string',
      };
      handleChange(updatedSchema); // Notify parent
    },
    [value, handleChange]
  );

  const handleFieldKeyChange = useCallback(
    (path, oldKey, newKey) => {
      const updatedSchema = { ...value };
      const currentField = path.reduce(
        (acc, cur) => acc.properties[cur],
        updatedSchema
      );

      if (currentField.properties[oldKey]) {
        const fieldValue = currentField.properties[oldKey];
        delete currentField.properties[oldKey];
        currentField.properties[newKey] = fieldValue;
      }

      handleChange(updatedSchema);
    },
    [value, handleChange]
  );

  const handleFieldTypeChange = useCallback(
    (path, key, newType) => {
      const updatedSchema = { ...value };
      const currentField = path.reduce(
        (acc, cur) => acc.properties[cur],
        updatedSchema
      );

      currentField.properties[key] = {
        type: newType,
        ...(newType === 'object' && { properties: {}, required: [] }),
        ...(newType === 'array' && { items: { type: 'string' } }),
      };

      handleChange(updatedSchema);
    },
    [value, handleChange]
  );

  const handleRemoveField = useCallback(
    (path, key) => {
      const updatedSchema = { ...value };
      const parent = path.reduce(
        (acc, cur) => acc.properties[cur],
        updatedSchema
      );

      if (parent.properties && parent.properties[key]) {
        delete parent.properties[key];
      }

      handleChange(updatedSchema);
    },
    [value, handleChange]
  );

  const renderFields = (node, path = []) => {
    if (!node.properties) return null;

    return Object.entries(node.properties).map(([key, field], index) => {
      return (
        <Card key={index}>
          <Flex gap={'2'} align={'center'}>
            <TextField.Root
              placeholder="Key"
              value={key}
              onChange={(e) => {
                const newKey = e.target.value;
                handleFieldKeyChange(path, key, newKey); // Update the key without recreating the element
              }}
              onBlur={(e) => {
                const newKey = e.target.value.trim();
                if (newKey !== key) {
                  handleFieldKeyChange(path, key, newKey); // Commit changes on blur
                }
              }}
            />

            {/* Field Type Selector */}
            <Select.Root
              value={field.type}
              onValueChange={(type) => handleFieldTypeChange(path, key, type)}
            >
              <Select.Trigger>{field.type}</Select.Trigger>
              <Select.Content>
                {SCHEMA_TYPES.map((type) => (
                  <Select.Item key={type} value={type}>
                    {type}
                  </Select.Item>
                ))}
              </Select.Content>
            </Select.Root>

            {/* Delete Button */}
            <IconButton
              variant="outline"
              radius="full"
              color="red"
              onClick={() => handleRemoveField(path, key)}
            >
              <TrashIcon />
            </IconButton>

            {field.type === 'object' && (
              <Box>
                <IconButton
                  variant="outline"
                  radius="full"
                  onClick={() => handleAddProperty([...path, key])}
                >
                  <PlusIcon />
                </IconButton>
              </Box>
            )}
          </Flex>

          {field.type === 'object' && (
            <Grid gap={'2'} my={'2'}>
              {renderFields(field, [...path, key])}
            </Grid>
          )}

          {field.type === 'array' && (
            <Box>
              <strong>Items Type:</strong>
              <Select.Root
                value={field.items?.type || 'string'}
                onValueChange={(type) => {
                  handleFieldTypeChange([...path, key], 'items', type);
                }}
              >
                <Select.Trigger placeholder={'Items Type'}>
                  {field.items?.type || 'string'}
                </Select.Trigger>
                <Select.Content>
                  {SCHEMA_TYPES.filter((t) => t !== 'array').map((type) => (
                    <Select.Item key={type} value={type}>
                      {type}
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Root>
              {field.items?.type === 'object' &&
                renderFields(field.items, [...path, key])}
            </Box>
          )}
        </Card>
      );
    });
  };

  return (
    <Grid gap={'2'}>
      <h3>Schema Builder</h3>
      <Button onClick={() => handleFieldTypeChange([], 'newKey', 'object')}>
        Add Top-Level Property
      </Button>
      <div>{renderFields(value)}</div>
      <pre style={{ backgroundColor: '#f4f4f4', padding: '1rem' }}>
        {JSON.stringify(value, null, 2)}
      </pre>
      <Text color={ajv.validateSchema(value) ? 'green': 'red'}>
        {ajv.validateSchema(value) ? 'Valid schema' : 'Invalid schema'}
      </Text>
    </Grid>
  );
};

export default SchemaBuilder;
