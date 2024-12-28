import { z } from 'zod';
import { Edge, Node, Viewport } from '@xyflow/react';
import { OpenAIBaseInput } from '@langchain/openai';
import {ExtractedVars} from "../components/workflow-builder/utils/extractVariables";

/**
 * Workflow Template
 */
export interface WorkflowTemplate {
  id?: string;
  name: string;
  config: WorkflowConfig;
  nodes: Node[];
  edges: Edge[];
  viewport?: Viewport;
}

/**
 * Step Types
 */
export enum StepType {
  Sequential = 'sequential',
  ForEach = 'forEach',
}

/**
 * A standard sequential step in the workflow
 */
export interface RegularWorkflowStep {
  id?: string;
  name: string;
  type: StepType;
  llmParams?: Partial<OpenAIBaseInput>;
  // JSON validation
  expectJson?: boolean;
  zodSchema?: string | z.ZodTypeAny;
  // Stream the result
  stream: boolean;
  // Prompt-related fields
  systemPrompt: string;
  userPrompt: string;
  inputMapping?: Record<string, unknown>;
  outputMapping?: Record<string, unknown>;
  // variable inputs
  variables?: {
    required?: string[];
    optional?: string[];
  };
  // variable outputs
  stepOutput: string | Record<string, any>;
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
  type: string; // e.g., 'string', 'number', 'array'
  description?: string;
  defaultValue?: any;
  required: boolean;
}

/**
 * Overall workflow config
 */
export interface WorkflowConfig {
  id: string;
  name: string;
  inputs?: Record<string, WorkflowInput>;
  variables?: ExtractedVars;
  steps: WorkflowStep[];
}

/**
 * A generic node change handler type
 */
export type NodeChangeHandler<T> = (id: string, updatedData: T) => void;

/**
 * Node types
 *
 * We remove the WorkflowConfigNodeType so there's no single 'workflow' node anymore.
 */

/**
 * Regular workflow node type: for 'sequential' steps
 */
export type RegularWorkflowNodeType = Node<
  RegularWorkflowStep &
    Record<string, unknown> & {
      onChange: NodeChangeHandler<RegularWorkflowStep>;
      inputMapping: Record<string, string>;
      outputMapping?: Record<string, string>;
    },
  'sequential'
>;

/**
 * ForEach workflow node type
 */
export type ForEachWorkflowNodeType = Node<
  ForEachWorkflowStep &
    Record<string, unknown> & {
      onChange: NodeChangeHandler<RegularWorkflowStep>;
      inputMapping?: Record<string, string>;
      outputMapping?: Record<string, string>;
    },
  'forEach'
>;

/**
 * Union of all node types (now only 'sequential' and 'forEach')
 */
export type WorkflowNode = RegularWorkflowNodeType | ForEachWorkflowNodeType;
