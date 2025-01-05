import React from 'react';
import { ActionFunction, LoaderFunction } from '@remix-run/node';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import type { WorkflowTemplate } from '../types/Workflow.types';
import {
  Box,
  Flex,
  TextField,
  Link as NavLink,
  Card,
  Grid,
  Text,
  DropdownMenu,
  Button,
  AlertDialog,
  Heading,
} from '@radix-ui/themes';
import { MagnifyingGlassIcon, DotsHorizontalIcon } from '@radix-ui/react-icons';
import { Header } from '../components/shared/layout/header';
import { useNavigate } from 'react-router';
import { formatDistanceToNow } from 'date-fns';

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
  const { supabaseClient } = createSupabaseServerClient(request);

  console.log('Request method:', request.method);

  if (request.method === 'POST') {
    const formData = await request.formData();
    if (!formData.has('workflow')) {
      return new Response('No workflow data found', { status: 400 });
    }
    const workflow = JSON.parse(formData.get('workflow') as string);

    // Save the workflow to the database

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
  }
  if (request.method === 'DELETE') {
    // Delete the workflow

    const formData = await request.formData();
    if (!formData.has('workflowId')) {
      return new Response('No workflow ID found', { status: 400 });
    }
    const workflowId = formData.get('workflowId') as string;
    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .delete()
      .eq('id', workflowId);

    if (error) {
      console.error('Error deleting workflow:', error);
      return new Response('Failed to delete workflow', { status: 500 });
    }

    return Response.json({
      success: true,
      message: 'Workflow deleted successfully',
      workflow: data,
    });
  }
};

export default function Workflows() {
  const { workflows }: { workflows: WorkflowTemplate[] } =
    useLoaderData<typeof loader>();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [isDeleting, setIsDeleting] = React.useState<{
    open: boolean;
    workflowId: string | null;
  }>({
    open: false,
    workflowId: null,
  });

  const handleCreateWorkflow = () => {
    const formData = new FormData();
    formData.append(
      'workflow',
      JSON.stringify({
        name: 'New workflow',
        description: 'A new workflow',
        config: {},
        nodes: [],
        edges: [],
        viewport: {
          zoom: 1,
          position: { x: 0, y: 0 },
        },
      })
    );
    console.log('Form data:', formData);
    fetcher.submit(formData, {
      method: 'post',
      action: '/admin/workflows',
    });
  };

  const handleDeleteWorkflow = (workflowId: string) => {
    const formData = new FormData();
    formData.append('workflowId', workflowId);
    fetcher.submit(formData, {
      method: 'delete',
      action: '/admin/workflows',
    });
  };

  return (
    <>
      <Flex gap={'4'} direction={'column'}>
        <Header
          title={'Workflows'}
          quickActions={[
            {
              label: 'Create new workflow',
              action: () => handleCreateWorkflow(),
              variant: 'solid',
              color: 'green',
              size: '2',
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
        <Flex direction={'column'} gap={'4'} px={'6'}>
          {workflows.map((workflow) => (
            <Card
              key={workflow.id}
              onClick={() => {
                navigate(`/admin/workflows/${workflow.id}`);
              }}
              style={{
                cursor: 'pointer',
              }}
            >
              <Grid columns={'1fr 1fr'} gap={'4'} p={'4'} align={'center'}>
                <Grid columns={'1'} gap={'2'}>
                  <Flex align={'end'} gap={'2'}>
                    <Heading size={'3'}>{workflow.name}</Heading>
                    <Text size={'1'} color={'gray'}>
                      Edited{' '}
                      {formatDistanceToNow(new Date(workflow.updated_at), {
                        addSuffix: true,
                      })}
                    </Text>
                  </Flex>
                  <Text size={'2'} weight={'light'} color={'gray'}>
                    {workflow.description}
                  </Text>
                </Grid>
                <Flex justify={'end'} align={'center'}>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button variant="soft">
                        <DotsHorizontalIcon />
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item
                        shortcut="⌘ ⌫"
                        color="red"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsDeleting({
                            open: true,
                            workflowId: workflow.id,
                          });
                        }}
                      >
                        Delete
                      </DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Flex>
              </Grid>
            </Card>
          ))}
        </Flex>
      </Flex>

      <AlertDialog.Root
        open={isDeleting.open}
        onOpenChange={() =>
          setIsDeleting({
            open: false,
            workflowId: null,
          })
        }
      >
        <AlertDialog.Content maxWidth="450px">
          <AlertDialog.Title>Delete workflow</AlertDialog.Title>
          <AlertDialog.Description size="2">
            Are you sure you want to delete this workflow? This action cannot be
            undone.
          </AlertDialog.Description>

          <Flex gap="3" mt="4" justify="end">
            <AlertDialog.Cancel>
              <Button
                variant="soft"
                color="gray"
                onClick={() =>
                  setIsDeleting({
                    open: false,
                    workflowId: null,
                  })
                }
              >
                Cancel
              </Button>
            </AlertDialog.Cancel>
            <AlertDialog.Action>
              <Button
                variant="solid"
                color="red"
                onClick={() => {
                  handleDeleteWorkflow(isDeleting.workflowId as string);
                  setIsDeleting({
                    open: false,
                    workflowId: null,
                  });
                }}
              >
                Delete
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </>
  );
}
