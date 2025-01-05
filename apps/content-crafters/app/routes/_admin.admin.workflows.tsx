import React, {EventHandler, ReactEventHandler, useMemo} from 'react';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import { WorkflowConfig } from '../types/Workflow.types';
import { Box, Flex, TextField, Link as NavLink  } from '@radix-ui/themes';
import {
  DividerHorizontalIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { Header } from '../components/shared/layout/header';
import DataTable from '../components/shared/datatable/DataTable';
import { createColumnHelper } from '@tanstack/react-table';
import { useNavigate } from 'react-router';

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

export const action: ActionFunction = async ({ request }) => {
  const formData = await request.formData();
  if (!formData.has('workflow')) {
    return new Response('No workflow data found', { status: 400 });
  }
  const workflow = JSON.parse(formData.get('workflow') as string);
  console.log('Form data:', workflow);

  // Save the workflow to the database

  const { supabaseClient } = createSupabaseServerClient(request);
  const { data, error } = await supabaseClient
    .from('workflow_templates')
    .insert(workflow);

  if (error) {
    console.error('Error saving workflow:', error);
    return new Response('Failed to save workflow', { status: 500 });
  }

  return Response.json({
    success: true,
    message: 'Workflow saved successfully',
    workflow: data,
  });
};

export default function Workflows() {
  const { workflows }: { workflows: WorkflowConfig[] } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const actionData = useLoaderData<typeof action>();
  const navigate = useNavigate();
  console.log('Action data:', actionData);

  const handleCreateWorkflow = () => {
    const formData = new FormData();
    formData.append(
      'workflow',
      JSON.stringify({ name: 'New workflow', config: {} })
    );
    console.log('Form data:', formData);
    fetcher.submit(formData, {
      method: 'post',
      action: '/admin/workflows',
    });
  };

  const columnHelper = createColumnHelper<WorkflowConfig>();

  const columns = useMemo(
    () => [
      columnHelper.accessor('name', {
        header: () => 'Name',
        cell: (info) => (
          <NavLink
            color="gray"
            href={`/app/documents/${info.row.original.id}`}
            onClick={(event: React.MouseEvent<HTMLAnchorElement>) => {
              event.preventDefault();
              navigate(`/admin/workflows/${info.row.original.id}`);
            }}
          >
            {info.renderValue() ? (
              info.renderValue()
            ) : (
              <DividerHorizontalIcon />
            )}
          </NavLink>
        ),
      }),
    ],
    []
  );

  return (
    <Flex gap={'4'} direction={'column'}>
      <Header
        title={'Workflows'}
        quickActions={[
          {
            label: 'Create new workflow',
            action: () => handleCreateWorkflow(),
          },
        ]}
      />

      <Box px={'6'}>
        <TextField.Root placeholder={'Search workflows'}>
          <TextField.Slot>
            <MagnifyingGlassIcon />
          </TextField.Slot>
        </TextField.Root>
      </Box>

      <DataTable
        data={workflows}
        columns={columns}
        loading={actionData.loading}
      />
    </Flex>
  );
}
