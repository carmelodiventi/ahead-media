import {QuerySerp} from "../../../../../hooks/useLiveSearchAI/useLiveSearchAI.types";
import {DocumentTypes} from "../../../../../types/Document.types";


export interface LiveSearchResultProps {
  liveSearchResults: QuerySerp | null;
  documentId: string;
  searchQuery: string;
  metadata: DocumentTypes["metadata"];
  handleQuery: (
    e: React.FormEvent<HTMLFormElement>,
    document_id: string
  ) => Promise<void>;
}
