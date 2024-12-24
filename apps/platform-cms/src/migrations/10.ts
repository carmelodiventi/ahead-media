import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const link = migration.editContentType('link');

  link.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  link.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false);

  link.createField('weight')
    .type('Symbol')
    .name('Weight')
    .required(false)
    .validations([{ in: ['light', 'regular', 'medium', 'bold'] }]);

  link.createField('trim')
    .type('Symbol')
    .name('Trim')
    .required(false)
    .validations([{ in: ['normal', 'start', 'end', 'both'] }]);

  link.createField('truncate')
    .type('Boolean')
    .name('Truncate')
    .required(false);

  link.createField('wrap')
    .type('Symbol')
    .name('Wrap')
    .required(false)
    .validations([{ in: ['wrap', 'nowrap', 'pretty', 'balance'] }]);

  link.createField('underline')
    .type('Symbol')
    .name('Underline')
    .required(false)
    .validations([{ in: ['auto', 'always', 'hover', 'none'] }])
    .defaultValue({ 'en-US': 'auto' });

  link.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false);

  link.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);

  link.createField('content')
    .type('Text')
    .name('Content')
    .required(false);

  // Common margin props
  const marginProps = ['m', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'];
  marginProps.forEach(prop => {
    link.createField(prop)
      .type('Symbol')
      .name(prop.toUpperCase())
      .required(false);
  });
};

export default migration;
