import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const container = migration.editContentType('container');

  container.editField('name')
    .type('Symbol')
    .name('Name')
    .required(true);

  container.editField('content')
    .type('Array')
    .items({ type: 'Link', linkType: 'Entry' })
    .name('Content')
    .required(false);

  container.editField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .validations([{ in: ['1', '2', '3', '4'] }]);

  container.editField('display')
    .type('Symbol')
    .name('Display')
    .required(false);

  container.editField('align')
    .type('Symbol')
    .name('Align')
    .required(false)
    .validations([{ in: ['left', 'center', 'right'] }]);

  container.editField('type')
    .type('Symbol')
    .name('Type')
    .required(false);

  const sharedProps = [
    'p', 'px', 'py', 'pt', 'pr', 'pb', 'pl', 'width', 'minWidth', 'maxWidth',
    'height', 'minHeight', 'maxHeight', 'position', 'inset', 'top', 'right',
    'bottom', 'left', 'overflow', 'overflowX', 'overflowY', 'flexBasis',
    'flexShrink', 'flexGrow', 'gridArea', 'gridColumn', 'gridColumnStart',
    'gridColumnEnd', 'gridRow', 'gridRowStart', 'gridRowEnd'
  ];

  sharedProps.forEach(prop => {
    container.createField(prop)
      .type('Symbol')
      .name(prop.charAt(0).toUpperCase() + prop.slice(1))
      .required(false);
  });
};

export default migration;
