import { useCallback, useEffect, useRef } from 'react'
import {
    $getRoot,
    $getSelection,
    $getTextContent,
    $insertNodes,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    KEY_DOWN_COMMAND,
    LexicalEditor,
} from 'lexical'
import { $generateNodesFromDOM } from '@lexical/html'
import { Flex } from '@radix-ui/themes'
import {useAIState} from "./context/AIContext";
import Chat from "./components/Chat";

const AIPlugin = ({ editor }: { editor: LexicalEditor }) => {
    const { aiState, updateAIState } = useAIState()
    const aiAssistantChatRef = useRef<HTMLDivElement | null>(null)
    const aiAssistantChatTextRef = useRef<HTMLTextAreaElement | null>(null)

    const handleSpaceBar = useCallback(() => {
        return editor.getEditorState().read(() => {
            const selection = $getSelection()
            if ($isRangeSelection(selection) && selection.isCollapsed()) {
                const anchorNode = selection.anchor.getNode()
                if (anchorNode.getTextContent().trim() === '' && anchorNode.getType() === 'paragraph') {
                    if (aiAssistantChatRef.current) {
                        aiAssistantChatTextRef.current?.focus()
                        updateAIState({ ...aiState, showAIAssistant: true })
                    }
                    return true
                }
            }
            return false
        })
    }, [aiState, editor, updateAIState])

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (aiAssistantChatRef.current && !aiAssistantChatRef.current.contains(event.target as Node)) {
                updateAIState({ ...aiState, showAIAssistant: false })
            }
        }

        const handleEscapeKey = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                updateAIState({ ...aiState, showAIAssistant: false })
            }
        }

        document.addEventListener('mousedown', handleClickOutside)
        document.addEventListener('keydown', handleEscapeKey)

        return () => {
            document.removeEventListener('mousedown', handleClickOutside)
            document.removeEventListener('keydown', handleEscapeKey)
        }
    }, [aiState, updateAIState])

    useEffect(() => {
        const removeListener = editor.registerCommand(
            KEY_DOWN_COMMAND,
            (event: KeyboardEvent) => {
                if (event.key === ' ') {
                    if (handleSpaceBar()) event.preventDefault()
                }
                return true
            },
            COMMAND_PRIORITY_LOW
        )

        return () => {
            removeListener()
        }
    }, [editor, handleSpaceBar])

    const getTextContent = () =>
        useCallback(() => {
            let textContent = ''
            editor.update(() => {
                textContent = $getTextContent()
            })
            return textContent
        }, [])

    const handleAIAssistantResponse = useCallback(
        async (response: string) => {
            editor.update(() => {
                // In the browser you can use the native DOMParser API to parse the HTML string.
                const parser = new DOMParser()
                const dom = parser.parseFromString(response, 'text/html')

                // Once you have the DOM instance it's easy to generate LexicalNodes.
                const nodes = $generateNodesFromDOM(editor, dom)

                // Select the root
                $getRoot().select()

                // Insert them at a selection.
                $insertNodes(nodes)
            })
        },
        [editor]
    )

    return (
        <Flex
            position="sticky"
            left="0"
            right="0"
            bottom="0"
            p="4"
            style={{
                transition: 'opacity 0.2s',
                backgroundColor: 'var(--gray-1)',
            }}
            direction="row"
            width="auto"
            gap="4"
            align="center"
            ref={aiAssistantChatRef}
        >
            <Chat editor={editor} ref={aiAssistantChatTextRef} onSubmit={handleAIAssistantResponse} />
        </Flex>
    )
}

export default AIPlugin
