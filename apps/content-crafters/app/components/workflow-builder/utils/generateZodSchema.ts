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
export const generateZodSchema = (fields: SchemaField[]): Record<string, any> => {
  const schema: Record<string, any> = {};
  fields.forEach((field) => {
    switch (field.type) {
      case 'string':
        schema[field.key] = z.string();
        break;
      case 'number':
        schema[field.key] = z.number();
        break;
      case 'boolean':
        schema[field.key] = z.boolean();
        break;
      case 'array':
        schema[field.key] = z.array(
          field.children && field.children.length > 0
            ? generateZodSchema(field.children)[field.children[0]?.key] || z.any()
            : z.any()
        );
        break;
      case 'object':
        schema[field.key] = z.object(generateZodSchema(field.children || []));
        break;
      default:
        schema[field.key] = z.any();
    }
  });
  return schema;
};
