import { WorkflowNode } from "../../../types/Workflow.types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate,
} from "@langchain/core/prompts";

/**
 * Builds a prompt template for the given workflow step configuration.
 * @param stepConfig - The configuration of the workflow step.
 * @returns A ChatPromptTemplate instance configured with the step's system and user prompts.
 */
export function buildPromptTemplate(stepConfig: WorkflowNode): ChatPromptTemplate {
  if (!stepConfig) {
    throw new Error("Invalid step configuration: Missing data.");
  }

  const { systemPrompt, userPrompt, variables } = stepConfig.data;

  if (!systemPrompt) {
    throw new Error("Invalid step configuration: Missing system prompt.");
  }

  if (!userPrompt) {
    throw new Error("Invalid step configuration: Missing user prompt.");
  }

  const inputVariables = [...(variables?.required || []), ...(variables?.optional || [])];

  return new ChatPromptTemplate({
    promptMessages: [
      new SystemMessagePromptTemplate(
        new PromptTemplate({
          template: systemPrompt,
          inputVariables: [], // System prompt typically doesn't require dynamic inputs.
        })
      ),
      new HumanMessagePromptTemplate(
        new PromptTemplate({
          template: userPrompt,
          inputVariables,
          templateFormat: "mustache", // Ensures the user prompt uses the mustache format.
        })
      ),
    ],
    inputVariables, // Sets all the variables needed for the combined template.
    templateFormat: "mustache", // Ensures compatibility with mustache templates.
  });
}
