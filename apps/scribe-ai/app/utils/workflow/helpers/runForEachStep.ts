import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode } from '../../../types/Workflow.types';
import { runWorkflowStep } from './runWorkflowStep';
import { mapDynamicInputs } from './mapDynamicInputs';

export async function runForEachStep(
  llm: ChatOpenAI,
  step: WorkflowNode,
  initialInputs: Record<string, any>,
  stepResults: Record<string, any>,
  isOutputNode: boolean,
  onStepUpdate: ({ status, data }: { status: string; data: Record<string, any> }) => void,
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
    const dynamicInputs = mapDynamicInputs(
      item,
      step.data.inputMapping || {},
      initialInputs,
      stepResults
    );

    if (!dynamicInputs) {
      console.error(
        `Failed to map dynamic inputs for item in "forEach" step:`,
        item
      );
      continue;
    }

    // Execute the step
    const result = await runWorkflowStep(llm, step, dynamicInputs, isOutputNode, onStepUpdate);

    if (result === null) {
      console.error(`Failed processing item in "forEach" step:`, item);
      continue;
    }

    results.push(result);
  }

  // Combine results into the step output
  return results;
}
