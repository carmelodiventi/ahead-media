import { ChatOpenAI } from '@langchain/openai';
import { ForEachWorkflowStep } from '../../../types/Workflow.types';
import { runWorkflowStep } from './runWorkflowStep';

export async function runForEachStep(
  llm: ChatOpenAI,
  step: ForEachWorkflowStep,
  initialInputs: Record<string, any>,
  stepResults: Record<string, any>
): Promise<any[] | null> {
  const sourceStepName = step.for_each_config.source; // Get source step name
  const sourceFieldName = step.for_each_config.field; // Get the field name

  //Safely access the source data and field.
  const sourceData = stepResults[sourceStepName];
  if (!sourceData) {
    console.error(
      `Source step "${sourceStepName}" not found in previous results.`
    );
    return null;
  }

  const items = sourceData[sourceFieldName];
  if (!items || !Array.isArray(items)) {
    console.error(
      `Source field "${sourceFieldName}" in step "${sourceStepName}" is invalid or not an array.`,
      sourceData
    );
    return null;
  }

  const forEachResults: any[] = [];

  for (const item of items) {
    const subStepInputs = {
      ...initialInputs, // Provide all initial inputs
      ...stepResults, // Provide all previous step results
      [step.for_each_config.item_input_parameter_name]: item, // Current item from the loop
    };

    const forEachResult = await runWorkflowStep(
      llm,
      step,
      subStepInputs
    );
    if (forEachResult === null) {
      console.error(`Error in forEach sub-step: ${step.name}`);
      return null;
    }
    forEachResults.push(forEachResult);
  }

  return forEachResults;
}
