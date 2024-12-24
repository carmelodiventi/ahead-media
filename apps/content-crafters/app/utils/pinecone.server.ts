import { IndexModel, Pinecone } from '@pinecone-database/pinecone';
import { DocumentInterface } from '@langchain/core/documents';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { ChatOpenAI, OpenAIEmbeddings } from '@langchain/openai';
import { PineconeStore } from '@langchain/pinecone';
import { HumanMessage } from '@langchain/core/messages';
import { StringPromptValue } from '@langchain/core/prompt_values';

export const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const embeddings = new OpenAIEmbeddings({
  modelName: process.env.EMBEDDING_MODEL_NAME!,
  apiKey: process.env.OPENAI_API_KEY!,
});

const llm = new ChatOpenAI({
  modelName: 'gpt-3.5-turbo',
  apiKey: process.env.OPENAI_API_KEY,
  temperature: 0,
});

export const createIndex = async ({
  indexname,
}: {
  indexname: string;
}): Promise<IndexModel> => {
  const existingIndexes = await pc.listIndexes();

  if (existingIndexes && existingIndexes.indexes) {
    const existingIndex = existingIndexes.indexes.find(
      (index) => index.name === indexname
    );

    if (existingIndex) {
      if (
        existingIndex.dimension !== parseInt(process.env.EMBEDDING_DIMENSION!)
      ) {
        throw new Error(
          `Existing index dimension (${existingIndex.dimension}) does not match required dimension (${process.env.EMBEDDING_DIMENSION})`
        );
      }
      return existingIndex;
    }

    if (existingIndex) return existingIndex;
  }

  const response = await pc.createIndex({
    name: indexname,
    dimension: parseInt(process.env.EMBEDDING_DIMENSION!),
    metric: 'cosine',
    spec: {
      serverless: {
        cloud: 'aws',
        region: process.env.PINECONE_ENVIRONMENT_REGION!,
      },
    },
  });

  if (!response) {
    throw new Error('Error creating index');
  }

  return response as IndexModel;
};

export const updateVectorDB = async ({
  indexname,
  namespace,
  docs,
}: {
  indexname: string;
  namespace: string;
  docs: DocumentInterface[];
}): Promise<PineconeStore> => {
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1536,
    chunkOverlap: 150,
  });

  const docsSummary = await splitter.splitDocuments(docs);

  // check if vectors exists into the namespace
  const namespaces = await pc
    .Index(indexname)
    .namespace(namespace)
    .listPaginated();

  if (namespaces && namespaces.vectors && namespaces.vectors.length > 0) {
    await pc.Index(indexname).namespace(namespace).deleteAll();
  }

  const pineconeIndex = pc.Index(indexname);

  const embeddings = new OpenAIEmbeddings({
    modelName: process.env.EMBEDDING_MODEL_NAME!,
    apiKey: process.env.OPENAI_API_KEY!,
  });

  return await PineconeStore.fromDocuments(docsSummary, embeddings, {
    pineconeIndex: pineconeIndex,
    namespace: namespace,
  });
};

export const similarityVectorsStoreAndLLM = async ({
  indexname,
  namespace,
  query,
}: {
  indexname: string;
  namespace: string;
  query: string;
}) => {
  try {
    const pineconeIndex = pc.Index(indexname).namespace(namespace);

    const vectorStore = await PineconeStore.fromExistingIndex(embeddings, {
      pineconeIndex,
      maxConcurrency: 10,
      namespace: namespace,
    });

    const similaritySearchWithScoreResults =
      await vectorStore.similaritySearchWithScore(query, 5);

    const SIMILARITY_THRESHOLD = 0.8; // Adjust this value based on your needs
    const relevantResults = similaritySearchWithScoreResults.filter(
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      ([_, score]) => score >= SIMILARITY_THRESHOLD
    );

    if (relevantResults.length === 0) {
      return {
        content:
          "<p>Hmm, I'm not sure... I have access only on the search result to give you the best content ever</p>",
      };
    }

    const context = relevantResults
      .map(([doc]) => doc.metadata.text)
      .filter((text) => text && text.length > 0)
      .join('\n\n');

    // Structure the prompt to guide the model for out-of-context questions
    const prompt = new StringPromptValue(
      `You are an assistant that answers questions based on a knowledge base. Use only the provided context to answer the question.
       If you can't find relevant information in the context, respond with "Hmm, I'm not sure." Do not generate generic answers.
       Structure your response as a part of the blog content with a main heading, a brief introduction, key points or lists, and a **short, relevant conclusion** that:
       - Summarizes the main action steps or takeaways from the part of the blog content.
       - Avoids restating every point already mentioned, and instead focuses on **what the reader should do next**.
       - Uses an **actionable tone** that aligns with the topic (e.g., motivating, advising, or encouraging next steps).
       - Avoids being repetitive or overly promotional.

       If the context is insufficient or not relevant, just say "Hmm, I'm not sure."

       Context: ${context}

       Question: ${query}

       Answer (in HTML):`
    );

    // Return or process the response as needed
    return await llm.invoke(prompt);
  } catch (error) {
    console.error('Error querying vector store or LLM:', error);
    throw error;
  }
};

export const queryVectorStoreAndLLM = async ({
  indexname,
  namespace,
  query,
}: {
  indexname: string;
  namespace: string;
  query: string;
}) => {
  try {
    const pineconeIndex = pc.Index(indexname).namespace(namespace);

    // Use pre-initialized embeddings to get the query embedding
    const queryEmbedding = await embeddings.embedQuery(query);

    // Query the Pinecone index with the embedded query vector
    const queryResponse = await pineconeIndex.query({
      vector: queryEmbedding,
      topK: 10,
      includeMetadata: true,
    });

    // Extract context from the results
    const context = queryResponse.matches
      .filter((match) => match.score && match.score >= 0.8) // Adjust threshold as needed
      .map((match) => match?.metadata?.text)
      .join('\n\n');

    // Structure the prompt to guide the model for out-of-context questions
    const prompt = new HumanMessage({
      content: `You are an assistant that writes SEO-optimized content based on a knowledge base. The goal is to generate high-quality, structured blog sections for each query.
      If the query is out of context or not found in the knowledge base, respond with "<p>I don't know.</p>.
      Generate responses as brief, structured blog sections, with a main heading, a brief introduction, key points or lists if relevant, and a short concluding sentence.
      Keep the answer focused and concise—aim for 2-4 short paragraphs or fewer. Use HTML tags for headings (<h2>, <h3>), paragraphs (<p>), and lists (<ul>, <li>) as needed.

      Context: ${context}

      Question: ${query}

      Answer (in HTML):`,
    });

    // Use invoke to send the prompt as a message to the ChatOpenAI model
    const response = await llm.invoke([prompt]);

    console.log(response);

    // Return or process the response as needed
    return response.content;
  } catch (error) {
    console.error('Error querying vector store or LLM:', error);
    throw error;
  }
};
