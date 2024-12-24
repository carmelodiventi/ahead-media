import {RegularWorkflowStep} from '../../../types/Workflow.types';

export async function validateStepConfig(
  stepConfig: RegularWorkflowStep,
  inputs: Record<string, any>
) {
  if (!stepConfig.name || !stepConfig.systemPrompt || !stepConfig.userPrompt) {
    throw new Error(`Invalid step configuration for step: ${stepConfig.name}`);
  }

  // Check if all "usesInputs" are present in the provided inputs
  const missingInputs = (stepConfig.usesInputs || []).filter(
    (inputName) => inputs[inputName] === undefined || inputs[inputName] === null // Check for both undefined and null
  );

  if (missingInputs.length > 0) {
    throw new Error(
      `Missing required inputs for step ${
        stepConfig.name
      }: ${missingInputs.join(', ')}`
    );
  }
}
