import { ChatOpenAI } from '@langchain/openai';
import {
  ForEachWorkflowStep, RegularWorkflowStep,
  StepType,
  WorkflowConfig,
} from '../types/Workflow.types';
import { getStepInputs } from './workflow/helpers/getStepInputs';
import { runForEachStep } from './workflow/helpers/runForEachStep';
import { runWorkflowStep } from './workflow/helpers/runWorkflowStep';

export async function runWorkflow(
  workflowConfig: WorkflowConfig,
  initialInputs: Record<string, any>
): Promise<Record<string, any> | null> {

  const llm = new ChatOpenAI({ model: 'gpt-4o-mini' });
  const stepResults: Record<string, any> = {};

  for (const step of workflowConfig.steps) {
    let stepResult;
    if (step.type === StepType.ForEach) {
      const currentStep = step as ForEachWorkflowStep;
      stepResult = await runForEachStep(
        llm,
        currentStep,
        initialInputs,
        stepResults
      );
    } else {
      const currentStep = step as RegularWorkflowStep;
      const stepInputs = await getStepInputs(currentStep, initialInputs, stepResults);
      stepResult = await runWorkflowStep(llm, currentStep, stepInputs);
    }
    if (stepResult === null) {
      console.error(`Step "${step.name}" failed, stopping workflow.`);
      return null;
    }
    stepResults[step.name] = stepResult;
  }

  console.log('Workflow Complete');
  return stepResults;
}
