export type Serp = {
  title: string;
  url: string;
  snippet: string;
  rank: number;
  website: string;
}

export type Questions = {
  question: string;
  snippet: string;
}

export type QuerySerp = {
  [key: string]: {
    serp: Serp[];
    questions: Questions[];
  };
};
