import { ChatOpenAI } from '@langchain/openai';
import { WorkflowNode } from '../../../types/Workflow.types';
import { validateStepConfig } from './validateStepConfig';
import { buildPromptTemplate } from './buildPromptTemplate';
import { formatPromptWithInputs } from './formatPromptWithInputs';
import { runLlmStep } from './runLlmStep';
import logger from "../../logger";

/**
 * Executes a single workflow step.
 * @param llm - The ChatOpenAI instance.
 * @param step - The step configuration.
 * @param inputs - The resolved inputs for this step.
 * @param isOutputNode
 * @param onUpdate
 * @returns The result of the LLM execution.
 */
export async function runWorkflowStep(
  llm: ChatOpenAI,
  step: WorkflowNode,
  inputs: Record<string, any>,
  isOutputNode: boolean,
  onUpdate?: (update: any) => void
): Promise<any> {
  try {
    // Validate the step configuration and inputs
    await validateStepConfig(step, inputs);

    // Build the prompt template from the step
    const promptTemplate = buildPromptTemplate(step);

    // Format the prompt with the provided inputs
    const formattedPrompt = await formatPromptWithInputs(
      promptTemplate,
      inputs
    );

    console.info('Formatted Prompt ==========>', `\n` + formattedPrompt + `\n`);

    // Run the LLM step with the formatted prompt
    const result = await runLlmStep(
      llm,
      step,
      formattedPrompt,
      isOutputNode,
      onUpdate
    );

    // If the LLM step fails, log and return null
    if (result === null) {
      console.error(`LLM step "${step.data.name}" failed.`);
      return null;
    }

    // Return the result of the LLM execution
    return result;
  } catch (error) {
    // Handle errors gracefully
    console.error(`Error running step "${step.data.name}":`, error);
    return null;
  }
}
