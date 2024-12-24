import { Flex, Grid, Text } from '@radix-ui/themes'
import { ArrowUpIcon } from '@radix-ui/react-icons'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { useEffect, useState } from 'react'
import { $getRoot } from 'lexical'

function Stats() {
    const [editor] = useLexicalComposerContext()
    const [wordCount, setWordCount] = useState(0)
    const [headingCount, setHeadingCount] = useState(0)
    const [linkCount, setLinkCount] = useState(0)
    const [imageCount, setImageCount] = useState(0)

    useEffect(() => {
        const updateStats = () => {
            editor.getEditorState().read(() => {
                const textContent = $getRoot().getTextContent()
                const words = textContent.trim().split(/\s+/).length
                setWordCount(words)

                const counts = {
                    headingCount: 0,
                    linkCount: 0,
                    imageCount: 0,
                }
                $getRoot().getChildren().forEach(node => {
                    if (node.getType() === 'heading') {
                        counts.headingCount++
                    }
                    if (node.getType() === 'link') {
                        counts.linkCount++
                    }
                    if (node.getType() === 'image') {
                        counts.imageCount++
                    }
                })
                setHeadingCount(counts.headingCount)
                setLinkCount(counts.linkCount)
                setImageCount(counts.imageCount)
            })
        }

        const unregister = editor.registerUpdateListener(updateStats)
        updateStats() // Initial call to set the stats

        return () => {
            unregister()
        }
    }, [editor])

    return (
        <Grid columns={'4'} gap={'2'}>
            <Flex
                direction={'column'}
                align={'center'}
                gap={'4'}
                style={{
                    borderRight: '1px solid var(--mauve-6)',
                }}
            >
                <Text weight={'bold'} size={'1'} color={'gray'}>
                    WORDS
                </Text>
                <Flex display={'inline-flex'} gap={'2'} align={'center'}>
                    <Text weight={'bold'} size={'5'}>
                        {wordCount}
                    </Text>{' '}
                    <ArrowUpIcon color={'teal'} />
                </Flex>
            </Flex>
            <Flex
                direction={'column'}
                align={'center'}
                gap={'4'}
                style={{
                    borderRight: '1px solid var(--mauve-6)',
                }}
            >
                <Text weight={'bold'} size={'1'} color={'gray'}>
                    HEADERS
                </Text>
                <Flex display={'inline-flex'} gap={'2'} align={'center'}>
                    <Text weight={'bold'} size={'5'}>
                        {headingCount}
                    </Text>{' '}
                    <ArrowUpIcon color={'teal'} />
                </Flex>
                <Text size={'2'} color={'gray'}>
                    29 {/*
                    TODO: Add The average number of headers across the top search results
                    */}
                </Text>
            </Flex>
            <Flex
                direction={'column'}
                align={'center'}
                gap={'4'}
                style={{
                    borderRight: '1px solid var(--mauve-6)',
                }}
            >
                <Text weight={'bold'} size={'1'} color={'gray'}>
                    LINKS
                </Text>
                <Flex display={'inline-flex'} gap={'2'} align={'center'}>
                    <Text weight={'bold'} size={'5'}>
                        {linkCount}
                    </Text>{' '}
                    <ArrowUpIcon color={'teal'} />
                </Flex>
            </Flex>
            <Flex direction={'column'} align={'center'} gap={'4'}>
                <Text weight={'bold'} size={'1'} color={'gray'}>
                    IMAGES
                </Text>
                <Flex display={'inline-flex'} gap={'2'} align={'center'}>
                    <Text weight={'bold'} size={'5'}>
                        {imageCount}
                    </Text>{' '}
                    <ArrowUpIcon color={'teal'} />
                </Flex>
            </Flex>
        </Grid>
    )
}

export default Stats