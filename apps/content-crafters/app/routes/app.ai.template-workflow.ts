import { ActionFunctionArgs } from '@remix-run/node';
import { runWorkflow } from '../utils/templateWorkflow.server';
import { WorkflowConfig } from '../types/Workflow.types';
import { createSupabaseServerClient } from '../utils/supabase.server';

export const actions = async ({ request }: ActionFunctionArgs) => {

  try{
    const formData = await request.formData();
    const templateId = formData.get('templateId');
    const initialInputs = formData.get('initialInputs');

    if (!templateId || initialInputs) {
     throw new Error('Template id is required');
    }

    const { supabaseClient } = createSupabaseServerClient(request);

    const { data, error } = await supabaseClient
      .from('workflow_templates')
      .select('*')
      .eq('id', templateId)
      .single();

    if (error) {
      return {
        error: error.message,
        success: false,
      };
    }

    const response = await runWorkflow(data as WorkflowConfig, {});
    return {
      response,
    };
  }
  catch (error){
    return new Response((error as Error).message, {
      status: 400,
    });
  }

};
