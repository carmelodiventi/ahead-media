import { ActionFunctionArgs } from "@remix-run/node";
import {createSupabaseServerClient} from "../utils/supabase.server";
import callAgentsLiveSearch from "../utils/agents/callAgentsLiveSearch";



export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { supabaseClient } = createSupabaseServerClient(request);
    const formData = await request.formData();
    const document_id = formData.get("id") as string;
    const query = formData.get("query") as string;
    const indexname = formData.get("indexname") as string;
    const namespace = formData.get("namespace") as string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const code = formData.get("code") as string;
    const location = formData.get("display_code") as string;
    const lang = formData.get("lang") as string;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const lang_code = formData.get("lang_code") as string;

    const result = await callAgentsLiveSearch({ document_id, query, location, indexname, namespace, lang });

    console.info("Result processing AI workflow:", result);
    return Response.json({ result: result });
  } catch (error: Error | unknown) {
    console.error("Error processing AI workflow:", error);
    return Response.json({ error: (error as Error)?.message ?? error });
  }
};
