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
import {extractJsonKeys} from "../components/workflow-builder/utils/extractJsonKeys";

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
    inputs: {},
    variables: {
      required: [],
      optional: [],
    },
  },
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    console.log('onEdgesChange', changes);
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
            const updatedNodeData = updatedData as RegularWorkflowStep;
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedNodeData,
                ...(updatedNodeData.stepOutput && {
                  outputMetadata: {
                    type:
                      typeof updatedNodeData.stepOutput === 'object'
                        ? 'json'
                        : 'text',
                    keys:
                      typeof updatedNodeData.stepOutput === 'object'
                        ? extractJsonKeys(updatedNodeData.stepOutput)
                        : ['rawText'],
                  },
                }),
              },
            };
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
