import { RegularWorkflowStep } from '../../../types/Workflow.types';
import { ChatOpenAI } from '@langchain/openai';
import { parseResponse } from './parseResponse';

export async function runLlmStep(
  llm: ChatOpenAI,
  stepConfig: RegularWorkflowStep,
  formattedPrompt: string
): Promise<any> {
  try {
    let result;
    if (stepConfig.stream) {
      const stream = await llm.stream(formattedPrompt, stepConfig.llmParams);
      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk?.content) {
          process.stdout.write(chunk.content as string); // Write chunk to stdout
          fullResponse += chunk.content;
        }
      }

      result = parseResponse(fullResponse, stepConfig);
    } else {
      result = await llm.invoke(formattedPrompt, stepConfig.llmParams);
      return parseResponse(result.content as string, stepConfig);
    }

    return result;
  } catch (error) {
    console.error(`Error in step ${stepConfig.name}:`, error);
    return null;
  }
}
