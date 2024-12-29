import '@xyflow/react/dist/style.css';
import React, { useCallback, useState } from 'react';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import {
  Background,
  Controls,
  MiniMap,
  Node,
  NodeTypes,
  ReactFlow,
  ReactFlowInstance,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';
import {
  ForEachWorkflowNodeType,
  RegularWorkflowNodeType,
  StepType,
  WorkflowTemplate,
} from '../types/Workflow.types';
import Toolbar from '../components/workflow-builder/toolbar';
import SequentialNode from '../components/workflow-builder/customNodes/sequentialNode';
import ForEachNode from '../components/workflow-builder/customNodes/forEachNode';
import CustomEdge from '../components/workflow-builder/customEdges/customeEdge';
import { useShallow } from 'zustand/react/shallow';
import useWorkflowStore, { WorkflowState } from '../store/workflowStore';

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

const selector = (state: WorkflowState) => ({
  nodes: state.nodes,
  edges: state.edges,
  setNodes: state.setNodes,
  setEdges: state.setEdges,
  workflowConfig: state.workflowConfig,
  setWorkflowConfig: state.setWorkflowConfig,
  onConnect: state.onConnect,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
});

export default function Workflows() {
  const { workflow }: { workflow: WorkflowTemplate } =
    useLoaderData<typeof loader>();
  const {
    nodes,
    edges,
    setNodes,
    workflowConfig,
    onConnect,
    onNodesChange,
    onEdgesChange,
  } = useWorkflowStore(useShallow(selector));

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const getYpos = useCallback((prevNodes: Node[]) => {
    return prevNodes.length > 0
      ? Math.max(...prevNodes.map((n) => n.position.y)) + 100
      : 100;
  }, []);

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
      },
    };
    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, setNodes]);

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
        availableInputs: []
      },
    };
    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, setNodes]);

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
  }, [reactFlowInstance, workflow, workflowConfig, nodes, edges]);

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
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange}
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
