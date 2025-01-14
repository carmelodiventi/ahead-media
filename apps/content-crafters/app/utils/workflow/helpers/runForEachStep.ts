import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode } from '../../../types/Workflow.types';
import { runWorkflowStep } from './runWorkflowStep'; // Use your existing input resolution logic

export async function runForEachStep(
  llm: ChatOpenAI,
  step: WorkflowNode,
  initialInputs: Record<string, any>,
  stepResults: Record<string, any>
): Promise<any> {
  const { for_each_config } = step.data;

  if (!for_each_config || !for_each_config.source || !for_each_config.field) {
    throw new Error(
      `Missing "forEach" configuration in step "${step.data.name}". Ensure "source" and "field" are defined.`
    );
  }

  const sourceData = stepResults[for_each_config.source];
  if (!sourceData || !Array.isArray(sourceData[for_each_config.field])) {
    throw new Error(
      `Invalid "source" or "field" in step "${step.data.name}". The specified source must be an array.`
    );
  }

  const items = sourceData[for_each_config.field];
  const results: any[] = [];

  for (const item of items) {
    const dynamicInputs = { ...initialInputs };

    /*
     * TODO: Implement input mapping for "forEach" steps
     *  check item and map it to the appropriate key in dynamicInputs
     *  perhaps we can remove the resolveStepInputs function and use the same logic here
     * */

    // Map "item" to its appropriate key in dynamicInputs
    for (const [key, value] of Object.entries(step.data.inputMapping || {})) {
      if (key === for_each_config.field) {
        dynamicInputs[key] = item; // Assign the item to the mapped key
      } else if (value.startsWith('initialInput')) {
        dynamicInputs[key] = initialInputs[value.split('.')[1]]; // Handle other mappings like "initialInput.tone"
      } else if (stepResults[value]) {
        dynamicInputs[key] = stepResults[value]; // Map other dependencies
      }
    }

    // Execute the step
    const result = await runWorkflowStep(llm, step, dynamicInputs);

    if (result === null) {
      console.error(`Failed processing item in "forEach" step:`, item);
      continue;
    }

    results.push(result);
  }

  // Combine results into the step output
  return results;
}
