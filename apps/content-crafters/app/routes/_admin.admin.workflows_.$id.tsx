import '@xyflow/react/dist/style.css';
import React, { useCallback, useState, useEffect } from 'react';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
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
import { useShallow } from 'zustand/react/shallow';
import useWorkflowStore, { WorkflowState } from '../store/workflowStore';
import ButtonEdge from '../components/workflow-builder/customEdges/buttonEdge';
import {Box} from "@radix-ui/themes";

export const loader: LoaderFunction = async ({ request, params }) => {
  try {
    const id = params.id;
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select()
      .eq('id', id)
      .single();
    if (error) {
      console.error('Error fetching workflows:', error);
      throw error;
    }

    return Response.json({ workflow: data as WorkflowTemplate });
  } catch (error) {
    return Response.json(`Failed to fetch workflows: ${error}`, {
      status: 500,
    });
  }
};

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  if (!formData.has('workflow')) {
    return new Response('No workflow data found', { status: 400 });
  }
  const workflow: WorkflowTemplate = JSON.parse(formData.get('workflow') as string);

  const { supabaseClient } = createSupabaseServerClient(request);
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .upsert({
      ...workflow,
      updated_at: new Date().toISOString(),
    })
    .eq('id', 1);

  if (error) {
    return new Response(`Failed to save workflow: ${error.message}`, {
      status: 500,
    });
  }

  console.log('Workflow saved:', data);

  return new Response('Workflow saved successfully');
};

const nodeTypes: NodeTypes = {
  sequential: SequentialNode,
  forEach: ForEachNode,
};

const edgeTypes = { customEdge: ButtonEdge };

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
  onEdgesDelete: state.onEdgesDelete,
});

export default function Workflows() {
  const { workflow }: { workflow: WorkflowTemplate } =
    useLoaderData<typeof loader>();
  const {
    nodes,
    edges,
    setNodes,
    setEdges,
    setWorkflowConfig,
    workflowConfig,
    onConnect,
    onNodesChange,
    onEdgesChange,
    onEdgesDelete
  } = useWorkflowStore(useShallow(selector));

  const { submit, state } = useFetcher();

  useEffect(() => {
    if (workflow) {
      setNodes(workflow.nodes as WorkflowState['nodes']);
      setEdges(workflow.edges);
      setWorkflowConfig(workflow.config);
    }
  }, [workflow, setNodes, setEdges, setWorkflowConfig]);

  console.log('Workflow:', workflow);

  const [reactFlowInstance, setReactFlowInstance] =
    useState<ReactFlowInstance | null>(null);

  const getYpos = useCallback((prevNodes: Node[]) => {
    return prevNodes.length > 0
      ? Math.max(...prevNodes.map((n) => n.position.y + (n?.height || 100)))
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
        zodSchema: [],
        inputMapping: {},
        availableInputs: [],
        stepOutput: '',
        llmParams: {
          temperature: 0.2,
        },
        variables: {
          required: [],
          optional: [],
        },
        output: 'rawText',
      },
    };

    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, setNodes]);

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
          zodSchema: [],
          stepOutput: '',
          availableInputs: [],
          llmParams: {
            temperature: 0.2,
          },
          variables: {
            required: [],
            optional: [],
          },
          output: 'rawText',
        },
      },
    };
    setNodes([...nodes, newNode]);
  }, [getYpos, nodes, setNodes]);

  const onSave = useCallback(() => {
    if (!reactFlowInstance) return;
    const flow = reactFlowInstance.toObject();

    const workflowToSave = {
      id: workflow.id,
      name: workflow.name,
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

    const formData = new FormData();
    formData.append('workflow', JSON.stringify(workflowToSave));

    submit(formData, {
      method: 'POST',
      action: `/admin/workflows/${workflow?.id}`,
    });
  }, [workflow, workflowConfig, nodes, edges]);

  // on page leave save the workflow

  useEffect(() => {
    const handleUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = '';
      alert('Saving workflow before leaving');
      onSave();
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      window.removeEventListener('beforeunload', handleUnload);
    };
  }, [onSave]);

  return (
    <Box style={{ width: 'calc("100vw - 250px")', height: '100vh' }}>
      <Toolbar
        isSaving={state === 'loading' || state === 'submitting'}
        workflow={{
          id: workflow.id,
          name: workflow.name,
          config: workflowConfig,
        }}
        onSave={onSave}
        addSequentialNode={addSequentialNode}
        addForEachNode={addForEachNode}
      />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange as any}
        onEdgesChange={onEdgesChange}
        onEdgesDelete={onEdgesDelete}
        edgeTypes={edgeTypes}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        fitViewOptions={{ padding: 2 }}
        onInit={setReactFlowInstance}
        defaultEdgeOptions={{
          animated: true,
        }}
      >
        <Controls />
        <MiniMap />
        <Background gap={12} size={1} />
      </ReactFlow>
    </Box>
  );
}
