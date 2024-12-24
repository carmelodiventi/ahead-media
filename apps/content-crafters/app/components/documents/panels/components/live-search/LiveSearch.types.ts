import {DocumentTypes} from "../../../../../types/Document.types";
import {QuerySerp} from "../../../../../hooks/useLiveSearchAI/useLiveSearchAI.types";

export  interface  LiveSearchProps {
    document: DocumentTypes;
    liveSearchResults: QuerySerp | null;
    searchQuery: string;
}
