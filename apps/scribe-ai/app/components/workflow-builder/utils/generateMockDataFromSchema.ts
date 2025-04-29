import { z } from "zod";

/**
 * Recursively generates mock data based on a Zod schema
 * @param schema - Zod schema object
 * @returns Example/mock data
 */
export const generateMockDataFromSchema = (schema: z.ZodTypeAny): any => {
  if (schema instanceof z.ZodObject) {
    // Handle objects
    const shape = schema.shape;
    const mockData: Record<string, any> = {};
    for (const key in shape) {
      mockData[key] = generateMockDataFromSchema(shape[key]);
    }
    return mockData;
  } else if (schema instanceof z.ZodArray) {
    // Handle arrays
    const itemSchema = schema._def.type; // Access the array item schema
    if (itemSchema instanceof z.ZodObject || itemSchema instanceof z.ZodArray) {
      // For nested objects/arrays, recurse
      return [generateMockDataFromSchema(itemSchema)];
    } else {
      // For primitives, provide a single example
      return [generateMockDataFromSchema(itemSchema)];
    }
  } else if (schema instanceof z.ZodString) {
    // Handle strings
    return "sample string";
  } else if (schema instanceof z.ZodNumber) {
    // Handle numbers
    return 123;
  } else if (schema instanceof z.ZodBoolean) {
    // Handle booleans
    return true;
  } else if (schema instanceof z.ZodNull) {
    // Handle null
    return null;
  } else {
    // Fallback for unsupported types
    return null;
  }
};
