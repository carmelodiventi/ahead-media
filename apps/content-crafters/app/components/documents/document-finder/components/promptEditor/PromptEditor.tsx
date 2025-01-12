import React, { useEffect, useRef, useState } from "react";
import { Text } from "@radix-ui/themes";

const PromptEditor = ({
                        placeholder,
                        onChange,
                      }: {
  placeholder?: string | null;
  onChange: (value: string) => void;
}) => {
  const [value, setValue] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    const newValue = e.currentTarget.textContent || "";
    setValue(newValue);
    onChange(newValue); // Pass the updated value to the parent
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
      className={"PromptEditor-UserInput-PromptTemplate"}
      style={{
        outline: "none",
        color: "var(--gray-a8)",
        whiteSpace: "pre-wrap", // Ensures proper line wrapping
      }}
      data-placeholder={placeholder}
      onInput={handleInput}
      onFocus={handleFocus}
    >
    </Text>
  );
};

export default PromptEditor;
