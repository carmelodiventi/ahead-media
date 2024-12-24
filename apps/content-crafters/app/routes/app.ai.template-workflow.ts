import { ActionFunctionArgs } from '@remix-run/node';
import { runWorkflow } from '../utils/templateWorkflow.server';
import { WorkflowConfig } from '../types/Workflow.types';

export const actions = async ({ request }: ActionFunctionArgs) => {
  const formData = await request.formData();

  if (!formData.has('workflowConfig') || !formData.has('initialInputs')) {
    return new Response('Missing required fields', {
      status: 400,
    });
  }

  const response = await runWorkflow(
    formData.get('workflowConfig') as WorkflowConfig,
    formData.get('initialInputs') as Record<string, any>
  );
  return {
    response,
  };
};
