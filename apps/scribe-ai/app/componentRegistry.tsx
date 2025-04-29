import {
    Box,
    Button,
    ButtonProps,
    Card,
    CardProps,
    Container,
    ContainerProps,
    Flex,
    FlexProps,
    Grid,
    GridProps,
    Heading,
    HeadingProps, Link, LinkProps,
    Section,
    Text,
    TextProps,
} from '@radix-ui/themes'

interface WithText {
    text: string
}

interface WithContent {
    content: Array<{ fields: { type: keyof ComponentRegistry } }>
}

interface ComponentRegistry {
    container: (props: { fields: ContainerProps & WithContent }) => React.ReactElement
    header: (props: { fields: ContainerProps & WithContent }) => React.ReactElement
    hero: (props: { fields: { content: Array<{ fields: { type: keyof ComponentRegistry } }> } }) => React.ReactElement
    grid: (props: { fields: GridProps & WithContent }) => React.ReactElement
    flex: (props: {
        fields: FlexProps & {
            content: Array<{ fields: { type: keyof ComponentRegistry } }>
        }
    }) => React.ReactElement
    text: (props: { fields: TextProps & { text: string } }) => React.ReactElement
    card: (props: {
        fields: CardProps & {
            content: Array<{ fields: { type: keyof ComponentRegistry } }>
        }
    }) => React.ReactElement
    heading: (props: { fields: HeadingProps & { text: string } }) => React.ReactElement
    button: (props: { fields: ButtonProps & { text: string; withWrapper?: boolean } }) => React.ReactElement
    link: (props: { fields: LinkProps & { text: string; withWrapper?: boolean } }) => React.ReactElement
}

const renderContent = (content: Array<{ fields: { type: keyof ComponentRegistry } }>) => {
    return content.map((component, index) => {
        const Component = componentRegistry[component.fields.type]
        if (!Component) {
            console.warn(`No component found for type: ${component.fields.type}`)
            return null
        }
        return <Component key={index} fields={component.fields as any} />
    })
}

const componentRegistry: ComponentRegistry = {
    header: ({ fields }) => (
        <Section>
            <Container {...fields}>{renderContent(fields.content)}</Container>
        </Section>
    ),
    container: ({ fields }) => (
        <Section>
            <Container {...fields}>{renderContent(fields.content)}</Container>
        </Section>
    ),
    grid: ({ fields }) => <Grid {...fields}>{renderContent(fields.content)}</Grid>,
    flex: ({ fields }) => <Flex {...fields}>{renderContent(fields.content)}</Flex>,
    text: ({ fields }) => (
        <Text mb="2" {...fields}>
            {fields.text}
        </Text>
    ),
    card: ({ fields }) => <Card {...fields}>{renderContent(fields.content)}</Card>,
    heading: ({ fields }) => (
        <Heading mb="2" {...fields}>
            {fields.text}
        </Heading>
    ),
    button: ({ fields }) => <Button {...fields}>{fields.text}</Button>,
    link: ({ fields }) => <Link {...fields}>{fields.text}</Link>,
    hero: ({ fields }) => (
        <Box position="relative">
            <Section position={'relative'}>
                <Container>
                    <Box>
                        {renderContent(fields.content)}
                    </Box>
                </Container>
            </Section>
            <Box className="absolute inset-2 bottom-0 rounded-2xl ring-1 ring-inset ring-black/5 bg-[linear-gradient(115deg,var(--tw-gradient-stops))] from-[#fff1be] from-[28%] via-[#ee87cb] via-[70%] to-[#b060ff] sm:bg-[linear-gradient(145deg,var(--tw-gradient-stops))]"></Box>
        </Box>
    ),
}

export default componentRegistry
