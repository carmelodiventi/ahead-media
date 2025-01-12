import { resolveStepInputs } from './resolveStepInputs';
import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode } from '../../../types/Workflow.types';
import {runWorkflowStep} from "./runWorkflowStep"; // Use your existing input resolution logic

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
    // Dynamically resolve inputs for the current iteration
    const resolvedInputs = resolveStepInputs(
      step.data.inputMapping || {},
      { ...initialInputs, item },
      stepResults,
      step.data.name,
    );

    if (!resolvedInputs) {
      console.error(
        `Failed to resolve inputs for item in "forEach" step:`,
        item
      );
      continue;
    }

    // Execute the step
    const result = await runWorkflowStep(llm, step, resolvedInputs);

    if (result === null) {
      console.error(`Failed processing item in "forEach" step:`, item);
      continue;
    }

    results.push(result);
  }

  // Combine results into the step output
  return results;
}
