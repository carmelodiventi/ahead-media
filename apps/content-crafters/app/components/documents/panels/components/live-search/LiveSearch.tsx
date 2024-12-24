import {
  AlertDialog,
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  SegmentedControl,
  Select,
  Spinner,
  Text,
  TextField,
} from '@radix-ui/themes';
import { useState } from 'react';
import { Form, useFetcher } from '@remix-run/react';
import {
  ArrowRightIcon,
  DotsHorizontalIcon,
  MagnifyingGlassIcon,
} from '@radix-ui/react-icons';
import { LiveSearchProps } from './LiveSearch.types';
import * as Label from '@radix-ui/react-label';
import getLiveSearchResults from '../../helpers/getLiveSearchResults';
import QuestionItem from '../live-search-results/components/question-item';
import LiveSearchItem from '../live-search-results/components/live-search-item';
import Stats from './components/Stats';
import useLiveSearchAI from '../../../../../hooks/useLiveSearchAI';

const LiveSearch = ({
  document,
  liveSearchResults,
  searchQuery,
}: LiveSearchProps) => {
  const fetcher = useFetcher();
  const [tab, setTab] = useState('serp');
  const [querySettings, setQuerySettings] = useState(false);
  const { metadata, id } = document;
  const { handleQuery, setQuery, loading } = useLiveSearchAI({
    id,
  });

  const onResultClick = (url: string) => {
    console.log(url);
  };

  if (loading) {
    return (
      <Flex align={'center'} justify="center" p={'8'} gap={'4'}>
        <Spinner /> <Text color="gray">Loading...</Text>
      </Flex>
    );
  }

  if (!liveSearchResults) {
    return (
      <>
        <Box height={'100%'} p={'8'}>
          <Heading size="6" align="center" mb={'6'}>
            Research
          </Heading>
          <Text size="3" color="gray" align="center">
            Process the top 20 Google search results for the following search
            query:
          </Text>

          <Form
            onSubmit={handleQuery}
            method="post"
            className={'space-y-3 mt-6'}
          >
            <TextField.Root
              name="query"
              placeholder="Search query…"
              onChange={(e) => setQuery(e.target.value)}
              defaultValue={document.query}
            >
              <TextField.Slot>
                <MagnifyingGlassIcon height="16" width="16" />
              </TextField.Slot>
            </TextField.Root>
            <Button loading={fetcher.state === 'submitting'}>
              Start <ArrowRightIcon />
            </Button>
          </Form>
        </Box>
      </>
    );
  }

  const { questions, serpResults } = getLiveSearchResults(
    searchQuery,
    metadata,
    liveSearchResults
  );

  return (
    <>
      <Flex
        direction={'column'}
        px={'4'}
        gap={'4'}
        minHeight={'calc(100vh)'}
        overflowY="auto"
      >
        <Flex
          gap={'3'}
          direction={'column'}
          position={'sticky'}
          top={'0px'}
          style={{ zIndex: 10, backgroundColor: 'var(--gray-1)' }}
        >
          <Box width={'100%'}>
            <TextField.Root defaultValue={searchQuery} size="2" readOnly>
              <TextField.Slot side={'right'}>
                <IconButton
                  size="1"
                  variant="ghost"
                  onClick={() => setQuerySettings(true)}
                >
                  <DotsHorizontalIcon height="14" width="14" />
                </IconButton>
              </TextField.Slot>
            </TextField.Root>
          </Box>

          <Box width={'100%'}>
            <SegmentedControl.Root
              style={{
                width: '100%',
              }}
              defaultValue="serp"
              onValueChange={(value) => setTab(value)}
            >
              <SegmentedControl.Item value="serp">Serp</SegmentedControl.Item>
              <SegmentedControl.Item value="outline">
                Outline
              </SegmentedControl.Item>
              <SegmentedControl.Item value="stats">Stats</SegmentedControl.Item>
            </SegmentedControl.Root>
          </Box>
        </Flex>

        <Box>
          {
            {
              serp: (
                <Box>
                  <Heading size="2" weight="medium" color="gray" mb={'4'}>
                    People also ask
                  </Heading>
                  <Flex direction={'column'} gapY={'3'}>
                    {questions?.map((result, index) => (
                      <QuestionItem
                        key={index}
                        question={result.question}
                        snippet={result.snippet}
                      />
                    ))}
                  </Flex>
                  <Heading size="2" weight="medium" color="gray" my={'4'}>
                    {serpResults?.length} search results
                  </Heading>
                  <Flex direction={'column'} gapY={'3'}>
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
                  </Flex>
                </Box>
              ),
              outline: (
                <Box>
                  <Heading size="2" weight="medium" color="gray" mb={'4'}>
                    Outline
                  </Heading>
                </Box>
              ),
              stats: <Stats />,
            }[tab]
          }
        </Box>

        <AlertDialog.Root open={querySettings}>
          <AlertDialog.Content maxWidth="450px">
            <AlertDialog.Title>Search query settings</AlertDialog.Title>

            <Form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                setQuerySettings(false);
                handleQuery(e);
              }}
            >
              <Flex gap="2" direction="column">
                <Label.Root htmlFor="query">Search query</Label.Root>
                <TextField.Root
                  name="query"
                  placeholder="Search query…"
                  defaultValue={searchQuery}
                />
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
                    <Select.Item value="uk:United Kingdom">
                      United Kingdom
                    </Select.Item>
                  </Select.Content>
                </Select.Root>
              </Flex>

              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button
                    variant="soft"
                    color="gray"
                    onClick={() => setQuerySettings(false)}
                  >
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
    </>
  );
};

export default LiveSearch;
