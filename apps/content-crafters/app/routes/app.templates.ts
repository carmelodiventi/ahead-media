import { createSupabaseServerClient } from '../utils/supabase.server';
import { LoaderFunctionArgs } from '@remix-run/node';

export type LoaderData = {
  error?: string;
  templates: Template[];
};

export const loader = async ({ request }: LoaderFunctionArgs): Promise<LoaderData> => {
  console.log("here");
  const { supabaseClient } = createSupabaseServerClient(request);
  const { data: templates, error } = await supabaseClient
    .from('templates')
    .select('*');


  if (error) {
    return {
      error: error.message,
      templates: [],
    };
  }

  return {
    templates
  };
};
