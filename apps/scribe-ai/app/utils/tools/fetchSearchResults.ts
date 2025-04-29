import axios from "axios";

interface OrganicResult {
  link: string;
  title: string;
  snippet: string;
  position: number;
}

interface PeopleAlsoAsk {
  question: string;
  snippet: string;
}

const fetchSearchResults = async ({
  query,
  location,
}: {
  query: string;
  location: string;
}) => {

  const response = await axios.request<{
    organic: OrganicResult[];
    peopleAlsoAsk: PeopleAlsoAsk[];
  }>({
    method: "post",
    maxBodyLength: Infinity,
    url: "https://google.serper.dev/search",
    headers: {
      "X-API-KEY": process.env.SERPER_API_KEY,
      "Content-Type": "application/json",
    },
    data: {
      q: query,
      location: location,
      gl: "gb",
      num: 20,
    },
  });

  const { organic, peopleAlsoAsk } = response.data;

  return {
    organic: organic?.map((result: OrganicResult) => {
      return {
        title: result?.title,
        url: result?.link,
        snippet: result?.snippet,
        rank: result?.position,
        website: new URL(result?.link).hostname,
      };
    }) ?? [],
    questions: peopleAlsoAsk?.map((result: PeopleAlsoAsk) => {
      return {
        question: result?.question,
        snippet: result?.snippet,
      };
    }) ?? [],
  }

};

export default fetchSearchResults;
