import React, { useState } from 'react'
import {
    AlertDialog,
    Box,
    Button,
    Flex,
    Heading,
    IconButton,
    SegmentedControl,
    Select,
    TextField,
} from '@radix-ui/themes'
import { DotsHorizontalIcon } from '@radix-ui/react-icons'
import { LiveSearchResultProps } from './LiveSearchResult.types'
import { Form } from '@remix-run/react'
import * as Label from '@radix-ui/react-label'
import QuestionItem from "./components/question-item";
import LiveSearchItem from "./components/live-search-item";

const LiveSearchResults = ({
    liveSearchResults,
    searchQuery,
    metadata,
    documentId,
    handleQuery,
}: LiveSearchResultProps) => {
    const [tab, setTab] = useState('serp')
    const [querySettings, setQuerySettings] = useState(false)
    const onResultClick = (url: string) => {
        console.log(url)
    }

    if (!liveSearchResults) {
        return null
    }

    const key = `${searchQuery}:${metadata?.code}:${metadata?.lang_code}`
    const questions = liveSearchResults[key]?.questions
    const serpResults = liveSearchResults[key]?.serp

    return (
        <Flex px={'4'} py={'4'} direction={"column"} minHeight={'calc(100vh)'} overflowY="auto">
            <Box className="top-0 sticky z-10 space-y-3 bg-[var(--gray-1)] py-2">
                <Box>
                    <TextField.Root defaultValue={searchQuery} size="2" readOnly>
                        <TextField.Slot side={'right'}>
                            <IconButton size="1" variant="ghost" onClick={() => setQuerySettings(true)}>
                                <DotsHorizontalIcon height="14" width="14" />
                            </IconButton>
                        </TextField.Slot>
                    </TextField.Root>
                </Box>

                <Box>
                    <SegmentedControl.Root defaultValue="serp" onValueChange={(value) => setTab(value)}>
                        <SegmentedControl.Item value="serp">Serp</SegmentedControl.Item>
                        <SegmentedControl.Item value="outline">Outline</SegmentedControl.Item>
                        <SegmentedControl.Item value="stats">Stats</SegmentedControl.Item>
                    </SegmentedControl.Root>
                </Box>
            </Box>

            <Box mt={'4'}>
                {
                    {
                        serp: (
                            <Box>
                                <Heading size="2" weight="medium" color="gray" mb={'2'}>
                                    People also ask
                                </Heading>
                                <Box className="space-y-3">
                                    {questions?.map((result, index) => (
                                        <QuestionItem key={index} question={result.question} snippet={result.snippet} />
                                    ))}
                                </Box>
                                <Heading size="2" weight="medium" color="gray" my={'2'}>
                                    {serpResults?.length} search results
                                </Heading>
                                <Box className="space-y-3">
                                    {serpResults?.map((result, index) => (
                                        <LiveSearchItem
                                            key={index}
                                            title={result.title}
                                            snippet={result.snippet}
                                            rank={result.rank}
                                            website={result.website}
                                            url={result.url}
                                            onClick={() => onResultClick(result.url)}
                                        />
                                    ))}
                                </Box>
                            </Box>
                        ),
                    }[tab]
                }
            </Box>

            <AlertDialog.Root open={querySettings}>
                <AlertDialog.Content maxWidth="450px">
                    <AlertDialog.Title>Search query settings</AlertDialog.Title>

                    <Form
                        className="space-y-3"
                        onSubmit={(e) => {
                            e.preventDefault()
                            setQuerySettings(false)
                            handleQuery(e, documentId)
                        }}
                    >
                        <Flex gap="2" direction="column">
                            <Label.Root htmlFor="query">Search query</Label.Root>
                            <TextField.Root name="query" placeholder="Search query…" defaultValue={searchQuery} />
                        </Flex>

                        <Flex gap="2" direction="column">
                            <Label.Root htmlFor="language">Language</Label.Root>
                            <Select.Root name="language" defaultValue="en:English">
                                <Select.Trigger />
                                <Select.Content>
                                    <Select.Item value="en:English">English</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Flex>

                        <Flex gap="2" direction="column">
                            <Label.Root htmlFor="country">Country</Label.Root>
                            <Select.Root name="country" defaultValue="uk:United Kingdom">
                                <Select.Trigger />
                                <Select.Content>
                                    <Select.Item value="uk:United Kingdom">United Kingdom</Select.Item>
                                </Select.Content>
                            </Select.Root>
                        </Flex>

                        <Flex gap="3" mt="4" justify="end">
                            <AlertDialog.Cancel>
                                <Button variant="soft" color="gray" onClick={() => setQuerySettings(false)}>
                                    Cancel
                                </Button>
                            </AlertDialog.Cancel>
                            <AlertDialog.Action>
                                <Button variant="solid" type="submit">
                                    Save
                                </Button>
                            </AlertDialog.Action>
                        </Flex>
                    </Form>
                </AlertDialog.Content>
            </AlertDialog.Root>
        </Flex>
    )
}

export default LiveSearchResults
