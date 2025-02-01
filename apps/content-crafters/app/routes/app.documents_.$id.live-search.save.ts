import { ActionFunctionArgs } from '@remix-run/node';
import { Document as LangchainDocument } from 'langchain/document';
import { z } from 'zod';
import { createSupabaseServerClient } from '../utils/supabase.server';
import { emitter } from '../utils/emitter.server';
import { EVENTS } from '../costants/events';
import {
  SearchResultsCompletedData,
  SearchResultsStartedData,
} from '../components/documents/panels/components/events/Events.types';
import { GenericEvent } from '../types/Events.types';
import fetchSearchResults from '../utils/tools/fetchSearchResults';
import { CustomWebLoader } from '../utils/tools/webLoader';
import extractTaviliy from '../utils/tools/tavliy.server';
import { updateVectorDB } from '../utils/pinecone.server';

export const action = async ({ request, params }: ActionFunctionArgs) => {
  const formData = await request.formData();
  const docHash = params.id;
  const query = formData.get('query');
  const country = formData.get('country');
  const language = formData.get('language');

  const { error: formError } = z
    .object({
      query: z.string(),
    })
    .safeParse({
      query: query as string,
    });

  if (formError) {
    return {
      error: formError.errors.map((error) => error.message).join(', '),
      success: false,
    };
  }

  const { supabaseClient } = createSupabaseServerClient(request);
  const { SEARCH_RESULTS_STARTED, SEARCH_RESULTS_COMPLETED } = EVENTS;

  emitter.emit(
    params.id as string,
    JSON.stringify({
      event: SEARCH_RESULTS_STARTED,
      data: {
        doc_hash: params.id,
        query: formData.get('query'),
      },
    } as GenericEvent<SearchResultsStartedData>)
  );

  const { data: item, error: itemError } = await supabaseClient
    .from('documents')
    .select('*')
    .eq('id', docHash)
    .single();

  if (itemError) {
    return {
      error: itemError.message,
      success: false,
    };
  }

  const { error: docError, data: updateItem } = await supabaseClient
    .from('documents')
    .update({
      query: String(query)?.trimEnd(),
      metadata: {
        ...item.metadata,
        code: country
          ? (country as string).split(':').at(0)
          : item.metadata.code,
        display_code: country
          ? (country as string).split(':').at(1)
          : item.metadata.display_code,
        lang_code: language
          ? (language as string).split(':').at(0)
          : item.metadata.lang_code,
        lang_display: language
          ? (language as string).split(':').at(1)
          : item.metadata.lang_display,
        serp_loaded: true,
      },
    })
    .eq('id', docHash)
    .select('metadata')
    .single();

  if (docError) {
    return {
      error: docError.message,
      success: false,
    };
  }

  const { code, lang_code, display_code } = updateItem.metadata;

  const results = await fetchSearchResults({
    query: query as string,
    location: display_code as string,
  });

  const { data, error } = await supabaseClient
    .from('live_search_results')
    .upsert(
      {
        doc_hash: docHash,
        queries: {
          [`${query}:${code}:${lang_code}`]: {
            serp: results ? results.organic : [],
            questions: results ? results.questions : [],
          },
        },
      },
      { onConflict: 'doc_hash' }
    )
    .select('*')
    .single();

  if (error) {
    return {
      error: error.message,
      success: false,
    };
  }

  emitter.emit(
    params.id as string,
    JSON.stringify({
      event: SEARCH_RESULTS_COMPLETED,
      data: {
        doc_hash: params.id,
        results,
      },
    } as GenericEvent<SearchResultsCompletedData>)
  );

  const scrapeData: Array<{ url: string; content: LangchainDocument[] }> = [];
  for await (const result of results.organic) {
    const { url } = result;
    const webLoader = new CustomWebLoader(url); // 'https://backlinko.com/seo-strategy'
    const content = await webLoader.load();
    scrapeData.push({
      url,
      content,
    });
  }

  emitter.emit(
    params.id as string,
    JSON.stringify({
      event: SEARCH_RESULTS_COMPLETED,
      data: {
        doc_hash: params.id,
        results,
      },
    } as GenericEvent<SearchResultsCompletedData>)
  );

  const docs = await extractTaviliy(
    results.organic.map((result) => result.url)
  );

  await updateVectorDB({
    indexname: process.env.PINECONE_INDEX_NAME!,
    namespace: docHash!,
    docs: docs,
  });

  emitter.emit(params.id as string, null);

  return {
    queries: data.queries,
    success: true,
    error: null,
  };
};
