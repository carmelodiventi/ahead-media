import {createClient} from "contentful";
import {CMSData} from "./contentful.types";

const SPACE = process.env.CONTENTFUL_SPACE_ID;
const TOKEN = process.env.CONTENTFUL_ACCESS_TOKEN;

const contentful = createClient({
    space: SPACE!,
    accessToken: TOKEN!,
});

async function apiCall(query: string, variables: string | object = {}) {
    const fetchUrl = `https://graphql.contentful.com/content/v1/spaces/${SPACE}/environments/master`;
    const options = {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${TOKEN}`,
        },
        body: JSON.stringify({query, variables}),
    };
    return await fetch(fetchUrl, options);
}

async function getPage(slug: string) {
    const query = `
    query($slug:String) {
        pageCollection(where:{slug:$slug}){
          items{
            slug
            seoMetadata{
              title
              ogImage {
                url
              }
              description
            }
          }
        }
      }
    `;
    const variables = {
        slug: slug,
    };

    const response = await apiCall(query, variables);
    const json = await response.json();
    return await json.data?.pageCollection.items[0];
}

const getPageEntries = async (slug: string): Promise<CMSData> => {
    const pageData = await contentful.getEntries({
        content_type: "page",
        "fields.slug": slug,
        include: 10,
    });

    return {
        pageData: pageData.items[0].fields as any
    };
};

export const client = {getPage, getPageEntries};
