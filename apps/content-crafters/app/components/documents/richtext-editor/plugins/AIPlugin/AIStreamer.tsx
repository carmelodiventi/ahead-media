import { useEffect } from 'react';
import { useResolvedPath, useRevalidator } from '@remix-run/react';
import { useEventSource } from 'remix-utils/sse/react';
import { DocumentTypes } from '../../../../../types/Document.types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $insertNodes } from 'lexical';
import { $generateNodesFromDOM } from '@lexical/html';
import { useAIState } from './context/AIContext';

const AIStreamer = ({ document }: { document: DocumentTypes }) => {
  const [editor] = useLexicalComposerContext();
  const { aiState, updateAIState } = useAIState();
  const path = useResolvedPath(
    `/app/documents/${document.id}/${document.template}/stream`
  );
  const message = useEventSource(path.pathname);
  const { revalidate } = useRevalidator();

  useEffect(() => {
    revalidate();
    if (message) {
      try {
        const { data } = JSON.parse(message);

        if (!data) return;

        if(data.status) {
          updateAIState({
            ...aiState,
            isLoading: data.status === 'processing',
          });
          return;
        }

        editor.update(() => {
          const parser = new DOMParser();
          const dom = parser.parseFromString(data, 'text/html');
          const nodes = $generateNodesFromDOM(editor, dom);
          $insertNodes(nodes);
        });
      } catch (e) {
        console.error(e);
      }
    }
  }, [message, editor]);

  return null;
};

export default AIStreamer;
