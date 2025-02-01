import type { LoaderFunctionArgs } from '@remix-run/node';
import { eventStream } from 'remix-utils/sse/server';
import { emitter } from '../utils/emitter.server';

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const { id, workflowId } = params;

  return eventStream(request.signal, (send) => {
    const handler = (message: string) => {
      send({
        data: message,
      });
    };

    emitter.addListener(`${id}-${workflowId}`, handler);

    return () => {
      emitter.removeListener(`${id}-${workflowId}`, handler);
    };
  });
};
