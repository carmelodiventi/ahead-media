import { WorkflowNode } from '../../../types/Workflow.types';
import { ChatOpenAI } from '@langchain/openai';
import { parseResponse } from './parseResponse';

export async function runLlmStep(
  llm: ChatOpenAI,
  stepConfig: WorkflowNode,
  formattedPrompt: string
): Promise<any> {
  try {
    let result;
    if (stepConfig.data.stream) {
      const stream = await llm.stream(
        formattedPrompt,
        stepConfig.data.llmParams
      );
      let fullResponse = '';

      for await (const chunk of stream) {
        if (chunk?.content) {
          process.stdout.write(chunk.content as string); // Write chunk to stdout
          fullResponse += chunk.content;
        }
      }

      result = parseResponse(fullResponse, stepConfig);
    } else {
      result = await llm.invoke(formattedPrompt, stepConfig.data.llmParams);
      return parseResponse(result.content as string, stepConfig.data);
    }

    return result;
  } catch (error) {
    console.error(`Error in step ${stepConfig.data.name}:`, error);
    return null;
  }
}
