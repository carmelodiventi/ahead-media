import React, { useCallback } from 'react';
import {
  Box,
  Button,
  Card,
  Dialog,
  Flex,
  Grid,
  IconButton,
  ScrollArea,
  Select,
  Switch,
  Text,
  TextField,
  Tooltip,
} from '@radix-ui/themes';
import { PlusIcon, TrashIcon } from '@radix-ui/react-icons';
import Ajv from 'ajv';
import { jsonSchemaToZod } from 'json-schema-to-zod';

import { Schema } from '../../../../../../types/Workflow.types';

const SCHEMA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];
const ajv = new Ajv();

const SchemaBuilderModal: React.FC<{
  setShowBuilderModal: (show: boolean) => void;
  showBuilderModal: boolean;
  schema?: Schema;
  onChange: (schema: Schema) => void;
}> = ({ setShowBuilderModal, showBuilderModal, schema, onChange }) => {

  if (!schema) {
    schema = { type: 'object', properties: {} };
  }

  const handleChange = useCallback(
    (updatedSchema: Schema) => {
      onChange(updatedSchema);
    },
    [onChange]
  );

  const handleAddProperty = useCallback(
    (path: string[]) => {
      const updatedSchema = { ...schema };

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
    [schema, handleChange]
  );

  const handleFieldKeyChange = useCallback(
    (path: string[], oldKey: string, newKey: string) => {
      const updatedSchema = { ...schema };
      const currentField = path.reduce(
        (acc: any, cur: string) => acc.properties[cur],
        updatedSchema
      );

      if (currentField.properties[oldKey]) {
        const fieldValue = currentField.properties[oldKey];
        delete currentField.properties[oldKey];
        currentField.properties[newKey] = fieldValue;
      }

      handleChange(updatedSchema);
    },
    [schema, handleChange]
  );

  const handleFieldTypeChange = useCallback(
    (path: string[], key: string, newType: string) => {
      const updatedSchema = { ...schema };
      const currentField = path.reduce(
        (acc: any, cur: string) => acc.properties[cur],
        updatedSchema
      );

      currentField.properties[key] = {
        type: newType,
        ...(newType === 'object' && { properties: {}, required: [] }),
        ...(newType === 'array' && { items: { type: 'string' } }),
      };

      handleChange(updatedSchema);
    },
    [schema, handleChange]
  );

  const handleRemoveField = useCallback(
    (path: string[], key: string) => {
      const updatedSchema = { ...schema };
      const parent = path.reduce(
        (acc: any, cur: string) => acc.properties[cur],
        updatedSchema
      );

      if (parent.properties && parent.properties[key]) {
        delete parent.properties[key];
      }

      handleChange(updatedSchema);
    },
    [schema, handleChange]
  );

  const handleRequiredChange = useCallback(
    (path: string[], key: string, required: boolean) => {
      const updatedSchema = { ...schema };
      const currentField = path.reduce(
        (acc: any, cur: string) => acc.properties[cur],
        updatedSchema
      );

      if (required) {
        currentField.required = [...(currentField.required || []), key];
      } else {
        currentField.required = (currentField.required || []).filter(
          (reqKey: string) => reqKey !== key
        );
      }

      handleChange(updatedSchema);
    },
    [schema, handleChange]
  );

  const renderFields = (node: Schema, path: string[] = []) => {
    if (!node.properties) return null;

    return Object.entries(node.properties).map(([key, field], index) => {
      const isRequired = node.required?.includes(key) || false;

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

            <Switch
              color="gray"
              highContrast
              checked={isRequired}
              onCheckedChange={(checked) =>
                handleRequiredChange(path, key, checked)
              }
            />

            {field.type === 'array' && (
              <Box>
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
              </Box>
            )}

            {field.type === 'array' && field.items?.type === 'object' && (
              <Grid gap={'2'}>renderFields(field.items, [...path, key])</Grid>
            )}

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
        </Card>
      );
    });
  };

  return (
    <Dialog.Root open={showBuilderModal} onOpenChange={setShowBuilderModal}>
      <Dialog.Content>
        <Dialog.Title>Edit Schema</Dialog.Title>
        <Dialog.Description size="2" mb="4">
          Create your schema. Schemas can help define the output of prompt.
        </Dialog.Description>
        <Grid gap={'4'}>
          <Button onClick={() => handleFieldTypeChange([], 'newKey', 'object')}>
            Add Top-Level Property
          </Button>
          <Box>{renderFields(schema)}</Box>
          <Card>
            <ScrollArea
              type="always"
              scrollbars="vertical"
              style={{ height: 250 }}
            >
              <pre>{JSON.stringify(schema, null, 2)}</pre>
            </ScrollArea>
          </Card>
          {jsonSchemaToZod(schema)}
          <Text color={ajv.validateSchema(schema) ? 'green' : 'red'}>
            {ajv.validateSchema(schema) ? 'Valid schema' : 'Invalid schema'}
          </Text>
        </Grid>
      </Dialog.Content>
    </Dialog.Root>
  );
};

export default SchemaBuilderModal;
