import { LinkPlugin as LexicalLinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { validateUrl } from '../../utils/url'

type Props = {
    hasLinkAttributes?: boolean
}

export default function LinkPlugin({ hasLinkAttributes = false }: Props): JSX.Element {
    return (
        <LexicalLinkPlugin
            validateUrl={validateUrl}
            attributes={
                hasLinkAttributes
                    ? {
                          rel: 'noopener noreferrer',
                          target: '_blank',
                      }
                    : undefined
            }
        />
    )
}
