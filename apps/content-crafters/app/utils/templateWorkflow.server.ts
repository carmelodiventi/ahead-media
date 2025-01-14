import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode, WorkflowTemplate } from '../types/Workflow.types';
import { runForEachStep } from './workflow/helpers/runForEachStep';
import { runWorkflowStep } from './workflow/helpers/runWorkflowStep';
import { resolveStepInputs } from './workflow/helpers/resolveStepInputs';

export async function runWorkflow(
  workflow: WorkflowTemplate,
  initialInputs: Record<string, any>
): Promise<Record<string, any> | null> {
  const llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
  const stepResults: Record<string, any> = {};

  for (const node of workflow.nodes) {
    let stepResult;

    // Resolve inputs for the current node using the helper
    const stepInputs = resolveStepInputs(
      node.data.inputMapping as Record<string, string>,
      initialInputs,
      stepResults,
      node.data.name as string,
      node.data.variables?.required || [],
      node.data.variables?.optional || []
    );

    if (!stepInputs) {
      console.error(`Failed to resolve inputs for step "${node.data.name}"`);
      return null;
    }

    // Execute the step
    if (node.data.type === 'forEach') {
      stepResult = await runForEachStep(
        llm,
        node as WorkflowNode,
        initialInputs,
        stepResults
      );
    } else {
      stepResult = await runWorkflowStep(llm, node as WorkflowNode, stepInputs);
    }

    // Handle errors
    if (stepResult === null) {
      console.error(`Step "${node.data.name}" failed, stopping workflow.`);
      return null;
    }

    if (node.data.expectJson && typeof stepResult === 'string') {
      try {
        const parsedResult = JSON.parse(stepResult);

        if (typeof parsedResult === 'object' && parsedResult !== null) {
          // Merge parsed JSON into stepResults under the node ID
          stepResults[node.data.id as string] = {
            ...stepResults[node.data.id as string], // Preserve existing data if any
            ...parsedResult, // Merge new parsed data
          };
        } else {
          console.warn(`Step "${node.data.name}" returned invalid JSON structure.`);
          stepResults[node.data.id as string] = stepResult; // Fallback to raw result
        }
      } catch (error) {
        console.error(
          `Failed to parse JSON response from step "${node.data.name}":`,
          error
        );
        return null; // Stop workflow on critical JSON parse error
      }
    } else {
      stepResults[node.data.id as string] = stepResult;
    }

  }

  console.log('Workflow Complete');
  return stepResults;
}
