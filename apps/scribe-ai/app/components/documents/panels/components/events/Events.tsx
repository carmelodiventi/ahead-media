import {EventsProps, EventStatus, SearchResultsCompletedData} from "./Events.types";

import { Box, Flex, Heading, Spinner, Text } from "@radix-ui/themes";
import React, { useEffect } from "react";
import { useResolvedPath, useRevalidator } from "@remix-run/react";
import { useEventSource } from "remix-utils/sse/react";
import {EVENTS} from "../../../../../costants/events";
import {GenericEvent} from "../../../../../types/Events.types";

export default function Events({
  doc_hash: id,
  children,
}: EventsProps): React.ReactElement | null {
  const [status, setStatus] = React.useState<EventStatus | null>(null);
  const path = useResolvedPath(`/app/documents/${id}/live-search-update`);
  const data = useEventSource(path.pathname);
  const { revalidate } = useRevalidator();

  useEffect(() => {
    revalidate();
    if (data) setStatus(JSON.parse(data) as EventStatus);
  }, [data]);

  const eventComponents = {
    [EVENTS.SEARCH_RESULTS_STARTED]: (
      <Flex
        direction="column"
        gap="4"
        align="center"
        justify="center"
        width="100%"
        p={"8"}
      >
        <Spinner size="3" />
        <Heading size="3" align="center">
          Searching Google...
        </Heading>
      </Flex>
    ),
    [EVENTS.SEARCH_RESULTS_COMPLETED]: (
      <Flex
        direction="column"
        gap="4"
        align="center"
        justify="center"
        width="100%"
        p={"8"}
        position="relative"
      >
        <Heading size="3" align="center">
          Search results...
        </Heading>
        <Flex
          direction="column"
          gap="2"
          className="absolute top-24 left-2/4 -translate-x-1/2 h-[160px] overflow-hidden font-['Lato',_sans-serif] text-[35px] leading-[40px] text-[#ecf0f1]"
        >
          <Box className="relative font-semibold overflow-hidden h-[40px] px-[40px] py-[0] before:leading-[40px] after::leading-[40px] before:absolute before:content-['['] before:left-[0] after:content-[']'] after:absolute after:top-0 after:right-[0]">
            <Box className="animate-change">
              {status &&
                "results" in status.data &&
                (status as GenericEvent<SearchResultsCompletedData>).data.results.organic.slice(0, 4).map((result, index) => (
                  <Text
                    size="2"
                    color="gray"
                    align="center"
                    className="leading-[40px] block"
                    key={index}
                  >
                    {result.website}
                  </Text>
                ))}
            </Box>
          </Box>
        </Flex>
      </Flex>
    ),
  };

  return (
    <>
      {status && status.event ? (
        <Flex direction="column">eventComponents[status.event]</Flex>
      ) : (
        children
      )}
    </>
  );
}
