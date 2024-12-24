import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const card = migration.createContentType('card')
    .name('Card')
    .description('Container that groups related content and actions.');

  card.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  card.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .validations([{ in: ['1', '2', '3', '4', '5'] }])
    .defaultValue({ 'en-US': '1' });

  card.createField('variant')
    .type('Symbol')
    .name('Variant')
    .required(false)
    .validations([{ in: ['surface', 'classic', 'ghost'] }])
    .defaultValue({ 'en-US': 'surface' });

  card.createField('content')
    .type('Array')
    .name('Content')
    .required(false)
    .items({
      type: 'Link',
      linkType: 'Entry'
    });
};

export default migration;
