import './ToolbarPlugin.style.css'
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { $findMatchingParent, mergeRegister } from '@lexical/utils'
import {
    $getSelection,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    FORMAT_ELEMENT_COMMAND,
    FORMAT_TEXT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical'
import { Separator, ToggleGroup, ToggleItem, Toolbar } from '@radix-ui/react-toolbar'
import {
    ArrowLeftIcon,
    ArrowRightIcon,
    FontBoldIcon,
    FontItalicIcon,
    Link1Icon,
    StrikethroughIcon,
    TextAlignCenterIcon,
    TextAlignJustifyIcon,
    TextAlignLeftIcon,
    TextAlignRightIcon,
    UnderlineIcon,
} from '@radix-ui/react-icons'
import { $isLinkNode, TOGGLE_LINK_COMMAND } from '@lexical/link'
import { getSelectedBlockType } from './utils/getSelectedBlockType'
import {useToolbarState} from "./context/ToolbarContext";
import BlockFormatDropDown from "./components/BlockFormatDropDown";
import {getSelectedNode} from "../../utils/getSelectedNode";

const LowPriority = 1

export default function ToolbarPlugin({ setIsLinkEditMode }: { setIsLinkEditMode: Dispatch<boolean> }) {
    const [editor] = useLexicalComposerContext()

    const toolbarRef = useRef(null)
    const { toolbarState, updateToolbarState } = useToolbarState()
    const [canUndo, setCanUndo] = useState(false)
    const [canRedo, setCanRedo] = useState(false)

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection()
        if ($isRangeSelection(selection)) {
            // Update text format
            updateToolbarState('isBold', selection.hasFormat('bold'))
            updateToolbarState('isItalic', selection.hasFormat('italic'))
            updateToolbarState('isUnderline', selection.hasFormat('underline'))
            updateToolbarState('isStrikethrough', selection.hasFormat('strikethrough'))
            updateToolbarState('isCode', selection.hasFormat('code'))

            const anchorNode = selection.anchor.getNode()
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                          const parent = e.getParent()
                          return parent !== null && $isRootOrShadowRoot(parent)
                      })

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow()
            }

            const elementKey = element.getKey()
            const elementDOM = editor.getElementByKey(elementKey)

            // Update link
            const node = getSelectedNode(selection)
            const parent = node.getParent()
            const isLink = $isLinkNode(parent) || $isLinkNode(node)
            updateToolbarState('isLink', isLink)
        }
    }, [updateToolbarState])

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar()
                })
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                (_payload, _newEditor) => {
                    $updateToolbar()
                    return false
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload)
                    return false
                },
                LowPriority
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload)
                    return false
                },
                LowPriority
            )
        )
    }, [editor, $updateToolbar])

    useEffect(() => {
        return editor.registerCommand(
            SELECTION_CHANGE_COMMAND,
            () => {
                const blockType = getSelectedBlockType(editor)
                updateToolbarState('blockType', blockType) // Update the context
                return false
            },
            LowPriority
        )
    }, [editor, updateToolbarState])

    const insertLink = useCallback(() => {
        if (!toolbarState.isLink) {
            setIsLinkEditMode(true)
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, '')
        } else {
            setIsLinkEditMode(false)
            editor.dispatchCommand(TOGGLE_LINK_COMMAND, null)
        }
    }, [editor, setIsLinkEditMode, toolbarState.isLink])

    return (
        <>
            <Toolbar className="ToolbarRoot" aria-label="Formatting options" ref={toolbarRef}>
                <ToggleGroup type="multiple" aria-label="State operation">
                    <ToggleItem
                        className="ToolbarToggleItem"
                        disabled={!canUndo}
                        value={'undo'}
                        onClick={() => {
                            editor.dispatchCommand(UNDO_COMMAND, undefined)
                        }}
                        aria-label="Undo"
                    >
                        <ArrowLeftIcon />
                    </ToggleItem>
                    <ToggleItem
                        disabled={!canRedo}
                        onClick={() => {
                            editor.dispatchCommand(REDO_COMMAND, undefined)
                        }}
                        value={'redo'}
                        className="ToolbarToggleItem"
                        aria-label="Redo"
                    >
                        <ArrowRightIcon />
                    </ToggleItem>
                </ToggleGroup>
                <Separator className="ToolbarSeparator" />
                <ToggleGroup type="multiple" aria-label="Text format">
                    <BlockFormatDropDown
                        editor={editor}
                        blockType={toolbarState.blockType}
                        rootType={toolbarState.rootType}
                    />
                </ToggleGroup>
                <Separator className="ToolbarSeparator" />
                <ToggleGroup type="multiple" aria-label="Text format">
                    <ToggleItem
                        value={'bold'}
                        onClick={(e) => {
                            e.preventDefault()
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')
                        }}
                        className={'ToolbarToggleItem ' + (toolbarState.isBold ? 'ToolbarToggleItem-Active' : '')}
                        aria-label="Format Bold"
                    >
                        <FontBoldIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'italic'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')
                        }}
                        className={'ToolbarToggleItem ' + (toolbarState.isItalic ? 'ToolbarToggleItem-Active' : '')}
                        aria-label="Format Italics"
                    >
                        <FontItalicIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'underline'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')
                        }}
                        className={'ToolbarToggleItem ' + (toolbarState.isUnderline ? 'ToolbarToggleItem-Active' : '')}
                        aria-label="Format Underline"
                    >
                        <i className="format underline" />
                        <UnderlineIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'strikethrough'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')
                        }}
                        className={
                            'ToolbarToggleItem ' + (toolbarState.isStrikethrough ? 'ToolbarToggleItem-Active' : '')
                        }
                        aria-label="Format Strikethrough"
                    >
                        <StrikethroughIcon />
                    </ToggleItem>
                </ToggleGroup>

                <Separator className="ToolbarSeparator" />

                <ToggleGroup type="multiple" aria-label="Text format">
                    <ToggleItem
                        value={'link'}
                        onClick={insertLink}
                        className={'ToolbarToggleItem ' + (toolbarState.isLink ? 'ToolbarToggleItem-Active' : '')}
                        aria-label="Format Link"
                    >
                        <Link1Icon />
                    </ToggleItem>
                </ToggleGroup>

                <Separator className="ToolbarSeparator" />

                <ToggleGroup type="multiple" aria-label="Element format">
                    <ToggleItem
                        value={'left'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')
                        }}
                        className="ToolbarToggleItem"
                        aria-label="Left Align"
                    >
                        <TextAlignLeftIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'center'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')
                        }}
                        className="ToolbarToggleItem"
                        aria-label="Center Align"
                    >
                        <TextAlignCenterIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'right'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')
                        }}
                        className="ToolbarToggleItem"
                        aria-label="Right Align"
                    >
                        <TextAlignRightIcon />
                    </ToggleItem>
                    <ToggleItem
                        value={'justify'}
                        onClick={() => {
                            editor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')
                        }}
                        className="ToolbarToggleItem"
                        aria-label="Justify Align"
                    >
                        <TextAlignJustifyIcon />
                    </ToggleItem>
                </ToggleGroup>
            </Toolbar>
        </>
    )
}
