import type { LoaderFunctionArgs } from '@remix-run/node';
import { useLoaderData } from '@remix-run/react';
import { createSupabaseServerClient } from '../utils/supabase.server';
import { client } from '../utils/contentful/contentful.server';
import PageTemplate from '../components/shared/pageTemplate/PageTemplate';
import { CMSData } from '../utils/contentful/contentful.types';
import { renderComponent, registerComponent } from '@libs/component-registry';
import { User } from '@supabase/auth-js';
import {
  Blockquote,
  Box,
  Card,
  Container,
  Flex,
  Grid,
  Heading,
  Section,
  Text,
} from '@radix-ui/themes';
import Hero from "../components/hero/Hero";

registerComponent('grid', Grid);
registerComponent('card', Card);
registerComponent('text', Text);
registerComponent('box', Box);
registerComponent('flex', Flex);
registerComponent('section', Section);
registerComponent('heading', Heading);
registerComponent('blockquote', Blockquote);
registerComponent('container', Container);
registerComponent('hero', Hero);

export const meta = ({
  data,
}: {
  data: {
    page: {
      seoMetadata: {
        title: string;
        description: string;
        ogImage: {
          url: string;
        };
      };
    };
  };
}) => {
  return [
    { title: data?.page?.seoMetadata?.title },
    { name: 'description', content: data?.page?.seoMetadata?.description },
    { name: 'og:image', content: `${data?.page?.seoMetadata?.ogImage?.url}` },
  ];
};

export const loader = async ({ request, params }: LoaderFunctionArgs) => {
  const urlPath = `/${params['slug'] || ''}`;
  const { supabaseClient } = createSupabaseServerClient(request);
  const {
    data: { user },
  } = await supabaseClient.auth.getUser();
  const { pageData } = await client.getPageEntries(urlPath);

  if (!pageData) {
    throw new Response('Page Not Found', {
      status: 404,
      statusText: 'Page not found in Contentful',
    });
  }

  return { pageData, user };
};

export default function Index() {
  const { pageData, user } = useLoaderData<typeof loader>();

  const { header } = pageData;

  console.log('pageData', pageData);

  return (
    <PageTemplate
      headerData={header as CMSData['pageData']['header']}
      userData={user as User}
    >
      <>
        {pageData?.content?.map((component) =>
          renderComponent(
            component.sys.contentType.sys.id,
            component.fields,
            component.sys.id
          )
        )}
      </>
    </PageTemplate>
  );
}
