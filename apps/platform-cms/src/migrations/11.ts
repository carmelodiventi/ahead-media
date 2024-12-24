import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const link = migration.editContentType('link');

  link.createField('url')
    .type('Symbol')
    .name('URL')
    .required(true);

};

export default migration;
