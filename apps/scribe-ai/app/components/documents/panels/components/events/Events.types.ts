import { GenericEvent } from '../../../../../types/Events.types';

export interface EventsProps {
  doc_hash: string;
  children: React.ReactNode;
}

export interface SearchResultsStartedData {
  doc_hash: string;
  query: string;
}

export interface SearchResultsCompletedData {
  doc_hash: string;
  results: {
    organic: {
      title: string;
      url: string;
      snippet: string;
      rank: number;
      website: string;
    }[];
    questions: {
      question: string;
      snippet: string;
    }[];
  };
}

export type EventStatus =
  | GenericEvent<SearchResultsStartedData>
  | GenericEvent<SearchResultsCompletedData>;
