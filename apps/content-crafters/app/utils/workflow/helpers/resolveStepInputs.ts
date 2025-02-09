export function resolveStepInputs(
  inputMapping: Record<string, string> | undefined,
  initialInputs: Record<string, any>,
  queryPrompt: string,
  stepResults: Record<string, any>,
  stepName: string,
  required: string[] = [],
  optional: string[] = []
): Record<string, any> | null {
  const stepInputs: Record<string, any> = {};

  for (const [key, mapping] of Object.entries(inputMapping || {})) {
    const isRequired = required.includes(key);
    if (mapping.startsWith('initialInput')) {
      const value = resolveInitialInput(mapping, initialInputs);
      if (value === undefined && isRequired) {
        console.error(`Missing required initial input for "${key}" in step "${stepName}"`);
        return null;
      }
      stepInputs[key] = value; // Set undefined for optional inputs if not provided
    }
    else if (mapping.includes('queryPrompt')){
      stepInputs[key] = queryPrompt
    }
    else if (stepResults[mapping]) {
      stepInputs[key] = stepResults[mapping];
    } else {
      if (isRequired) {
        console.error(`Missing dependency "${mapping}" for required input "${key}" in step "${stepName}"`);
        return null;
      }
      stepInputs[key] = undefined; // Set undefined for optional inputs if not provided
    }
  }

  return stepInputs;
}
function resolveInitialInput(mapping: string, initialInputs: Record<string, any>): any {
  const keys = mapping.replace('initialInput.', '').split('.');
  return keys.reduce((acc, key) => acc && acc[key], initialInputs);
}
