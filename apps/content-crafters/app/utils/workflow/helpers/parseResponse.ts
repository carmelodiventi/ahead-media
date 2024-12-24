import { RegularWorkflowStep } from '../../../types/Workflow.types';

export function parseResponse(
  response: string,
  stepConfig: RegularWorkflowStep
): string | object | null {
  // Explicitly define return types

  if (!stepConfig.expectJson && !stepConfig.zodSchema) {
    return response; // Return raw response if JSON is NOT expected and there's no schema
  }

  try {
    const extractedJson = response
      .trim()
      .replace(/^```json\n/, '')
      .replace(/\n```$/, '');

    // Check if extracting JSON resulted in an empty string (meaning there was no JSON) AND JSON was expected
    if (extractedJson === '' && stepConfig.expectJson === true) {
      throw new Error('Expected JSON but found none.');
    } else if (extractedJson === '') {
      return response;
    }

    const parsedJson = JSON.parse(extractedJson); // Parse the extracted JSON
    return stepConfig.zodSchema
      ? stepConfig.zodSchema.parse(parsedJson)
      : parsedJson; // Validate with Zod if schema exists
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw LLM output:', response);

    if (stepConfig.expectJson === true) {
      return null; // Return null to signal parsing failure if JSON was expected
    } else {
      return response; // Return raw response since JSON parsing failed and it was not explicitly expected
    }
  }
}
