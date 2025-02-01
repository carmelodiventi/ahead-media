import React, { useEffect, useRef } from 'react';
import { Text } from '@radix-ui/themes';

const PromptEditor = ({
  placeholder,
  onChange,
  name,
}: {
  placeholder?: string | null;
  onChange: (name: string, value: string) => void;
  name: string;
}) => {
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || '';
    onChange(name, newValue); // Pass the updated value to the parent
  };

  const handleFocus = () => {
    if (editorRef.current) {
      const selection = window.getSelection();
      if (selection) {
        const range = document.createRange();
        range.selectNodeContents(editorRef.current);
        range.collapse(false); // Place cursor at the end of the content
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  };

  // Focus on the editor when it mounts
  useEffect(() => {
    if (editorRef.current) {
      editorRef.current.focus();
    }
  }, []);

  return (
    <Text
      ref={editorRef}
      contentEditable="true"
      suppressContentEditableWarning={true}
      className={'PromptEditor-UserInput-PromptTemplate'}
      style={{
        minWidth: "100px",
        outline: 'none',
        color: 'var(--gray-a8)',
        whiteSpace: 'pre-wrap', // Ensures proper line wrapping
      }}
      data-placeholder={placeholder}
      onInput={handleInput}
      onFocus={handleFocus}
    ></Text>
  );
};

export default PromptEditor;
