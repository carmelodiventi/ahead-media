import { RegularWorkflowStep } from '../../../types/Workflow.types';

export async function getStepInputs(
  step: RegularWorkflowStep,
  initialInputs: Record<string, any>,
  stepResults: Record<string, any>
): Promise<Record<string, any>> {
  const inputs: Record<string, any> = {};

  for (const inputKey of step.usesInputs || []) {
    let value;

    if (step.inputMapping && step.inputMapping[inputKey]) {
      const sourceKey = step.inputMapping[inputKey];
      value = sourceKey.startsWith('initialInputs.')
        ? initialInputs[sourceKey.split('.')[1]]
        : stepResults[sourceKey];
    } else { //If there is no mapping, check in stepResults or initialInputs.
      value = stepResults[inputKey] || initialInputs[inputKey];
    }

    if (value === undefined) {
      throw new Error(
        `Required input "${inputKey}" for step "${step.name}" not found.`
      );
    }

    inputs[inputKey] = value;
  }

  return inputs;
}
