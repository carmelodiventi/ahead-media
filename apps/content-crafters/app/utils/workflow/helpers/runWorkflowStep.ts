import {ChatOpenAI} from "@langchain/openai";
import {RegularWorkflowStep} from "../../../types/Workflow.types";
import {validateStepConfig} from "./validateStepConfig";
import {buildPromptTemplate} from "./buildPromptTemplate";
import {formatPromptWithInputs} from "./formatPromptWithInputs";
import {runLlmStep} from "./runLlmStep";

export async function runWorkflowStep(
  llm: ChatOpenAI,
  step: RegularWorkflowStep,
  inputs: Record<string, any>
): Promise<any> {
  try {
    await validateStepConfig(step, inputs);
    const promptTemplate = buildPromptTemplate(step);
    const formattedPrompt = await formatPromptWithInputs(promptTemplate, inputs);
    console.log('formattedPrompt', formattedPrompt);
    const result = await runLlmStep(llm, step, formattedPrompt);
    if (result === null) {
      console.error(`LLM step "${step.name}" failed.`);
      return null;
    }
    return result;
  } catch (error) {
    console.error(`Error running step "${step.name}":`, error);
    return null;
  }
}
