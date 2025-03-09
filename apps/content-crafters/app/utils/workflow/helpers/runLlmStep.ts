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
    let fullResponse = '';

    if (stepConfig.data.stream) {
      const stream = await llm.stream(
        formattedPrompt,
        stepConfig.data.llmParams
      );

      for await (const chunk of stream) {
        if (chunk?.content) {
          // process.stdout.write(chunk.content as string); // Write chunk to stdout
          fullResponse += chunk.content;

          if (onUpdate && !isOutputNode) {
            onUpdate({
              status: 'processing',
              data: { content: chunk.content },
            });
          }

          if (onUpdate && isOutputNode) {
            onUpdate({
              status: 'generating',
              data: { content: chunk.content },
            });
          }
        }
      }
    } else {
      result = await llm.invoke(formattedPrompt, stepConfig.data.llmParams);
      fullResponse = Array.isArray(result.content) ? result.content.join('') : result.content.toString();

      if (onUpdate && isOutputNode) {
        onUpdate({
          status: 'generating',
          data: { content: result.content },
        });
      }

      if (onUpdate && !isOutputNode) {
        onUpdate({
          status: 'processing',
          data: { content: result.content },
        });
      }
    }

    const parsedResult = parseResponse(fullResponse, stepConfig);

    if (onUpdate && isOutputNode) {
      onUpdate({
        status: 'complete',
        data: { content: parsedResult },
      });
    }

    return parsedResult;
  } catch (error) {
    console.error(`Error in step ${stepConfig.data.name}:`, error);
    return null;
  }
}
