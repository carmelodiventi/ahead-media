import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const contentTypes = [
    'button',
    'callout',
    'card',
    'flex',
    'grid',
    'text',
    'section',
    'heading',
    'link',
  ];

  contentTypes.forEach((contentTypeId) => {
    const contentType = migration.editContentType(contentTypeId);

    contentType
      .createField('contentEntry')
      .type('Symbol')
      .name('Content Entry')
      .required(false);

    contentType.displayField('contentEntry');

    contentType
      .createField('contentEntryKey')
      .type('Symbol')
      .name('Content Entry Key')
      .required(false);

    contentType.moveField('contentEntry').beforeField('asChild');
    contentType.moveField('contentEntryKey').afterField('contentEntry');

  });




};

export default migration;
