import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const contentTypes = ['flex', 'grid', 'section'];

  contentTypes.forEach((contentType) => {
    const type = migration.editContentType(contentType);

    type.createField('content')
      .type('Array')
      .name('Content')
      .items({ type: 'Link', linkType: 'Entry' })
      .required(false);
  });
};

export default migration;
