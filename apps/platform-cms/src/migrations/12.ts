import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const link = migration.editContentType('link');

  link.moveField('content').beforeField('asChild');
  link.moveField('url').afterField('content');

  link.changeFieldControl('url', 'builtin', 'urlEditor', {
    helpText: 'The URL to link to',
    isSingleLine: true,
  });
  link.changeFieldControl('content', 'builtin', 'urlEditor', {
    helpText: 'The text content of the link',
    isSingleLine: true,
  });
};

export default migration;
