import { WorkflowNode } from '../../../types/Workflow.types';
import { ChatOpenAI } from '@langchain/openai';
import { parseResponse } from './parseResponse';

export async function runLlmStep(
  llm: ChatOpenAI,
  stepConfig: WorkflowNode,
  formattedPrompt: string,
  isOutputNode: boolean,
  onUpdate?: ({
    status,
    data,
  }: {
    status: string;
    data: Record<string, any>;
  }) => void,
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

          if (onUpdate && isOutputNode) {
            onUpdate({
              status: 'processing',
              data: { content: chunk.content },
            });
          }
        }
      }

      result = parseResponse(fullResponse, stepConfig);
    } else {
      result = await llm.invoke(formattedPrompt, stepConfig.data.llmParams);

      if (onUpdate && isOutputNode) {
        onUpdate({
          status: 'processing',
          data: {
            content: result.content
          },
        }); // Send intermediate chunk to the client
      }
    }

    return result;
  } catch (error) {
    console.error(`Error in step ${stepConfig.data.name}:`, error);
    return null;
  }
}
