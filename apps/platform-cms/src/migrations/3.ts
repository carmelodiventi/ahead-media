import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const section = migration.createContentType('section').name('Section');

  section.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  section.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .validations([{ in: ['1', '2', '3', '4'] }])
    .defaultValue({ 'en-US': '3' });

  section.createField('display')
    .type('Symbol')
    .name('Display')
    .required(false);

  // Shared props
  const sharedProps = [
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'width', 'minWidth', 'maxWidth',
    'height', 'minHeight', 'maxHeight', 'position', 'inset', 'top', 'right',
    'bottom', 'left', 'overflow', 'overflowX', 'overflowY', 'flexBasis',
    'flexShrink', 'flexGrow', 'gridArea', 'gridColumn', 'gridColumnStart',
    'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd'
  ];

  sharedProps.forEach(prop => {
    section.createField(prop)
      .type('Symbol')
      .name(prop.charAt(0).toUpperCase() + prop.slice(1))
      .required(false);
  });
};

export default migration;
