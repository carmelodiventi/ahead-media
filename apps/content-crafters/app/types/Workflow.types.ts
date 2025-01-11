import { Edge, Node, Viewport } from '@xyflow/react';
import { OpenAIBaseInput } from '@langchain/openai';
import { ExtractedVars } from '../components/workflow-builder/utils/extractVariables';


/**
 * Overall workflow config
 */
export interface WorkflowConfig {
  inputs?: Record<string, WorkflowInput>;
  variables?: ExtractedVars;
}

/**
 * Workflow Template
 */
export interface WorkflowTemplate {
  id: string;
  name: string;
  description?: string;
  template_prompt?: string;
  config: WorkflowConfig;
  nodes: Node[];
  edges: Edge[];
  viewport: Viewport;
  created_at: string;
  updated_at: string;
}

/**
 * Step Types
 */
export enum StepType {
  Sequential = 'sequential',
  ForEach = 'forEach',
}

export interface Schema {
  type: string;
  properties?: Record<string, Schema>;
  required?: string[];
  items?: Schema;
}


/**
 * A standard sequential step in the workflow
 */
export interface RegularWorkflowStep {
  id?: string;
  name: string;
  type: StepType;
  llmParams: Partial<OpenAIBaseInput>;
  expectJson: boolean;
  zodSchema?: Schema;
  stream: boolean;
  systemPrompt: string;
  userPrompt: string;
  availableInputs: string[];
  inputMapping: Record<string, string>;
  output: 'rawText' | 'json';
  variables: ExtractedVars;
  stepOutput: string;
}

/**
 * A forEach step that processes an array of items
 */
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

/**
 * Union type of all possible steps in a workflow
 */
export type WorkflowStep = RegularWorkflowStep | ForEachWorkflowStep;

/**
 * Describes a user-supplied input to the entire workflow
 */
export interface WorkflowInput {
  label: string;
  description?: string;
  defaultValue: string;
}

/**
 * Regular workflow node type: for 'sequential' steps
 */
export type RegularWorkflowNodeType = Node<
  RegularWorkflowStep & Record<string, unknown>,
  'sequential'
>;

/**
 * ForEach workflow node type
 */
export type ForEachWorkflowNodeType = Node<
  ForEachWorkflowStep &
    Record<string, unknown> & {
      sub_step: RegularWorkflowStep;
    },
  'forEach'
>;

/**
 * Union of all node types (now only 'sequential' and 'forEach')
 */
export type WorkflowNode = RegularWorkflowNodeType | ForEachWorkflowNodeType;
