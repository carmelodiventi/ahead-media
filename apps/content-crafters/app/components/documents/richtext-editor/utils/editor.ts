import { ElementNode, LexicalEditor, RangeSelection, TextNode } from "lexical";
import { $isAtNodeEnd, createDOMRange } from "@lexical/selection";

const VERTICAL_GAP = 10;
const HORIZONTAL_OFFSET = 5;

export function getDOMRangeRect(
  nativeSelection: Selection,
  rootElement: HTMLElement
): DOMRect {
  const domRange = nativeSelection.getRangeAt(0);

  let rect;

  if (nativeSelection.anchorNode === rootElement) {
    let inner = rootElement;
    while (inner.firstElementChild != null) {
      inner = inner.firstElementChild as HTMLElement;
    }
    rect = inner.getBoundingClientRect();
  } else {
    rect = domRange.getBoundingClientRect();
  }

  return rect;
}

/**
 * Set the position of the floating element based on the selection
 * @param floatingElem
 * @param selection
 * @param editor
 * @param verticalGap
 * @param horizontalOffset
 */

export function setFloatingElemPosition({
  floatingElem,
  selection,
  editor,
  verticalGap = VERTICAL_GAP,
  horizontalOffset = HORIZONTAL_OFFSET,
}: {
  floatingElem: HTMLElement;
  selection: RangeSelection;
  editor: LexicalEditor;
  verticalGap?: number;
  horizontalOffset?: number;
}): void {
  const anchor = selection.anchor;
  const focus = selection.focus;

  // Use createDOMRange to get the DOM range
  const range = createDOMRange(
    editor,
    anchor.getNode(),
    anchor.offset,
    focus.getNode(),
    focus.offset
  );

  if (!range) {
    return;
  }

  const targetRect = range.getBoundingClientRect();

  const position = {
    top: targetRect.bottom + window.scrollY + 5,
    left: targetRect.left + window.scrollX,
  };
  floatingElem.style.top = `${position.top}px`;
  floatingElem.style.left = `0px`;
}
