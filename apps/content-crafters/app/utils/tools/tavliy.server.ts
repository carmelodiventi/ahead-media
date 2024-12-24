import { tavily } from "@tavily/core";
const tvly = tavily({ apiKey: process.env.TAVILY_API_KEY! });
import type { Document } from "@langchain/core/documents";

const extractTaviliy = async (urls: Array<string>): Promise<Array<Document>> => {
    // Step 3. Executing the extract request
    const response = await tvly.extract(urls)

    const documents: Array<Document> = [];
    for (const result of response.results) {
        console.log(JSON.stringify(result));
        const document: Document = {
            metadata: {
                url: result['url'],
            },
            pageContent: result['rawContent']
        }
        documents.push(document);
    }
    return documents;
}

export default extractTaviliy;
