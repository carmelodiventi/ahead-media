import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const heading = migration.createContentType('heading').name('Heading');

  heading.createField('as')
    .type('Symbol')
    .name('As')
    .required(false)
    .validations([{ in: ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'] }])
    .defaultValue({ 'en-US': 'h1' });

  heading.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  heading.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .defaultValue({ 'en-US': '6' });

  heading.createField('weight')
    .type('Symbol')
    .name('Weight')
    .required(false)
    .validations([{ in: ['light', 'regular', 'medium', 'bold'] }]);

  heading.createField('align')
    .type('Symbol')
    .name('Align')
    .required(false)
    .validations([{ in: ['left', 'center', 'right'] }]);

  heading.createField('trim')
    .type('Symbol')
    .name('Trim')
    .required(false)
    .validations([{ in: ['normal', 'start', 'end', 'both'] }]);

  heading.createField('truncate')
    .type('Boolean')
    .name('Truncate')
    .required(false);

  heading.createField('wrap')
    .type('Symbol')
    .name('Wrap')
    .required(false)
    .validations([{ in: ['wrap', 'nowrap', 'pretty', 'balance'] }]);

  heading.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false);

  heading.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);

  // Margin props
  const marginProps = [
    'm', 'mx', 'my', 'mt', 'mr', 'mb', 'ml'
  ];

  marginProps.forEach(prop => {
    heading.createField(prop)
      .type('Symbol')
      .name(prop.toUpperCase())
      .required(false);
  });

  // Content field
  heading.createField('content')
    .type('Text')
    .name('Content')
    .required(false);
};

export default migration;
