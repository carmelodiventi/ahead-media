import React, { useEffect } from 'react';
import { useFetcher, useLoaderData } from '@remix-run/react';
import { redirect } from '@remix-run/node';
import {
  AlertDialog,
  Button,
  DropdownMenu,
  Flex,
  IconButton,
} from '@radix-ui/themes';
import {
  ClockIcon,
  DotsHorizontalIcon,
  DownloadIcon,
  Link1Icon,
  MagnifyingGlassIcon,
  PlayIcon,
  Share1Icon,
} from '@radix-ui/react-icons';
import { toast, toast as notify } from 'sonner';
import { DocumentTypes } from '../types/Document.types';
import { Header } from '../components/shared/layout/header';
import { PostgrestError } from '@supabase/supabase-js';
import RichTextEditor from '../components/documents/richtext-editor/RichTextEditor';
import supabase from '../utils/supabase';
import documentStore from '../store/documentStore';
import { useStore } from 'zustand';
import { emitter } from '../utils/emitter.server';

export const meta = ({ data }: { data: { document: DocumentTypes } }) => {
  return [
    { title: `Document ${data?.document?.metadata?.name ?? 'Untitled'}` },
    { name: 'description', content: 'Welcome to Remix!' },
  ];
};

export async function loader({ params }: { params: { id: string } }) {
  const {
    error,
    data: document,
  }: {
    error: PostgrestError | null;
    data: DocumentTypes | null;
  } = await supabase.from('documents').select('*').eq('id', params.id).single();

  if (error || !document || !document.metadata) {
    return redirect('/app/documents');
  }


  return {
    document,
    env: process.env,
  };
}

export async function action({
  request,
  params,
}: {
  request: Request;
  params: { id: string };
}) {
  const formData = await request.formData();
  const { id } = params;

  if (!id) {
    return {
      error: 'No document id provided',
      success: false,
    };
  }

  const { data: item, error: itemError } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .single();

  if (itemError) {
    return {
      error: itemError.message,
      success: false,
    };
  }

  switch (request.method) {
    case 'DELETE': {
      const redirectUrl = formData.get('redirectUrl');

      const { data, error } = await supabase
        .from('documents')
        .delete()
        .eq('id', id)
        .single();

      if (error) {
        return {
          error: error.message,
          success: false,
        };
      }

      if (redirectUrl) {
        return redirect((redirectUrl as string) || '/documents');
      }

      return {
        data,
        success: true,
        error: null,
      };
    }
    case 'POST': {
      const activeTab = Number(formData.get('tab')) || 0;
      const documentData = {
        text: item.text ? [...item.text] : [],
        metadata: {
          name: item.metadata?.name ?? 'Untitled',
          ...item.metadata,
        },
      };

      if (formData.get('html')) {
        documentData.text[activeTab] = {
          ...documentData.text[activeTab],
          html: formData.get('html') as string,
        };
      }

      if (formData.get('name')) {
        documentData.text[activeTab] = {
          ...documentData.text[activeTab],
          title: formData.get('name') as string,
        };
        documentData.metadata.name = formData.get('name') as string;
      }

      if (formData.get('tabName')) {
        documentData.text[activeTab] = {
          ...documentData.text[activeTab],
          name: formData.get('tabName') as string,
        };
      }

      const { data, error } = await supabase
        .from('documents')
        .update({
          lastedited: Date.now(),
          ...documentData,
        })
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        return {
          document: null,
          error: error.message,
          success: false,
        };
      }

      return {
        document: data,
        success: true,
        error: null,
      };
    }
    default:
      return {
        error: 'Invalid request method',
        success: false,
      };
  }
}

const DocumentPreview = () => {
  const { document, env } = useLoaderData<typeof loader>();
  const store = useStore(documentStore);
  const fetcher = useFetcher<typeof action>();
  const [isDeleting, setIsDeleting] = React.useState<{
    documentId: string | null;
  }>({
    documentId: null,
  });

  const handleCopyLink = () => {
    // copy to clipboard
    navigator.clipboard.writeText(
      `${env.APP_URL}/app/documents/${document?.id}`
    );
    notify('Link copied to clipboard');
  };

  const handleDelete = async (documentId: string) => {
    const formData = new FormData();
    formData.append('id', documentId);
    formData.append('redirectUrl', '/app/documents');
    fetcher.submit(formData, {
      method: 'delete',
      action: `/app/documents/${documentId}`,
    });
    setIsDeleting({ documentId: null });
  };

  useEffect(() => {
    if (fetcher.data?.success) {
      toast.error('Document deleted successfully');
    }
    if (fetcher.data?.error) {
      toast.error(fetcher.data.error);
    }
  }, [fetcher.data]);

  const handleGenerate = (documentId: string) => {
    const formData = new FormData();
    formData.append('id', documentId);
    fetcher.submit(formData, {
      method: 'post',
      action: `/app/ai/template-workflow`,
    });
  };

  return (
    <Flex>
      <Flex direction={'column'} flexGrow={'1'} position="relative">
        <Header
          title={document?.metadata?.name ?? 'Untitled'}
          edited={document?.lastedited}
          quickActions={[
            {
              component: (
                <DropdownMenu.Root>
                  <DropdownMenu.Trigger>
                    <IconButton variant="ghost" color="gray" highContrast>
                      <DotsHorizontalIcon />
                    </IconButton>
                  </DropdownMenu.Trigger>
                  <DropdownMenu.Content>
                    <DropdownMenu.Item shortcut="⌘ C" onClick={handleCopyLink}>
                      {' '}
                      <Link1Icon /> Copy document link
                    </DropdownMenu.Item>
                    <DropdownMenu.Item shortcut="⌘ I">
                      {' '}
                      <ClockIcon /> Document history
                    </DropdownMenu.Item>
                    <DropdownMenu.Separator />

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger>
                        {' '}
                        <DownloadIcon /> Export
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent>
                        <DropdownMenu.Item>HTML</DropdownMenu.Item>
                        <DropdownMenu.Item>PDF</DropdownMenu.Item>
                        <DropdownMenu.Item>Markdown</DropdownMenu.Item>
                        <DropdownMenu.Item>Text</DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger>
                        {' '}
                        <Share1Icon /> Share
                      </DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent>
                        <DropdownMenu.Item>Editable link</DropdownMenu.Item>
                        <DropdownMenu.Item>Public link</DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                    <DropdownMenu.Separator />
                    <DropdownMenu.Item
                      shortcut="⌘ ⌫"
                      color="red"
                      onClick={() =>
                        setIsDeleting({ documentId: document?.id as string })
                      }
                    >
                      Delete
                    </DropdownMenu.Item>
                  </DropdownMenu.Content>
                </DropdownMenu.Root>
              ),
            },
          ]}
          actions={[
            {
              icon: <MagnifyingGlassIcon />,
              label: 'Research',
              action: () => store.onIsResearching(true),
            },
            {
              icon: <PlayIcon />,
              label: 'Start generating',
              action: () => handleGenerate(document.id),
            },
          ]}
        />

        <RichTextEditor document={document as DocumentTypes} />
      </Flex>
      <AlertDialog.Root open={Boolean(isDeleting.documentId)}>
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
                    documentId: null,
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
                onClick={() => handleDelete(isDeleting.documentId as string)}
              >
                Delete document
              </Button>
            </AlertDialog.Action>
          </Flex>
        </AlertDialog.Content>
      </AlertDialog.Root>
    </Flex>
  );
};

export default DocumentPreview;
