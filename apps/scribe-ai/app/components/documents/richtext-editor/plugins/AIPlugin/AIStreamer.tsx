import { useEffect } from 'react';
import { useResolvedPath, useRevalidator } from '@remix-run/react';
import { useEventSource } from 'remix-utils/sse/react';
import { DocumentTypes } from '../../../../../types/Document.types';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {$createParagraphNode, $insertNodes, TextNode} from 'lexical';
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

        if (data.status === 'processing') {
          updateAIState({
            ...aiState,
            isLoading: true,
            message: data.data.content,
          });
        } else if (data.status === 'generating') {
          updateAIState({
            ...aiState,
            isLoading: true,
          });

          editor.update(() => {
            const paragraphs = data.data.content.split('\n').filter(Boolean);
            const nodes = paragraphs.map(paragraph => {
              const paragraphNode = $createParagraphNode();
              const textNode = new TextNode(paragraph);
              paragraphNode.append(textNode);
              return paragraphNode;
            });
            $insertNodes(nodes);
          });
        }
      } catch (e) {
        console.error(e);
      }
    }
  }, [message, editor]);

  return null;
};

export default AIStreamer;
