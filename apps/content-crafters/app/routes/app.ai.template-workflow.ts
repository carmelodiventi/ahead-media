import { ActionFunctionArgs } from '@remix-run/node';
import { runWorkflow } from '../utils/templateWorkflow.server';
import { createSupabaseServerClient } from '../utils/supabase.server';

export const action = async ({ request }: ActionFunctionArgs) => {

  try{
    const formData = await request.formData();
    const templateId = formData.get('templateId');
    const initialInputs = formData.get('initialInputs');

    if (!templateId || !initialInputs) {
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

    const initialInputsObj = JSON.parse(initialInputs as string);

    const response = await runWorkflow(data, initialInputsObj);

    console.log('Workflow response:', response);

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
