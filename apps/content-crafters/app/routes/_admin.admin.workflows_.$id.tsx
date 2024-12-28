import '@xyflow/react/dist/style.css';
import React, { useCallback, useMemo, useState } from 'react';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import {
  addEdge,
  Background,
  Controls,
  MiniMap,
  OnConnect,
  ReactFlow,
  ReactFlowInstance,
  NodeTypes,
  Node,
  applyNodeChanges,
  applyEdgeChanges,
  Edge,
  EdgeChange,
  NodeChange,
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
  WorkflowNode,
  WorkflowTemplate,
} from '../types/Workflow.types';
import Toolbar from '../components/workflow-builder/toolbar';
import SequentialNode from '../components/workflow-builder/customNodes/sequentialNode';
import ForEachNode from '../components/workflow-builder/customNodes/forEachNode';
import CustomEdge from '../components/workflow-builder/customEdges/customeEdge';
import { useWorkflowStore } from '../store/workflowStore';

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
  sequential: SequentialNode,
  forEach: ForEachNode,
};

const edgeTypes = { workflow: CustomEdge };

export default function Workflows() {
  const { workflow }: { workflow: WorkflowTemplate } =
    useLoaderData<typeof loader>();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    workflowConfig,
    setWorkflowConfig,
  } = useWorkflowStore();

  const handleNodesChange = useCallback(
    (changes: NodeChange<WorkflowNode>[]) => {
      const newNodes = applyNodeChanges(changes, nodes);
      setNodes(newNodes);
    },
    [nodes, setNodes]
  );

  const handleEdgesChange = useCallback(
    (changes: EdgeChange<Edge>[]) => {
      const newEdges = applyEdgeChanges(changes, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const onNodeChange: NodeChangeHandler<RegularWorkflowStep | ForEachWorkflowStep> = useCallback(
    (id, updatedData) => {
      // // Build the new array of nodes by mapping over the current nodes array
      // const newNodes = nodes.map((n) =>
      //   n.id === id ? { ...n, data: updatedData } : n
      // );
      // // Pass the new array to setNodes
      // // @ts-ignore
      // setNodes(newNodes);

      // Then your config logic can do direct as well (unless you want a callback):
      const newConfig: WorkflowConfig = {
        ...workflowConfig,
        variables: { ...workflowConfig.variables },
      };

      if (updatedData.type === StepType.Sequential) {
        const updatedNodeData = updatedData as RegularWorkflowStep;
        if (updatedNodeData.variables) {
          Object.entries(updatedNodeData.variables).forEach(([k, v]) => {
            // Merge v into newConfig.variables?
            (newConfig.variables as any)[k] = v;
          });
        }
      }
      setWorkflowConfig(newConfig);
    },
    [nodes, workflowConfig, setNodes, setWorkflowConfig]
  );

  const onConnect: OnConnect = useCallback(
    (params) => {
      const newEdges = addEdge({ ...params, type: 'workflow' }, edges);
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  // 6) Utility: getYpos
  const getYpos = useCallback((prevNodes: Node[]) => {
    return prevNodes.length > 0
      ? Math.max(...prevNodes.map((n) => n.position.y)) + 100
      : 100;
  }, []);

  // 7) addSequentialNode
  const addSequentialNode = useCallback(() => {
    const id = uuidv4();
    const newNode: RegularWorkflowNodeType = {
      id,
      type: StepType.Sequential,
      position: { x: 100, y: getYpos(nodes) },
      data: {
        id,
        name: 'New Sequential Step',
        type: StepType.Sequential,
        systemPrompt: '',
        userPrompt: '',
        stream: false,
        expectJson: false,
        zodSchema: '',
        inputMapping: {},
        stepOutput: '',
        onChange: onNodeChange,
      },
    };
    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, onNodeChange, setNodes]);

  // 8) addForEachNode
  const addForEachNode = useCallback(() => {
    const id = uuidv4();
    const newNode: ForEachWorkflowNodeType = {
      id,
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
          id,
          name: 'New Sequential Sub Step',
          type: StepType.Sequential,
          systemPrompt: '',
          userPrompt: '',
          stream: false,
          expectJson: false,
          inputMapping: {},
          zodSchema: '',
          stepOutput: '',
        },
        availableInputs: [],
        onChange: onNodeChange,
      },
    };
    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, onNodeChange, setNodes]);

  // 9) onSave
  const onSave = useCallback(() => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();

    const workflowToSave = {
      id: workflow?.id,
      name: workflowConfig.name,
      config: workflowConfig,
      nodes: nodes.map((node) => {
        const { availableInputs, onChange, ...restOfData } = node.data;
        return {
          ...node,
          data: restOfData,
        };
      }),
      edges: flow.edges,
      viewport: flow.viewport,
    };

    console.log('Workflow to save:', workflowToSave);
    console.log('Workflow JSON:', JSON.stringify(workflowToSave, null, 2));
    // send it somewhere
  }, [reactFlowInstance, workflow, workflowConfig, nodes, edges]);

  // 10) Return the React Flow
  return (
    <div style={{ width: 'calc("100vw - 250px")', height: '100vh' }}>
      <Toolbar
        onSave={onSave}
        addSequentialNode={addSequentialNode}
        addForEachNode={addForEachNode}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange as any}
        onEdgesChange={handleEdgesChange}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 2 }}
        onInit={setReactFlowInstance}
        defaultEdgeOptions={{
          type: 'workflow',
          animated: true,
        }}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </div>
  );
}
