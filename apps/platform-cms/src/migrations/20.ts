import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const hero = migration.createContentType('hero')
    .name('Hero')
    .description('Hero content type')
    .displayField('contentEntry');

  hero.createField('contentEntry')
    .type('Symbol')
    .name('Content Entry')
    .required(true);

  hero.createField('contentEntryKey')
    .type('Symbol')
    .name('Content Entry Key')
    .required(false);

  hero.createField('content')
    .type('Array')
    .name('Content')
    .items({
      type: 'Link',
      linkType: 'Entry'
    })
    .required(false);
};

export default migration;
