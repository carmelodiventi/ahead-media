import { ActionFunctionArgs } from '@remix-run/node';
import { createSupabaseServerClient } from '../utils/supabase.server';

export const loader = async ({ request, params }: ActionFunctionArgs) => {
  const { supabaseClient } = createSupabaseServerClient(request);
  const docHash = params.id;

  const { data, error } = await supabaseClient
    .from('live_search_results')
    .select('*')
    .eq('doc_hash', docHash)
    .single();

  if (error) {
    return Response.json({
      error: error.message,
      success: false,
    });
  }

  return Response.json(data?.queries ?? {});
};
