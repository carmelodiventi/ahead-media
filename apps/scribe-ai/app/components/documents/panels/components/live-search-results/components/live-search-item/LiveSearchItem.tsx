import { Card, Flex, Heading, Link, Text, Tooltip } from '@radix-ui/themes'

interface LiveSearchItemProps {
    title: string
    website: string
    rank: number
    snippet: string
    url: string
    onClick: (item: any) => void
}

const LiveSearchItem = ({ website, rank, title, url, snippet, onClick }: LiveSearchItemProps) => {
    return (
        <Card variant="surface">
            <Flex gap="3">
                <Text as="div" size="2" weight="bold">
                    <Tooltip content={url}>
                        <Link href={url} title={title} target="_blank" rel={'noopener noreferrer'} truncate={true}>
                            {website}
                        </Link>
                    </Tooltip>
                </Text>
                <Text color={'jade'} as="div" size="2" weight="bold">
                    #{rank} search rank
                </Text>
            </Flex>
            <Heading size="2" my={'4'}>
                {title}
            </Heading>
            <Text
                as="p"
                size="2"
                color="gray"
                mt={'2'}
                truncate={true}
                style={{
                    textWrap: 'pretty',
                }}
            >
                {snippet}
            </Text>
        </Card>
    )
}

export default LiveSearchItem
