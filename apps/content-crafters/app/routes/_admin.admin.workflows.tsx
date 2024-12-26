import React from 'react';
import { LoaderFunction } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import { WorkflowConfig } from '../types/Workflow.types';

export const loader: LoaderFunction = async ({ request }) => {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select('*');

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

export default function Workflows() {
  const { workflows }: { workflows: WorkflowConfig[] } =
    useLoaderData<typeof loader>();

  return (
    <div style={{ width: 'calc("100vw-250px")', height: '100vh' }}>
      {workflows.map((workflow) => (
        <div key={workflow.id}>{workflow.name}</div>
      ))}
    </div>
  );
}
