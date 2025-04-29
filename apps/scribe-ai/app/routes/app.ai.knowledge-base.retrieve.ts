import { ActionFunctionArgs } from "@remix-run/node";
import { createSupabaseServerClient } from "../utils/supabase.server";
import { similarityVectorsStoreAndLLM } from "../utils/pinecone.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    const { supabaseClient } = createSupabaseServerClient(request);
    const formData = await request.formData();
    const {data: userData} = await supabaseClient.auth.getUser();
    const { data: prompt_history, error: prompt_error } = await supabaseClient
      .from("prompt_history")
      .insert({
        prompt: formData.get("query") as string,
      })
      .select("*");

    if (prompt_error) {
      throw prompt_error;
    }

    const namespace = formData.get("namespace") as string;
    const indexname = formData.get("indexname") as string;
    const query = formData.get("query") as string;
    const content = formData.get("content") as string;
    // @ts-ignore
    const sanitizedQuery: string = query.trim().replaceAll("\n", " ");

    const result = await similarityVectorsStoreAndLLM({
      indexname,
      namespace,
      query: sanitizedQuery,
    });

    if("usage_metadata" in result) {
      const { usage_metadata } = result
      await supabaseClient.auth.updateUser({
        data: {
          token: usage_metadata
              ? userData.user?.user_metadata.token - usage_metadata?.total_tokens
              : userData.user?.user_metadata.token,
          prompt_history,
          usage_metadata: {
            ...usage_metadata,
          },
        },
      });
    }

    return Response.json({ result: result.content, prompt_history: prompt_history });
  } catch (error: Error | unknown) {
    return Response.json({ error: (error as Error)?.message ?? error });
  }
};
