import {RegularWorkflowStep} from "../../../types/Workflow.types";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  PromptTemplate,
  SystemMessagePromptTemplate
} from "@langchain/core/prompts";

export function buildPromptTemplate(stepConfig: RegularWorkflowStep) {

  // usesInputs dictates the variables used in the prompt templates.
  const inputVariables = stepConfig.usesInputs || [];

  return new ChatPromptTemplate({
    promptMessages: [
      new SystemMessagePromptTemplate(
        new PromptTemplate({
          template: stepConfig.systemPrompt,
          inputVariables: [], // System prompt doesn't use input variables.
        })
      ),
      new HumanMessagePromptTemplate(
        new PromptTemplate({
          template: stepConfig.userPrompt,
          inputVariables: inputVariables,
          templateFormat: 'mustache',
        })
      ),
    ],
    inputVariables: inputVariables,
    templateFormat: 'mustache',
  });
}
