import { z } from 'zod';

interface SchemaField {
  key: string;
  type: string; // "string", "number", "array", "object", etc.
  children?: SchemaField[]; // For nested schemas
}

/**
 * Recursively generates a Zod schema from the schema builder structure.
 * @param fields - Array of schema fields
 * @returns A Zod schema object
 */
export const generateZodSchema = (fields: SchemaField[]): z.ZodTypeAny => {
  const schemaObject: Record<string, z.ZodTypeAny> = {};

  fields.forEach((field) => {
    switch (field.type) {
      case 'string':
        schemaObject[field.key] = z.string();
        break;
      case 'number':
        schemaObject[field.key] = z.number();
        break;
      case 'boolean':
        schemaObject[field.key] = z.boolean();
        break;
      case 'array':
        // Arrays must handle a single child schema or default to `z.any()`
        schemaObject[field.key] = z.array(
          field.children && field.children.length > 0
            ? generateZodSchema(field.children) // Generate schema for children
            : z.any() // Default to `any` if no children are specified
        );
        break;
      case 'object':
        schemaObject[field.key] = z.object(
          field.children ? generateZodSchema(field.children) : {}
        );
        break;
      default:
        // Fallback for unsupported types
        schemaObject[field.key] = z.any();
    }
  });

  return z.object(schemaObject);
};
