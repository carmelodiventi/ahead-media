import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { AIContext } from './context/AIContext';
import AIChat from './AIChat';
import AIStreamer from './AIStreamer';

import { DocumentTypes } from '../../../../../types/Document.types';

const AIPlugin: React.FC<{
  document: DocumentTypes;
}> = ({ document }) => {
  const [editor] = useLexicalComposerContext();
  return (
    <AIContext>
      <AIStreamer document={document} />
      <AIChat editor={editor} />
    </AIContext>
  );
};

export default AIPlugin;
