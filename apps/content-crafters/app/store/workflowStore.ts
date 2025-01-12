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
    const nodes = get().nodes;
    const inputs = get().workflowConfig.inputs;
    const variables = {
      required: [] as string[],
      optional: [] as string[],
    };

    nodes.forEach((node) => {
      const initialInput: Record<string, WorkflowInput> = {};

      if (node.data.inputMapping) {
        const inputMapping = node.data.inputMapping as Record<string, string>;
        Object.keys(inputMapping).forEach((value) => {
          if (inputMapping[value].includes('initialInput')) {
            initialInput[value] = {
              ...inputs[value],
              required: false,
            };
          }
        });

        const nodeVariables = node.data.variables as ExtractedVars;

        // Merge variables into config
        if (nodeVariables.required) {
          variables.required = [
            ...new Set([...variables.required, ...nodeVariables.required]),
          ];
        }
        if (nodeVariables.optional) {
          variables.optional = [
            ...new Set([...variables.optional, ...nodeVariables.optional]),
          ];
        }

        // Ensure all required variables are included in initialInput
        if (nodeVariables.required) {
          nodeVariables.required.forEach((variable) => {
            if (!initialInput[variable]) {
              initialInput[variable] = {
                ...inputs[variable],
                required: true,
              };
            } else {
              initialInput[variable].required = true;
            }
          });
        }
      }

      set({
        workflowConfig: {
          ...get().workflowConfig,
          variables,
          inputs: {
            ...get().workflowConfig.inputs,
            ...initialInput,
          },
        },
      });
    });

    // Remove inputs that are mapped to node outputs
    const updatedInputs = { ...get().workflowConfig.inputs };
    nodes.forEach((node) => {
      const inputMapping = node.data.inputMapping as Record<string, string>;
      if (!inputMapping) return;
      Object.keys(inputMapping).forEach((value) => {
        if (!inputMapping[value].includes('initialInput')) {
          delete updatedInputs[value];
        }
      });
    });

    set({
      workflowConfig: {
        ...get().workflowConfig,
        inputs: updatedInputs,
      },
      nodes: applyNodeChanges(changes, get().nodes),
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
