import {WorkflowNode} from '../../../types/Workflow.types';

/**
 * Validates the step configuration and its inputs.
 * @param stepConfig - The configuration for the workflow step.
 * @param inputs - The provided inputs for the step.
 * @throws If the configuration or required inputs are invalid.
 */
export async function validateStepConfig(
  stepConfig: WorkflowNode,
  inputs: Record<string, any>
): Promise<void> {
  // Validate essential step properties
  if (!stepConfig.data.name) {
    throw new Error(`Step configuration is missing a "name".`);
  }

  if (!stepConfig?.data.systemPrompt) {
    throw new Error(`Step "${stepConfig.data.name}" is missing a "systemPrompt".`);
  }

  if (!stepConfig?.data.userPrompt) {
    throw new Error(`Step "${stepConfig.data.name}" is missing a "userPrompt".`);
  }

  // Validate inputs based on the defined variables in the step configuration
  const requiredInputs = stepConfig?.data.variables?.required || [];
  const missingInputs = requiredInputs.filter(
    (inputName) => inputs[inputName] === undefined || inputs[inputName] === null
  );

  if (missingInputs.length > 0) {
    throw new Error(
      `Step "${
        stepConfig.data.name
      }" is missing required inputs: ${missingInputs.join(', ')}`
    );
  }

  // Optionally log or handle optional inputs
  const optionalInputs = stepConfig?.data.variables?.optional || [];
  const providedOptionalInputs = optionalInputs.filter(
    (inputName) => inputs[inputName] !== undefined && inputs[inputName] !== null
  );

  console.log(
    `Step "${
      stepConfig.data.name
    }" received optional inputs: ${providedOptionalInputs.join(', ')}`
  );
}
