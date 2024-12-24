import {
  $getSelection,
  $isRangeSelection,
  $isRootOrShadowRoot,
  ElementNode,
  LexicalEditor,
  TextNode,
} from "lexical";
import { $isHeadingNode } from "@lexical/rich-text";
import { $isListNode } from "@lexical/list";
import {blockTypeToBlockName} from "../context/ToolbarContext";

export function getSelectedBlockType(
  editor: LexicalEditor
): keyof typeof blockTypeToBlockName {
  let blockType: keyof typeof blockTypeToBlockName = "paragraph"; // Default block type

  editor.getEditorState().read(() => {
    const selection = $getSelection();

    if (!$isRangeSelection(selection)) {
      return;
    }

    let element: TextNode | ElementNode | null = selection.anchor.getNode();

    // Traverse up the hierarchy to find the block type
    while (element != null && !$isRootOrShadowRoot(element)) {
      if ($isHeadingNode(element)) {
        blockType = element.getTag() as keyof typeof blockTypeToBlockName;
        break;
      }
      if($isListNode(element)) {
        blockType = element.getTag() as keyof typeof blockTypeToBlockName;
        break;
      }
      element = element.getParent();
    }
  });

  return blockType;
}
