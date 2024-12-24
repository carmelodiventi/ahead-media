import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const contentTypes = [
    'button',
    'callout',
    'card',
    'flex',
    'grid',
    'text',
    'container',
    'section'
  ];

  contentTypes.forEach((contentTypeId) => {
    const contentType = migration.editContentType(contentTypeId);
    contentType.deleteField('contentEntry');
    contentType.deleteField('contentEntryKey');
  });

};

export default migration;
