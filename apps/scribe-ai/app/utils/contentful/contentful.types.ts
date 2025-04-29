import { LinkProps } from '@radix-ui/themes';
import {
  ContentType
} from 'contentful';

export interface Link extends LinkProps {
  fields: {
    contentEntryKey: string;
    contentEntry: string;
    content: string;
    url: string;
    type: string;
  };
}

export interface CMSData {
  pageData: {
    title: string;
    slug: string;
    header: {
      fields: {
        type: string;
        logoUrl: string;
        links: Array<Link>;
      };
    };
    content: Array<{
      sys: {
        id: string;
        contentType: {
          sys: {
            id: string;
          };
        }
      }
      fields: {
        content: string;
      };
    }>;
  };
}
