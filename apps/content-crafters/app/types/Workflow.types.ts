import { z } from 'zod';
import { OpenAIBaseInput } from '@langchain/openai';

interface StreamingConfig {
  streamer: string;
  streamer_configuration_parameters: any;
}

export interface RegularWorkflowStep {
  name: string;
  type: 'sequential';
  llmParams?: Partial<OpenAIBaseInput>;
  expectJson?: boolean;
  zodSchema?: z.ZodTypeAny;
  streamingConfigs?: StreamingConfig[];
  stream: boolean;
  systemPrompt: string;
  userPrompt: string;
  usesInputs?: string[];
  inputMapping?: Record<string, string>;
}

export interface ForEachWorkflowStep {
  name: string;
  type: 'forEach';
  for_each_config: {
    source: string;
    field: string;
    item_input_parameter_name: string;
  };
  sub_step: RegularWorkflowStep;
}

export type WorkflowStep = RegularWorkflowStep | ForEachWorkflowStep;

export interface WorkflowInput {
  type: string; // Type of the input (e.g., 'string', 'number', 'array')
  description?: string;
  defaultValue?: any;
  required: boolean;
}

export interface WorkflowConfig {
  name: string;
  inputs?: Record<string, WorkflowInput>;
  steps: WorkflowStep[];
}

interface SequentialNodeData extends Record<string, unknown> {
  name: string;
  type: 'sequential';
  systemPrompt: string;
  userPrompt: string;
  stream: boolean;
}

interface ForEachNodeData extends Record<string, unknown> {
  name: string;
  type: 'forEach';
  for_each_config: {
    source: string;
    field: string;
    item_input_parameter_name: string;
  };
  sub_step: SequentialNodeData;
}

// Update the NodeData type to include these interfaces
export type NodeData = SequentialNodeData | ForEachNodeData;
