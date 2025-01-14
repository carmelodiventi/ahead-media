import { WorkflowNode } from '../../../types/Workflow.types';
import { JsonOutputParser } from '@langchain/core/output_parsers';

export async function parseResponse(
  response: string,
  stepConfig: WorkflowNode
): Promise<string | object | null> {
  // Return raw response if JSON is NOT expected
  if (!stepConfig.data.expectJson) {
    return response;
  }

  try {
    // Instantiate JsonOutputParser with an optional schema
    const jsonParser = new JsonOutputParser();

    // Use the parser to validate and return the structured output
    return await jsonParser.parse(response);
  } catch (error) {
    console.error('JSON parsing error:', error);
    console.error('Raw LLM output:', response);

    if (stepConfig.data.expectJson) {
      // Return null if JSON was expected but parsing failed
      return null;
    } else {
      // Return raw response for non-JSON outputs
      return response;
    }
  }
}
