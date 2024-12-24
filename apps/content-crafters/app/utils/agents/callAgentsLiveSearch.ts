import { tool } from "@langchain/core/tools";
import fetchSearchResults from "../../utils/tools/fetchSearchResults";
import { z } from "zod";
import { Annotation, MemorySaver, StateGraph } from "@langchain/langgraph";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import scrapeContent from "../tools/scrapeContent";
import {updateVectorDB} from "../pinecone.server";
import { DocumentInterface } from '@langchain/core/documents';

interface State {
  messages: BaseMessage[];
  previousResult?: { urls: string[] };
}

const callAgentsLiveSearch = async ({
  document_id,
  query,
  indexname,
  namespace,
  lang,
  location,
}: {
  document_id: string;
  query: string;
  indexname: string;
  namespace: string;
  lang: string;
  location: string;
}) => {
  const GraphState = Annotation.Root({
    messages: Annotation<BaseMessage[]>({
      reducer: (x, y) => x.concat(y),
    }),
  });

  const fetchTool = tool(
    () =>
      fetchSearchResults({
        query,
        location,
      }),
    {
      name: "fetch_search",
      description: "Fetch search results for a topic",
      schema: z.object({
        query: z.string().describe("The search query to retrieve results."),
        location: z.string().describe("The location to search from."),
      }),
    }
  );

  const scrapeTool = tool(scrapeContent, {
    name: "scrape_content",
    description: "Scrape main content from URLs",
    schema: z.object({
      urls: z
        .array(
            z.string().url().describe("URLs to scrape content from.")
        )
        .describe("List of URLs to scrape content from."),
    }),
  });

  const tools = [fetchTool, scrapeTool];
  const toolNode = new ToolNode<typeof GraphState.State>(tools);

  const model = new ChatOpenAI({
    streaming: true,
    modelName: "gpt-3.5-turbo", // or whichever model you're using
    apiKey: process.env.OPENAI_API_KEY,
    temperature: 0,
  }).bindTools(tools);

  async function callModel(state: typeof GraphState.State) {
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful AI assistant, collaborating with other assistants. Use the provided tools to progress towards answering the question. If you are unable to fully answer, that's OK, another assistant with different tools will help where you left off. Execute what you can to make progress. If you or any of the other assistants have the final answer or deliverable, prefix your response with FINAL ANSWER so the team knows to stop. You have access to the following tools: {tool_names}.\n{system_message}\nCurrent time: {time}.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    const formattedPrompt = await prompt.formatMessages({
      system_message: "You are helpful Content Creator Chatbot Agent.",
      time: new Date().toISOString(),
      tool_names: tools.map((tool) => tool.name).join(", "),
      messages: state.messages,
    });

    const result = await model.invoke(formattedPrompt);

    return { messages: [result] };
  }

  function shouldContinue(state: State) {
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1] as AIMessage;

    // Logic to determine the next step based on the last message
    if (lastMessage.tool_calls?.length) {
      // If a tool call is requested, proceed to tools node
      return "tools";
    }

    // Otherwise, stop the workflow
    return "__end__";
  }

  const checkpointer = new MemorySaver();

  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel) // Decision node
    .addNode("tools", toolNode) // Tools node
    .addEdge("__start__", "agent") // Start with the agent
    .addConditionalEdges("agent", shouldContinue) // Conditional routing
    .addEdge("tools", "agent"); // Loop back to agent after using a tool

  const app = workflow.compile({ checkpointer });

  const finalState = await app.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    { recursionLimit: 15, configurable: { thread_id: document_id } }
  );

  return finalState.messages[finalState.messages.length - 1].content;
};

export default callAgentsLiveSearch;
