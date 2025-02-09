import {ActionFunction, ActionFunctionArgs, redirect} from '@remix-run/node';

import { DocumentStatus, DocumentTypes } from '../types/Document.types';
import { PostgrestError } from '@supabase/supabase-js';
import supabase from '../utils/supabase';
import { runWorkflow } from '../utils/templateWorkflow.server';
import { emitter } from '../utils/emitter.server';

export async function action({ request }: ActionFunctionArgs) {

  try {

    const formData = await request.formData();

    const id = formData.get('id')

    if(!id){
      throw new Error('Document id not provided');
    }

    const {
      error,
      data: document,
    }: {
      error: PostgrestError | null;
      data: DocumentTypes | null;
    } = await supabase.from('documents').select('*').eq('id', id).single();

    if (error || !document || !document.metadata) {
      return redirect('/app/documents');
    }

    const { data: template, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', document.template)
      .single();

    if (document.doc_status === DocumentStatus.Draft) {
      runWorkflow(template, document.metadata.initial_inputs, document.query, (data) => {
        emitter.emit(
          `${document.id}-${template.id}`,
          JSON.stringify({
            event: 'streaming',
            data,
          })
        );
      });
    }

    if (templateError) {
      throw new Error(templateError.message);
    }

    return Response.json({
      document
    })

  }
  catch (error) {
    return new Response((error as Error).message, {
      status: 500,
    });
  }
}
