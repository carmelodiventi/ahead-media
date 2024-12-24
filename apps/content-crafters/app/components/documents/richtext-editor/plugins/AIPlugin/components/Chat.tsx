import { ForwardedRef, forwardRef, useEffect, useImperativeHandle, useRef } from 'react'
import { Flex, IconButton, Reset, Spinner } from '@radix-ui/themes'
import { useFetcher, useParams } from '@remix-run/react'
import { PaperPlaneIcon } from '@radix-ui/react-icons'
import { toast } from 'sonner'
import { LexicalEditor } from 'lexical'
import { $generateHtmlFromNodes } from '@lexical/html'
import './Chat.style.css'
import {useAIState} from "../context/AIContext";
import {action} from "../../../../../../routes/app.ai.knowledge-base.retrieve";

const Chat = forwardRef(
    (
        {
            editor,
            onSubmit,
        }: {
            editor: LexicalEditor
            onSubmit: (content: string) => void
        },
        forwardedRef: ForwardedRef<HTMLTextAreaElement>
    ) => {
        const ref = useRef<HTMLTextAreaElement | null>(null)
        const { aiState, updateAIState } = useAIState()
        const fetcher = useFetcher<typeof action>()
        const { id } = useParams()

        useEffect(() => {
            if (fetcher.data && 'result' in fetcher.data) {
                onSubmit(fetcher.data.result as string)
            }
            if (fetcher.data && 'error' in fetcher.data) {
                toast.error(fetcher.data.error)
            }
        }, [fetcher.data])

        const adjustTextareaHeight = () => {
            const textarea = ref.current
            if (textarea) {
                textarea.style.height = '21px' // Reset height to calculate scrollHeight
                textarea.style.height = `${textarea.scrollHeight}px` // Set height based on content
            }
        }

        const handleInput = () => {
            adjustTextareaHeight()
        }

        const handleSubmit = (query: string) => {
            const formData = new FormData()
            editor.read(() => {
                formData.append('content', $generateHtmlFromNodes(editor))
            })
            formData.append('query', query)
            formData.append('indexname', 'content-crafters')
            formData.append('namespace', id as string)
            fetcher.submit(formData, {
                method: 'post',
                action: '/app/ai/knowledge-base/retrieve',
            })
        }

        useImperativeHandle(forwardedRef, () => ref.current as HTMLTextAreaElement)

        useEffect(() => {
            adjustTextareaHeight()
        }, [])

        return (
            <Flex
                className="ChatBox"
                aria-label="AI Assistant Chat"
            >
                <svg
                    stroke="currentColor"
                    fill="none"
                    strokeWidth="2"
                    viewBox="0 0 21 21"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="ChatBoxIcon"
                    height="21px"
                    width="21px"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M16 18a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm0 -12a2 2 0 0 1 2 2a2 2 0 0 1 2 -2a2 2 0 0 1 -2 -2a2 2 0 0 1 -2 2zm-7 12a6 6 0 0 1 6 -6a6 6 0 0 1 -6 -6a6 6 0 0 1 -6 6a6 6 0 0 1 6 6z"></path>
                </svg>

                {fetcher.state === 'submitting' ? (
                    <Flex align="center" justify={"center"} gapX={"3"} p={"1"}>
                        <p className="ChatBoxText">Thinking...</p>
                        <Spinner className="ChatBoxSpinner" />
                    </Flex>
                ) : (
                    <Flex gapX={'4'} align="center" width={'100%'}>
                        <Reset>
                            <textarea
                                ref={ref}
                                placeholder="Ask AI to help writing..."
                                maxLength={2000}
                                rows={1}
                                onInput={handleInput}
                                defaultValue={aiState.query}
                                onChange={(e) => updateAIState({ ...aiState, query: e.target.value })}
                                className="ChatBoxTextArea"
                            />
                        </Reset>
                        <IconButton
                            onClick={() => handleSubmit(aiState.query)}
                            type="button"
                            variant="ghost"
                            aria-label="Send"
                            className="inline-flex items-center focus:ring-none gap-0 overflow-hidden font-medium transition focus:outline-none focus:ring-none rounded-md h-5 w-5 min-w-5 min-h-5 align-middle p-1 bg-transparent hover:bg-slate-100 text-current z-10 text-lg disabled:cursor-not-allowed"
                        >
                            <PaperPlaneIcon className="h-4 w-4 text-slate-400" />
                        </IconButton>
                    </Flex>
                )}
            </Flex>
        )
    }
)

Chat.displayName = 'Chat'

export default Chat
