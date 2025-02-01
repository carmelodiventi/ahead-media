import { ActionFunctionArgs, MetaFunction, redirect } from '@remix-run/node';
import {
  AlertDialog,
  Box,
  Button,
  DropdownMenu,
  Flex,
  IconButton,
  Link as NavLink,
} from '@radix-ui/themes';
import { useMemo, useState } from 'react';
import {
  AccessorKeyColumnDef,
  createColumnHelper,
} from '@tanstack/react-table';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { formatDistanceToNow } from 'date-fns';
import {
  DividerHorizontalIcon,
  DotsHorizontalIcon,
  TrashIcon,
} from '@radix-ui/react-icons';
import { z } from 'zod';
import { useNavigate } from 'react-router';
import {DocumentStatus, DocumentTypes} from '../types/Document.types';
import { createSupabaseServerClient } from '../utils/supabase.server';
import supabase from '../utils/supabase';
import DataTable from '../components/shared/datatable/DataTable';
import { Header } from '../components/shared/layout/header';
import { PostgrestError } from '@supabase/supabase-js';
import { WorkflowTemplate } from '../types/Workflow.types';

export const meta: MetaFunction = () => {
  return [
    { title: 'Documents' },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export const loader = async () => {
  const { data: documents, error } = await supabase
    .from('documents')
    .select(
      'id, query, lastedited, metadata, doc_type, doc_status_desc, doc_owner_name:profiles(first_name, last_name)'
    );

  if (error) {
    return Response.json({
      error: error.message,
      documents: [],
    });
  }

  return Response.json({
    documents,
  });
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const formData = await request.formData();
    const templateId = formData.get('templateId');
    const initialInputs = formData.get('initialInputs');
    const country = formData.get('country');
    const language = formData.get('language');

    const { error: formError } = z
      .object({
        country: z.string().includes(':'),
        language: z.string().includes(':'),
        templateId: z.string(),
        initialInputs: z.string(),
      })
      .safeParse({
        country: country as string,
        language: language as string,
        templateId: templateId as string,
        initialInputs: initialInputs,
      });

    if (formError) {
      return Response.json(
        {
          error: formError.errors.map((error) => error.message).join(', '),
          success: false,
        },
        { status: 400 }
      );
    }

    const [code, display_code] = (country as string).split(':');
    const [lang_code, lang_display] = (language as string).split(':');

    const { supabaseClient } = createSupabaseServerClient(request);

    const {
      data: template,
      error: errorWorkflow,
    }: {
      data: WorkflowTemplate | null;
      error: PostgrestError | null;
    } = await supabaseClient
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (errorWorkflow) {
      return Response.json(
        { error: errorWorkflow.message, success: false },
        { status: 400 }
      );
    }

    if (!template) {
      return Response.json(
        { error: 'Template not found', success: false },
        { status: 404 }
      );
    }

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();

    const {
      data: document,
      error: errorDocument,
    }: {
      data: DocumentTypes | null;
      error: PostgrestError | null;
    } = await supabaseClient
      .from('documents')
      .insert({
        doc_type: formData.get('doc_type') as string,
        doc_owner: user?.id,
        doc_owner_name: user?.user_metadata.full_name,
        metadata: {
          name: `${template.template_prompt} ${template.query_prompt}`,
          active_tab_index: 0,
          code,
          display_code,
          lang_code,
          lang_display,
          last_editor_id: user?.id,
          last_editor_name: user?.user_metadata.full_name,
          outline: [],
          initial_inputs: JSON.parse(initialInputs as string),
          serp_loaded: false,
        },
        text: [
          {
            html: '',
            title: 'Untitled',
            name: 'Tab 1',
          },
        ],
        template: template.id,
        admin: user?.role === 'admin',
        created_by: user?.id,
        lastedited: Date.now(),
        doc_status: DocumentStatus.Draft,
      })
      .select('*')
      .single();

    if (errorDocument) {
      return Response.json(
        { error: errorDocument.message, success: false },
        { status: 400 }
      );
    }

    if (!document) {
      return Response.json(
        { error: 'Document not found', success: false },
        { status: 404 }
      );
    }

    return redirect(`/app/documents/${document.id}`);
  } catch (error) {
    return new Response((error as Error).message, { status: 400 });
  }
};

const quickActions = [
  {
    label: 'Create Document',
    href: '/app/documents/new',
  },
];

export default function Documents() {
  const [isDeleting, setIsDeleting] = useState<{
    item: string | null;
  }>({
    item: null,
  });
  const navigate = useNavigate();
  const fetcher = useFetcher();
  const columnHelper = createColumnHelper<DocumentTypes>();

  const handleDelete = async (id: string) => {
    const formData = new FormData();
    formData.append('id', id);
    fetcher.submit(formData, {
      method: 'delete',
      action: `/app/documents/${id}`,
    });
    setIsDeleting({ item: null });
  };

  // @ts-ignore
  const columns: AccessorKeyColumnDef<DocumentTypes, string>[] = useMemo(
    () => [
      columnHelper.accessor('metadata.name', {
        header: () => 'Title',
        cell: (info) => (
          <NavLink
            color="gray"
            href={`/app/documents/${info.row.original.id}`}
            onClick={(e) => {
              e.preventDefault();
              navigate(`/app/documents/${info.row.original.id}`);
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
      columnHelper.accessor('doc_owner_name', {
        header: () => 'Owner',
        cell: (info) =>
          info.renderValue() ? (
            `${info.renderValue()?.first_name} ${info.renderValue()?.last_name}`
          ) : (
            <DividerHorizontalIcon />
          ),
      }),
      columnHelper.accessor('query', {
        header: () => 'Search Query',
        cell: (info) =>
          info.renderValue() ? info.renderValue() : <DividerHorizontalIcon />,
      }),
      columnHelper.accessor('lastedited', {
        header: () => 'Edited',
        cell: (info) =>
          formatDistanceToNow(new Date(Number(info.renderValue())), {
            addSuffix: true,
          }),
      }),
      columnHelper.accessor('id', {
        header: () => '',
        cell: (info) => (
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" color="gray" highContrast>
                <DotsHorizontalIcon />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item
                onClick={() => setIsDeleting({ item: info.row.original.id })}
              >
                <TrashIcon /> Delete document
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        ),
      }),
    ],
    [columnHelper, navigate]
  );
  // @ts-ignore
  const { documents }: { documents: DocumentTypes[] } =
    useLoaderData<typeof loader>();

  return (
    <Flex direction="column">
      <Header title="All documents" quickActions={quickActions} />
      <Box height={'100%'}>
        <DataTable<DocumentTypes>
          columns={columns}
          data={documents}
          loading={false}
        />
        <AlertDialog.Root open={Boolean(isDeleting.item)}>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Delete document</AlertDialog.Title>
            <AlertDialog.Description size="2">
              Are you sure? This document will no longer be accessible
            </AlertDialog.Description>

            <Flex gap="3" mt="4" justify="end">
              <AlertDialog.Cancel>
                <Button
                  variant="soft"
                  color="gray"
                  onClick={() =>
                    setIsDeleting({
                      item: null,
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
                  onClick={() => handleDelete(isDeleting.item as string)}
                >
                  Delete document
                </Button>
              </AlertDialog.Action>
            </Flex>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Box>
    </Flex>
  );
}
