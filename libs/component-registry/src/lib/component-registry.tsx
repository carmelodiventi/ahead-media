import React, { ReactNode, useState, useEffect } from 'react';
import { richTextFromMarkdown } from '@contentful/rich-text-from-markdown';
import { documentToReactComponents } from '@contentful/rich-text-react-renderer';

interface ComponentRegistry {
  [key: string]: React.ComponentType<any>;
}

export const componentRegistry: ComponentRegistry = {};

export const registerComponent = (
  name: string,
  component: React.ComponentType<any>
) => {
  componentRegistry[name] = component;
};

export const renderComponent = (
  type: string,
  props: any,
  key?: string
): ReactNode | null => {
  const Component = componentRegistry[type];

  if (!Component) {
    console.warn(`Component of type "${type}" not found in the registry.`);
    return null;
  }

  const { contentEntryKey, contentEntry, ...componentProps } = props;

  if (componentProps.content && Array.isArray(componentProps.content)) {
    return (
      <Component {...componentProps} key={key}>
        {componentProps.content.map((child: any) =>
          renderComponent(
            child.sys.contentType.sys.id,
            child.fields,
            child.sys.id
          )
        )}
      </Component>
    );
  }

  if (componentProps.content && typeof componentProps.content === 'string') {
    const [richTextContent, setRichTextContent] = useState<ReactNode | null>(
      null
    );

    useEffect(() => {
      richTextFromMarkdown(componentProps.content).then((document) =>
        setRichTextContent(documentToReactComponents(document))
      );
    }, [componentProps.content]);

    console.log('richTextContent', richTextContent);

    return (
      <Component {...componentProps} key={key}>
        {richTextContent}
      </Component>
    );
  }

  return <Component {...componentProps} key={key} />;
};
