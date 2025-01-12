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

    // Save step result for downstream dependencies
    stepResults[node.data.id as string] = stepResult;
  }

  console.log('Workflow Complete');
  return stepResults;
}
