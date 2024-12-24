import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const text = migration.createContentType('text').name('Text');

  text.createField('as')
    .type('Symbol')
    .name('As')
    .required(false)
    .validations([{ in: ['span', 'div', 'label', 'p'] }])
    .defaultValue({ 'en-US': 'span' });

  text.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  text.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false);

  text.createField('weight')
    .type('Symbol')
    .name('Weight')
    .required(false)
    .validations([{ in: ['light', 'regular', 'medium', 'bold'] }]);

  text.createField('align')
    .type('Symbol')
    .name('Align')
    .required(false)
    .validations([{ in: ['left', 'center', 'right'] }]);

  text.createField('trim')
    .type('Symbol')
    .name('Trim')
    .required(false)
    .validations([{ in: ['normal', 'start', 'end', 'both'] }]);

  text.createField('truncate')
    .type('Boolean')
    .name('Truncate')
    .required(false);

  text.createField('wrap')
    .type('Symbol')
    .name('Wrap')
    .required(false)
    .validations([{ in: ['wrap', 'nowrap', 'pretty', 'balance'] }]);

  text.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false);

  text.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);
};

export default migration;
