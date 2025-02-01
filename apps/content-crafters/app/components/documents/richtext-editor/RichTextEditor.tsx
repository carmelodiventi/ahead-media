import './RichTextEditor.styles.css';
import { Box, Button, Dialog, Flex, Grid } from '@radix-ui/themes';
import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { toast } from 'sonner';
import { HeadingNode } from '@lexical/rich-text';
import { ListItemNode, ListNode } from '@lexical/list';
import { AutoLinkNode, LinkNode } from '@lexical/link';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { $insertNodes, EditorState, LexicalEditor } from 'lexical';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { useFetcher, useResolvedPath, useRevalidator } from '@remix-run/react';
import { useEffect, useState } from 'react';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import { DocumentTypes } from '../../../types/Document.types';
import theme from './theme';
import useLiveSearchAI from '../../../hooks/useLiveSearchAI';
import { action } from '../../../routes/_app.app.documents_.$id';
import { debounce } from '../../../utils/debounce';
import { ToolbarContext } from './plugins/ToolbarPlugin/context/ToolbarContext';
import ToolbarPlugin from './plugins/ToolbarPlugin';
import TitlePlugin from './plugins/TitlePlugin';
import AIPlugin from './plugins/AIPlugin';
import LinkPlugin from './plugins/LinkPlugin';
import FloatingLinkEditorPlugin from './plugins/FloatingLinkEditorPlugin';
import ParagraphPlaceholderPlugin from './plugins/ParagraphPlaceholderPlugin';
import Panels from '../panels';
import AIStreamer from './plugins/StreamPlugin';
import { useStore } from 'zustand';
import documentStore from '../../../store/documentStore';

function RichTextEditor({ document }: { document: DocumentTypes }) {
  const initialConfig = {
    namespace: 'ContentCrafterEditor',
    theme,
    nodes: [HeadingNode, ListNode, ListItemNode, LinkNode, AutoLinkNode],
    onError: (error: Error) => {
      toast.error(error.message);
      console.error(error);
    },
    editorState: (editor: LexicalEditor) => {
      const parser = new DOMParser();
      const dom = parser.parseFromString(document.text[0].html, 'text/html');
      const nodes = $generateNodesFromDOM(editor, dom);
      $insertNodes(nodes);
    },
  };
  const store = useStore(documentStore);
  const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
  const { liveSearchResults, handleQuery } = useLiveSearchAI({
    id: document.id,
  });
  const [floatingAnchorElem, setFloatingAnchorElem] =
    useState<HTMLDivElement | null>(null);
  const fetcher = useFetcher<typeof action>();
  const [tab] = useState(0);
  const onRef = (_floatingAnchorElem: HTMLDivElement) => {
    if (_floatingAnchorElem !== null) {
      setFloatingAnchorElem(_floatingAnchorElem);
    }
  };
  const handleEditorChange = debounce(
    (editorState: EditorState, editor: LexicalEditor) => {
      editor.read(() => {
        const html = $generateHtmlFromNodes(editor);
        const formData = new FormData();

        formData.append('html', html);
        formData.append('tab', String(tab));
        formData.append('id', document.id);

        fetcher.submit(formData, {
          method: 'post',
          action: `/app/documents/${document.id}`,
        });
      });
    },
    300
  );

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <Grid columns={{ initial: '1', md: '2', lg: '6' }} gap={'5'}>
        <Box gridColumn={'1 / 5'}>
          <ToolbarContext>
            <ToolbarPlugin setIsLinkEditMode={setIsLinkEditMode} />
          </ToolbarContext>
          <TitlePlugin document={document} />
          <RichTextPlugin
            contentEditable={
              <div className="EditorScroller">
                <div className="Editor" ref={onRef}>
                  <ContentEditable ref={onRef} className={'RichTextEditor'} />
                </div>
              </div>
            }
            ErrorBoundary={LexicalErrorBoundary}
          />
          <AIPlugin document={document} />
          <HistoryPlugin />
          <AutoFocusPlugin />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin />
          {floatingAnchorElem && (
            <FloatingLinkEditorPlugin
              anchorElem={floatingAnchorElem}
              isLinkEditMode={isLinkEditMode}
              setIsLinkEditMode={setIsLinkEditMode}
            />
          )}
          <ParagraphPlaceholderPlugin
            placeholder={`Press "space" for AI or "/" for commands`}
            hideOnEmptyEditor
          />
          <OnChangePlugin onChange={handleEditorChange} />
        </Box>
        <Dialog.Root
          open={store.isResearching}
          onOpenChange={(open) => store.onIsResearching(open)}
        >
          <Dialog.Content align={"start"}>
            <Panels
              document={document}
              handleQuery={handleQuery}
              liveSearchResults={liveSearchResults}
            />
          </Dialog.Content>
        </Dialog.Root>
      </Grid>
    </LexicalComposer>
  );
}

export default RichTextEditor;
