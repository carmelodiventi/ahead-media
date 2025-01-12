import { create } from 'zustand';
import {
  ForEachWorkflowStep,
  RegularWorkflowStep,
  StepType,
  WorkflowConfig,
  WorkflowInput,
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
import { ExtractedVars } from '../components/workflow-builder/utils/extractVariables';

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
  onEdgesDelete: (edges: Edge[]) => void;
  onConnect: (connection: Connection) => void;
  onConfigChange: (config: WorkflowConfig) => void;
}

const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: [],
  edges: [],
  workflowConfig: {
    inputs: {},
    variables: {
      required: [] as string[],
      optional: [] as string[],
    },
  },
  onNodesChange: (changes: NodeChange<WorkflowNode>[]) => {
    const updatedNodes = applyNodeChanges(changes, get().nodes);

    // Preserve input handling logic
    const existingInputs = get().workflowConfig.inputs;
    const newInputs: Record<string, WorkflowInput> = {};
    const variables = {
      required: [] as string[],
      optional: [] as string[],
    };

    updatedNodes.forEach((node) => {
      if (node.data.inputMapping) {
        const inputMapping = node.data.inputMapping as Record<string, string>;

        Object.entries(inputMapping).forEach(([key, mapping]) => {
          if (mapping.startsWith('initialInput')) {
            newInputs[key] = {
              ...existingInputs[key],
              required: false,
            };
          }
        });

        const nodeVariables = node.data.variables as ExtractedVars;
        if (nodeVariables.required) {
          nodeVariables.required.forEach((variable) => {
            if (newInputs[variable]) {
              newInputs[variable].required = true;
            }
          });
        }

        if (nodeVariables.optional) {
          variables.optional = [
            ...new Set([...variables.optional, ...nodeVariables.optional]),
          ];
        }
      }
    });

    // Set updated nodes and workflowConfig in the state
    set({
      nodes: updatedNodes, // Ensure nodes are updated
      workflowConfig: {
        ...get().workflowConfig,
        inputs: newInputs,
        variables,
      },
    });
  },
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  onEdgesDelete: (edgesToDelete) => {
    const { nodes, edges, onNodeChange, setEdges } = get();

    edgesToDelete.forEach((edgeToDelete) => {
      const targetNode = edgeToDelete.target;
      const node = nodes.find((node) => node.id === targetNode);
      if (!node) return;

      const { [edgeToDelete.targetHandle as string]: _, ...newInputMapping } =
        node.data.inputMapping as Record<string, string>;

      onNodeChange(targetNode, {
        ...node.data,
        inputMapping: newInputMapping,
      });
    });

    setEdges(edges.filter((edge) => !edgesToDelete.includes(edge)));
  },
  onConnect: (connection: Connection) => {
    const edge = { ...connection, type: 'customEdge' };
    set({
      edges: addEdge(edge, get().edges),
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
              },
            };
          } else {
            const updatedNodeData = updatedData as RegularWorkflowStep;
            return {
              ...node,
              data: {
                ...node.data,
                ...updatedNodeData,
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
