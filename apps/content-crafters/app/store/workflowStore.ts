import { create } from 'zustand';
import { Edge } from '@xyflow/react';
import {WorkflowConfig, WorkflowNode} from '../types/Workflow.types';

interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  workflowConfig: WorkflowConfig;
  setNodes: (newNodes: WorkflowNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setWorkflowConfig: (config: WorkflowConfig) => void;
}

export const useWorkflowStore = create<WorkflowState>((set) => ({
  nodes: [],
  edges: [],
  workflowConfig: {
    id: '',
    name: '',
    variables: {
      required: [],
      optional: [],
    },
    steps: [],
  },
  setNodes: (nodes) => set({ nodes }),
  setEdges: (edges: Edge[]) => set({ edges }),
  setWorkflowConfig: (workflowConfig) => set({ workflowConfig }),
}));
