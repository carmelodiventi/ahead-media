import { ActionFunctionArgs, json } from "@remix-run/node";
import {createSupabaseServerClient} from "../utils/supabase.server";

export const action = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const query = formData.get("query");
  const id = formData.get("id");
  const [code, display_code] = (formData.get("country") as string).split(":");
  const [lang_code, lang_display] = (formData.get("language") as string).split(":");
  const { supabaseClient } = createSupabaseServerClient(request);

  const { data: item, error: itemError } = await supabaseClient
    .from("documents")
    .select("metadata")
    .eq("id", id)
    .single();

  if (itemError) {
    return json({
      error: itemError.message,
      success: false,
    });
  }

  const { data, error } = await supabaseClient
    .from("documents")
    .update({
      query,
      metadata: {
        ...item.metadata,
        lang_code,
        code,
        display_code,
        lang_display,
      },
    })
    .eq("id", id)
    .select("*")
    .single();

  if (error) {
    return json({
      error: error.message,
      success: false,
    });
  }

  return json({
    data,
    success: true,
  });
};
