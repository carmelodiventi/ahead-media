import { z } from 'zod';
import { Edge, Node, Viewport } from '@xyflow/react';
import { OpenAIBaseInput } from '@langchain/openai';

export interface WorkflowTemplate {
  id?: string;
  name: string;
  config: WorkflowConfig;
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
}

export enum StepType {
  Sequential = 'sequential',
  ForEach = 'forEach',
}

export interface RegularWorkflowStep {
  name: string;
  type: StepType;
  llmParams?: Partial<OpenAIBaseInput>;
  expectJson?: boolean;
  zodSchema?: string | z.ZodTypeAny;
  stream: boolean;
  systemPrompt: string;
  userPrompt: string;
  usesInputs?: string[];
  inputMapping?: Record<string, string>;
}

export interface ForEachWorkflowStep {
  name: string;
  type: StepType;
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
  id: string;
  name: string;
  inputs?: Record<string, WorkflowInput>;
  steps: WorkflowStep[];
}

export type NodeChangeHandler<T> = (id: string, updatedData: T) => void;

export type WorkflowConfigNodeType = Node<
  WorkflowConfig &
    Record<string, unknown> & {
      onChange: NodeChangeHandler<WorkflowConfig>;
    },
  'workflow'
>;

export type RegularWorkflowNodeType = Node<
  RegularWorkflowStep &
    Record<string, unknown> & {
      onChange: NodeChangeHandler<RegularWorkflowStep>;
      availableInputs: string[];
      initialWorkflowConfig?: WorkflowConfig;
    },
  'sequential'
>;
export type ForEachWorkflowNodeType = Node<
  ForEachWorkflowStep &
    Record<string, unknown> & {
      onChange: NodeChangeHandler<RegularWorkflowStep>;
      availableInputs: string[];
  initialWorkflowConfig?: WorkflowConfig;
    },
  'forEach'
>;
export type WorkflowNode =
  | WorkflowConfigNodeType
  | RegularWorkflowNodeType
  | ForEachWorkflowNodeType;
