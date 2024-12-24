import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const contentType = migration.editContentType('container');

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

  contentType.moveField('contentEntry').beforeField('name');
  contentType.moveField('contentEntryKey').afterField('contentEntry');

  contentType.deleteField('name');
};

export default migration;
