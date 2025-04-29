import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode, WorkflowTemplate } from '../types/Workflow.types';
import { runForEachStep } from './workflow/helpers/runForEachStep';
import { runWorkflowStep } from './workflow/helpers/runWorkflowStep';
import { resolveStepInputs } from './workflow/helpers/resolveStepInputs';

export async function runWorkflow(
  workflow: WorkflowTemplate,
  initialInputs: Record<string, any>,
  queryPrompt: string,
  onStepUpdate: ({ status, data }: { status: string; data: Record<string, any> }) => void
): Promise<Record<string, any> | null> {
  const llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
  const stepResults: Record<string, any> = {};

  for (const node of workflow.nodes) {
    const isOutputNode = workflow.nodes.length - 1 === workflow.nodes.indexOf(node as any);
    let stepResult;

    const stepInputs = resolveStepInputs(
      node.data.inputMapping as Record<string, string>,
      initialInputs,
      queryPrompt,
      stepResults,
      node.data.name as string,
      node.data.variables?.required || [],
      node.data.variables?.optional || []
    );

    if (!stepInputs) {
      console.error(`Failed to resolve inputs for step "${node.data.name}"`);
      return null;
    }

    if (node.data.type === 'forEach') {
      stepResult = await runForEachStep(
        llm,
        node as WorkflowNode,
        initialInputs,
        stepResults,
        isOutputNode,
        onStepUpdate
      );
    } else {
      stepResult = await runWorkflowStep(
        llm,
        node as WorkflowNode,
        stepInputs,
        isOutputNode,
        onStepUpdate
      );
    }

    if (stepResult === null) {
      console.error(`Step "${node.data.name}" failed, stopping workflow.`);
      return null;
    }

    if (node.data.expectJson && typeof stepResult === 'string') {
      try {
        const parsedResult = JSON.parse(stepResult);

        if (typeof parsedResult === 'object' && parsedResult !== null) {
          stepResults[node.data.id as string] = {
            ...stepResults[node.data.id as string],
            ...parsedResult,
          };
        } else {
          console.warn(`Step "${node.data.name}" returned invalid JSON structure.`);
          stepResults[node.data.id as string] = stepResult;
        }
      } catch (error) {
        console.error(`Failed to parse JSON response from step "${node.data.name}":`, error);
        return null;
      }
    } else {
      stepResults[node.data.id as string] = stepResult;
    }

    // Emit intermediate results
    if (!isOutputNode) {
      onStepUpdate({
        status: 'processing',
        data: { step: node.data.name, result: stepResult },
      });
    }
  }

  // Emit final results
  onStepUpdate({
    status: 'complete',
    data: stepResults,
  });

  return stepResults;
}
