import React, { useState } from 'react';
import {
  Button,
  Card,
  Grid,
  Heading,
  Select,
  TextField,
} from '@radix-ui/themes';
import { SchemaField } from '../../../../../types/Workflow.types';
import { generateZodSchema } from '../../../utils/generateZodSchema';

const SCHEMA_TYPES = ['string', 'number', 'boolean', 'array', 'object'];

interface SchemaBuilderProps {
  value: SchemaField[];
  onChange: (schema: SchemaField[]) => void;
  showValidation?: boolean;
}

const SchemaBuilder: React.FC<SchemaBuilderProps> = ({ value, onChange }) => {
  const [schema, setSchema] = useState<SchemaField[]>(value || []);

  console.log(schema, generateZodSchema(schema));

  const handleAddField = () => {
    setSchema([...schema, { key: '', type: 'string' }]);
  };

  const handleFieldChange = (index: number, field: Partial<SchemaField>) => {
    const newSchema = [...schema];
    newSchema[index] = { ...newSchema[index], ...field };
    setSchema(newSchema);
    onChange(newSchema); // Notify parent
  };

  const handleRemoveField = (index: number) => {
    const newSchema = schema.filter((_, i) => i !== index);
    setSchema(newSchema);
    onChange(newSchema); // Notify parent
  };

  return (
    <Card my="2">
      <Heading size="3" weight="bold" mb="2">
        Schema Builder
      </Heading>
      <Grid gap="2">
        {schema.map((field, index) => (
          <Card key={index}>
            <Grid gap="1">
              <TextField.Root
                placeholder="Key"
                value={field.key}
                onChange={(e) =>
                  handleFieldChange(index, { key: e.target.value })
                }
              />
              <Select.Root
                value={field.type}
                onValueChange={(type) =>
                  handleFieldChange(index, {
                    type,
                    children:
                      type === 'object' || type === 'array' ? [] : undefined,
                  })
                }
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

              {field.type === 'array' ? (
                <>
                  <Select.Root
                    value={field.children?.[0]?.type || 'string'}
                    onValueChange={(itemType) => {
                      if (['string', 'number', 'boolean'].includes(itemType)) {
                        // Primitive arrays: single type with no nested children
                        handleFieldChange(index, {
                          children: [{ key: 'item', type: itemType }],
                        });
                      } else if (itemType === 'object') {
                        // Nested object arrays
                        handleFieldChange(index, {
                          children: [
                            {
                              key: '',
                              type: 'object',
                              children: [],
                            },
                          ],
                        });
                      }
                    }}
                  >
                    <Select.Trigger>
                      {field.children?.[0]?.type || 'string'}
                    </Select.Trigger>
                    <Select.Content>
                      {SCHEMA_TYPES.filter((type) => type !== 'array').map(
                        (type) => (
                          <Select.Item key={type} value={type}>
                            {type}
                          </Select.Item>
                        )
                      )}
                    </Select.Content>
                  </Select.Root>

                  {/* If the array contains nested objects, render SchemaBuilder for them */}
                  {field.children && field.children[0]?.type === 'object' && (
                    <SchemaBuilder
                      value={field.children[0].children || []}
                      onChange={(nestedSchema) => {
                        handleFieldChange(index, {
                          children: [
                            {
                              ...field.children![0],
                              children: nestedSchema,
                            },
                          ],
                        });
                      }}
                    />
                  )}
                </>
              ) : field.type === 'object' ? (
                // Render SchemaBuilder for nested objects
                <SchemaBuilder
                  value={field.children || []}
                  onChange={(nestedSchema) =>
                    handleFieldChange(index, { children: nestedSchema })
                  }
                />
              ) : null}

              <Button
                variant="ghost"
                color="red"
                onClick={() => handleRemoveField(index)}
              >
                Remove
              </Button>
            </Grid>
          </Card>
        ))}
      </Grid>

      <Grid gap="2">
        <Button variant="ghost" onClick={handleAddField} mt="2">
          Add Field
        </Button>
      </Grid>
    </Card>
  );
};

export default SchemaBuilder;
