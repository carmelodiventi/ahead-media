import '@xyflow/react/dist/style.css';
import React, { useCallback, useState } from 'react';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  useEdgesState,
  useNodesState,
  Node, Edge,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import { ForEachNode, SequentialNode } from '../components/workflowNodes';
import * as Toolbar from '@radix-ui/react-toolbar';
import {
  ForEachWorkflowStep,
  NodeData,
  RegularWorkflowStep,
  WorkflowConfig,
} from '../types/Workflow.types';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select();
    if (error) {
      console.error('Error fetching workflows:', error);
      throw { error: 'Failed to fetch workflows' };
    }
    return Response.json({ workflows: data });
  } catch (error) {
    return Response.json(`Failed to fetch workflows: ${error}`, {
      status: 500,
    });
  }
};

const nodeTypes = {
  sequential: ({
    id,
    data,
  }: {
    id: string;
    data: RegularWorkflowStep & {
      onChange: (id: string, updatedData: NodeData) => void;
      availableInputs: string[];
    };
  }) => <SequentialNode id={id} data={data} />,
  forEach: ({
    id,
    data,
  }: {
    id: string;
    data: ForEachWorkflowStep & {
      onChange: (id: string, updatedData: NodeData) => void;
      availableInputs: string[];
    };
  }) => <ForEachNode id={id} data={data} />,
};

export default function Workflows() {
  const { workflows } = useLoaderData<typeof loader>();
  const initialNodes: Node<NodeData>[] =
    workflows && workflows.length > 0
      ? workflows.flatMap((workflow: { config: WorkflowConfig }) =>
          workflow.config.steps.map((step) => ({
            id: uuidv4(),
            type: step.type,
            position: { x: 100, y: 100 },
            data: step,
          }))
        )
      : [];
  const [nodes, setNodes, onNodesChange] =
    useNodesState<Node<NodeData>>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  const onNodeChange = useCallback((id: string, updatedData: NodeData) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
          return { ...node, data: updatedData };
        }
        return node;
      })
    );
  }, []);

  const getAvailableInputs = (
    targetNodeId: string,
    nodes: Node<
      NodeData & {
        onChange: (id: string, updatedData: NodeData) => void;
        availableInputs: string[];
      }
    >[],
    edges: Edge[] // Make sure to pass the edges array here
  ): string[] => {
    const availableInputs: string[] = []; // Start with initialInputs

    // Create a map of node IDs to their outputs for efficient lookup
    const nodeOutputs: Record<string, string[]> = {};
    nodes.forEach((node) => {
      nodeOutputs[node.id] = [node.data.name]; // Add node name as output
      if (node.data.required_inputs) {
        nodeOutputs[node.id].push(...node.data.required_inputs);
      }
    });

    // Find all nodes connected to the target node
    const connectedNodes = edges.reduce<Node<any>[]>((acc, edge) => {
      if (edge.target === targetNodeId) {
        const sourceNode = nodes.find((node) => node.id === edge.source);
        if (sourceNode) {
          acc.push(sourceNode);
        }
      }
      return acc;
    }, []);

    for (const node of connectedNodes) {
      availableInputs.push(...nodeOutputs[node.id]);
    }

    return availableInputs;
  };

  const onConnect = useCallback(
    (params) => setEdges((eds: Edge) => addEdge(params, eds)),
    [setEdges]
  );

  const getYpos = useCallback((prevNodes: Node<NodeData>[]) => {
    console.log(prevNodes);
    return prevNodes.length > 0
      ? Math.max(...prevNodes.map((n) => n.position.y)) + 100
      : 100;
  }, []);

  const addSequentialNode = useCallback(() => {
    const newNode = {
      id: uuidv4(),
      type: 'sequential',
      position: { x: 100, y: getYpos(nodes) },
      data: {
        name: 'New Sequential Step',
        type: 'sequential',
        systemPrompt: '',
        userPrompt: '',
        stream: false,
      },
    };
    setNodes((prevNodes: Node<NodeData>[]) => [
      ...(prevNodes as Node<NodeData>[]),
      newNode as Node<NodeData>,
    ]);
  }, [getYpos, nodes, setNodes]);

  const addForEachNode = useCallback(() => {
    const newNode = {
      id: uuidv4(),
      type: 'forEach',
      position: { x: 100, y: getYpos(nodes) },
      data: {
        name: 'New ForEach Step',
        type: 'forEach',
        for_each_config: {
          source: '',
          field: '',
          item_input_parameter_name: '',
        },
        sub_step: {
          name: 'New Sub Step',
          type: 'sequential',
          systemPrompt: '',
          userPrompt: '',
          stream: false,
        },
      },
    };
    setNodes((prevNodes: Node<NodeData>[]) => [
      ...(prevNodes as Node<NodeData>[]),
      newNode as Node<NodeData>,
    ]);
  }, [getYpos, nodes, setNodes]);

  const onSave = useCallback(() => {
    console.log('Saving workflow', reactFlowInstance);

    if (reactFlowInstance) {
      const flow = reactFlowInstance.toObject();
      console.log(JSON.stringify(flow));
    }
  }, [reactFlowInstance]);

  return (
    <div style={{ width: 'calc("100vw-250px")', height: '100vh' }}>
      <Toolbar.Root>
        <Toolbar.ToggleGroup type="multiple">
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="addSequentialNode"
            aria-label="addSequentialNode"
            onClick={addSequentialNode}
          >
            Add Sequential Step
          </Toolbar.ToggleItem>
          <Toolbar.Separator className="ToolbarSeparator" />
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="addForEachNode"
            aria-label="addForEachNode"
            onClick={addForEachNode}
          >
            Add ForEach Step
          </Toolbar.ToggleItem>
          <Toolbar.ToggleItem
            className="ToolbarToggleItem"
            value="save"
            aria-label="save"
            onClick={onSave}
          >
            Save
          </Toolbar.ToggleItem>
        </Toolbar.ToggleGroup>
      </Toolbar.Root>
      <ReactFlow
        nodes={nodes.map((node) => ({
          ...node,
          data: {
            ...node.data,
            availableInputs: getAvailableInputs(node.id, nodes, edges),
            onChange: onNodeChange,
          },
        }))}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onConnect={onConnect}
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
