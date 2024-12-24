import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import {AIContext} from "./context/AIContext";
import AIChat from "./AIChat";

const AIPlugin = () => {
    const [editor] = useLexicalComposerContext()

    return (
        <AIContext>
            <AIChat editor={editor} />
        </AIContext>
    )
}

export default AIPlugin
