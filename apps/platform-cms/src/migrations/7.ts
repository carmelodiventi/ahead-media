import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const text = migration.editContentType('text');

  text.createField('content')
    .type('Text')
    .name('Content')
    .required(false);
};

export default migration;
