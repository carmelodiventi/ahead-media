import {ChatPromptTemplate} from "@langchain/core/prompts";

export async function formatPromptWithInputs(promptTemplate:  ChatPromptTemplate, inputs: Record<string, string>) {
  return await promptTemplate.format(inputs);
}
