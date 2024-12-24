import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const blockquote = migration.createContentType('blockquote').name('Blockquote');

  blockquote.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  blockquote.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false);

  blockquote.createField('weight')
    .type('Symbol')
    .name('Weight')
    .required(false)
    .validations([{ in: ['light', 'regular', 'medium', 'bold'] }]);

  blockquote.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false);

  blockquote.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);

  blockquote.createField('truncate')
    .type('Boolean')
    .name('Truncate')
    .required(false);

  blockquote.createField('wrap')
    .type('Symbol')
    .name('Wrap')
    .required(false)
    .validations([{ in: ['wrap', 'nowrap', 'pretty', 'balance'] }]);

  blockquote.createField('content')
    .type('Text')
    .name('Content')
    .required(false);
};

export default migration;
