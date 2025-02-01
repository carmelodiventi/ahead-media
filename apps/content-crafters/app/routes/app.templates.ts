import { createSupabaseServerClient } from '../utils/supabase.server';
import { LoaderFunctionArgs } from '@remix-run/node';
import { WorkflowTemplate } from '../types/Workflow.types';

export type LoaderData = {
  error?: string;
  templates: Pick<
    WorkflowTemplate,
    'id' | 'name' | 'description' | 'config' | 'template_prompt' | 'query_prompt'
  >[];
};

export const loader = async ({
  request,
}: LoaderFunctionArgs): Promise<LoaderData> => {
  const { supabaseClient } = createSupabaseServerClient(request);
  const { data: templates, error } = await supabaseClient
    .from('workflow_templates')
    .select('id, name, description, config, template_prompt, query_prompt');

  if (error) {
    return {
      error: error.message,
      templates: [],
    };
  }

  return {
    templates,
  };
};
