import React, { ReactElement, useCallback, useRef } from 'react'
import * as DropdownMenu from '@radix-ui/react-dropdown-menu'
import { ChevronDownIcon } from '@radix-ui/react-icons'
import { LexicalEditor } from 'lexical'
import './BlockFormatDropDown.style.css'
import {formatBulletList, formatCheckList,
  formatCode,
  formatHeading,
  formatNumberedList,
  formatParagraph,
  formatQuote,} from "../../utils/format";
import {blockTypeToBlockName, useToolbarState} from "../../context/ToolbarContext";
import {classNames} from "../../../../../../../helpers/classNames";

const rootTypeToRootName = {
    root: 'Root',
    table: 'Table',
}

export default function BlockFormatDropDown({
    editor,
    blockType,
}: {
    editor: LexicalEditor
    blockType: keyof typeof blockTypeToBlockName
    rootType: keyof typeof rootTypeToRootName
}): ReactElement {
    const { updateToolbarState } = useToolbarState()
    const containerRef = useRef<HTMLDivElement>(null)

    const handleBlockTypeChange = useCallback(
        (type: keyof typeof blockTypeToBlockName) => {
            console.log('handleBlockTypeChange', type)
            editor.update(() => {
                switch (type) {
                    case 'paragraph':
                        formatParagraph(editor)
                        break
                    case 'h1':
                    case 'h2':
                    case 'h3':
                    case 'h4':
                        formatHeading(editor, blockType, type)
                        break
                    case 'ul':
                        formatBulletList(editor, blockType)
                        break
                    case 'ol':
                        formatNumberedList(editor, blockType)
                        break
                    case 'check':
                        formatCheckList(editor, blockType)
                        break
                    case 'quote':
                        formatQuote(editor, blockType)
                        break
                    case 'code':
                        formatCode(editor, blockType)
                        break
                    default:
                        console.warn(`Unsupported block type: ${type}`)
                }
            })
            updateToolbarState('blockType', type)
        },
        [editor, updateToolbarState, blockType]
    )

    return (
        <DropdownMenu.Root>
            <DropdownMenu.Trigger asChild>
                <button className='DropdownMenuButton'>
                    {blockTypeToBlockName[blockType]} <ChevronDownIcon />
                </button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal container={containerRef.current}>
                <DropdownMenu.Content className="DropdownMenuContent" sideOffset={5}>
                    {Object.entries(blockTypeToBlockName).map(([key, label]) => (
                        <DropdownMenu.Item
                            key={key}
                            className={classNames(
                                'DropdownMenuItem',
                                blockType === key ? 'DropdownMenuItem-active' : ''
                            )}
                            onSelect={() => {
                                handleBlockTypeChange(key as keyof typeof blockTypeToBlockName)
                            }}
                            {...(blockType === key ? { 'data-state': 'active' } : {})}
                        >
                            <span className="inline-flex gap-2">{label}</span>
                        </DropdownMenu.Item>
                    ))}
                </DropdownMenu.Content>
            </DropdownMenu.Portal>
        </DropdownMenu.Root>
    )
}
