
import {DocumentTypes} from "../../../../../types/Document.types";
import {Questions, Serp} from "../../../../../hooks/useLiveSearchAI/useLiveSearchAI.types";

function getLiveSearchResults(
    searchQuery: string,
    metadata: DocumentTypes["metadata"],
    liveSearchResults: Record<string, any>
): {
    questions: Array<Questions>;
    serpResults: Array<Serp>;
} {
    const key = `${searchQuery}:${metadata?.code}:${metadata?.lang_code}`;
    const questions = liveSearchResults[key]?.questions;
    const serpResults = liveSearchResults[key]?.serp;
    return { questions, serpResults };
}

export default getLiveSearchResults;
