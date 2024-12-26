import '@xyflow/react/dist/style.css';
import React, { useCallback, useState } from 'react';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import {
  addEdge,
  Background,
  Controls,
  Edge,
  MiniMap,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  useNodesState,
  NodeTypes,
  useEdgesState,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import {
  ForEachWorkflowNodeType,
  ForEachWorkflowStep,
  NodeChangeHandler,
  RegularWorkflowNodeType,
  RegularWorkflowStep,
  StepType,
  WorkflowConfig,
  WorkflowConfigNodeType,
  WorkflowNode,
  WorkflowTemplate,
} from '../types/Workflow.types';
import {
  ForEachNode,
  SequentialNode,
  WorkflowConfigNode,
} from '../components/workflow-builder/workflowNodes';
import Toolbar from '../components/workflow-builder/toolbar';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select()
      .eq('id', '1')
      .single();
    if (error) {
      console.error('Error fetching workflows:', error);
      throw { error: 'Failed to fetch workflows' };
    }
    return Response.json({ workflow: data as WorkflowTemplate });
  } catch (error) {
    return Response.json(`Failed to fetch workflows: ${error}`, {
      status: 500,
    });
  }
};

const nodeTypes: NodeTypes = {
  workflow: WorkflowConfigNode,
  sequential: SequentialNode,
  forEach: ForEachNode,
};

export default function Workflows() {
  const { workflow }: { workflow: WorkflowTemplate } =
    useLoaderData<typeof loader>();

  const initialWorkflowConfig: WorkflowConfig = workflow
    ? workflow.config
    : { id: uuidv4(), name: 'New Workflow', inputs: {}, steps: [] };

  const [workflowConfig, setWorkflowConfig] = useState<WorkflowConfig>(
    initialWorkflowConfig
  );

  const onWorkflowConfigChange: NodeChangeHandler<WorkflowConfig> = useCallback(
    (id, updatedConfig) => {
      setWorkflowConfig(updatedConfig);
    },
    []
  );

  const initialNodes: (WorkflowNode | WorkflowConfigNodeType)[] = workflow
    ? workflow.nodes
    : [
        {
          id: uuidv4(),
          type: 'workflow',
          position: { x: 0, y: 0 },
          data: { ...initialWorkflowConfig, onChange: onWorkflowConfigChange },
        },
      ];
  const initialEdges = workflow ? workflow.edges : [];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onNodeChange: NodeChangeHandler<
    RegularWorkflowStep | ForEachWorkflowStep
  > = useCallback((id, updatedData) => {
    setNodes(
      (prevNodes) =>
        prevNodes.map((node) =>
          node.id === id ? { ...node, data: updatedData } : node
        ) as WorkflowNode[]
    );
  }, []);

  const getAvailableInputs = (
    targetNodeId: string,
    nodes: WorkflowNode[],
    edges: Edge[]
  ): string[] => {

    const connectedNodes = edges.reduce<WorkflowNode[]>((acc, edge) => {
      if (edge.target === targetNodeId) {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        if (sourceNode && sourceNode.type !== 'workflow') { // Exclude Workflow Config node
          acc.push(sourceNode);
        }
      }
      return acc;
    }, []);

    return connectedNodes.flatMap((node) => {
      const outputs = [node.data.name];
      if ('usesInputs' in node.data) {
        // Check for usesInputs instead
        outputs.push(...(node.data.usesInputs as Array<string>)); //  Access usesInputs
      }
      return outputs;
    }) as string[];
  };

  const onConnect: OnConnect = useCallback((params) => {
    setEdges((eds) => addEdge({ ...params, type: 'workflow' }, eds)); // Add type to the connection
  }, []);

  const getYpos = useCallback((prevNodes: WorkflowNode[]) => {
    return prevNodes.length > 0
      ? Math.max(...prevNodes.map((n) => n.position.y)) + 100
      : 100;
  }, []);

  const addSequentialNode = useCallback(() => {
    const newNodeId = uuidv4();
    const newNode: RegularWorkflowNodeType = {
      id: newNodeId,
      type: StepType.Sequential,
      position: { x: 100, y: getYpos(nodes) },
      data: {
        name: 'New Sequential Step',
        type: StepType.Sequential,
        systemPrompt: '',
        userPrompt: '',
        stream: false,
        expectJson: false,
        zodSchema: '',
        availableInputs: [],
        onChange: onNodeChange,
      },
    };

    setNodes((prevNodes: WorkflowNode[]) => [
      ...(prevNodes as WorkflowNode[]),
      newNode as unknown as WorkflowNode,
    ]);
  }, [getYpos, nodes, onNodeChange, setNodes]);

  const addForEachNode = useCallback(() => {
    const newNode: ForEachWorkflowNodeType = {
      id: uuidv4(),
      type: StepType.ForEach,
      position: { x: 100, y: getYpos(nodes) },
      data: {
        name: 'New ForEach Step',
        type: StepType.ForEach,
        for_each_config: {
          source: '',
          field: '',
          item_input_parameter_name: '',
        },
        sub_step: {
          name: 'New Sequential Sub Step',
          type: StepType.Sequential,
          systemPrompt: '',
          userPrompt: '',
          stream: false,
          expectJson: false,
          zodSchema: '',
        },
        availableInputs: [],
        onChange: onNodeChange,
      },
    };
    setNodes((prevNodes: WorkflowNode[]) => [
      ...(prevNodes as WorkflowNode[]),
      newNode as unknown as WorkflowNode,
    ]);
  }, [getYpos, nodes, onNodeChange, setNodes]);

  const updatedNodes = nodes.map((node) => {
    if (node.type !== 'workflow') {
      return {
        ...node,
        // availableInputs set when each node is rendered, using current nodes and edges, this allows dynamic updates
        data: {
          ...node.data,
          initialWorkflowConfig: workflowConfig,
          availableInputs: getAvailableInputs(node.id, nodes, edges),
          onChange: onNodeChange, // onNodeChange handles the updating logic for each node type
        },
      };
    }

    return node;
  }) as WorkflowNode[];

  const configNode = updatedNodes.find((n) => n.type === 'workflow');

  const allNodes = configNode
    ? updatedNodes // Config node exists, return normal nodes
    : [
        {
          id: 'workflow-config',
          type: 'workflow',
          position: { x: 0, y: 0 },
          data: { ...workflowConfig, onChange: onWorkflowConfigChange }, //Correct data goes here
        } as WorkflowConfigNodeType, // Correct type assertion
        ...updatedNodes, //Add other nodes to the array
      ];

  const onSave = useCallback(() => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();
    console.log('Workflow to save:', JSON.stringify(flow, null, 2));
  }, [reactFlowInstance, workflowConfig, nodes]);

  return (
    <div style={{ width: 'calc("100vw-250px")', height: '100vh' }}>
      <Toolbar
        onSave={onSave}
        addSequentialNode={addSequentialNode}
        addForEachNode={addForEachNode}
      />
      <ReactFlow
        nodes={allNodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 2 }}
        onInit={setReactFlowInstance}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
