import { create } from 'zustand';
import {
  ForEachWorkflowStep,
  RegularWorkflowStep,
  StepType,
  WorkflowConfig,
  WorkflowNode,
} from '../types/Workflow.types';
import {
  addEdge,
  applyEdgeChanges,
  applyNodeChanges,
  Connection,
  Edge,
  EdgeChange,
  NodeChange,
} from '@xyflow/react';

export interface WorkflowState {
  nodes: WorkflowNode[];
  edges: Edge[];
  workflowConfig: WorkflowConfig;
  setNodes: (prevNodes: WorkflowNode[]) => void;
  setEdges: (prevEdges: Edge[]) => void;
  setWorkflowConfig: (prevConfig: WorkflowConfig) => void;
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => void;
  onNodeChange: (
    id: string,
    updatedData: RegularWorkflowStep | ForEachWorkflowStep
  ) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onConfigChange: (config: WorkflowConfig) => void;
}

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  workflowConfig: {
    id: '',
    name: '',
    inputs: {},
    variables: {
      required: [],
      optional: [],
    },
    steps: [],
  },
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  onNodeChange: (nodeId, updatedData) => {
    set({
      // @ts-ignore
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          if (node.type === StepType.ForEach) {
            const updatedNodeData = updatedData as ForEachWorkflowStep;
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedNodeData,
                for_each_config: updatedNodeData.for_each_config,
                sub_step: updatedNodeData.sub_step,
              },
            };
          } else {
            return { ...node, data: { ...node.data, ...updatedData } };
          }
        }
        return node;
      }),
    });
  },
  onConfigChange: (config) => {
    set({ workflowConfig: config });
  },
  setNodes: (nodes) => {
    set({ nodes });
  },
  setEdges: (edges) => {
    set({ edges });
  },
  setWorkflowConfig: (workflowConfig) => {
    set({ workflowConfig });
  },
}));

export default useWorkflowStore;
