import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const contentTypes = ['button', 'callout', 'card', 'flex', 'grid', 'text', "container", "section", "heading", "link"];

  contentTypes.forEach((contentTypeId) => {
    const contentType = migration.editContentType(contentTypeId);

    contentType.createField('contentEntry')
      .type('Link')
      .name('Content Entry')
      .linkType('Entry')
      .required(false);

    contentType.createField('contentEntryKey')
      .type('Symbol')
      .name('Content Entry Key')
      .required(false);
  });
};

export default migration;
