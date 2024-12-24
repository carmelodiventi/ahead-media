import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const grid = migration.createContentType('grid').name('Grid');

  grid.createField('as')
    .type('Symbol')
    .name('As')
    .required(false)
    .validations([{ in: ['div', 'span'] }]);

  grid.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  grid.createField('display')
    .type('Symbol')
    .name('Display')
    .required(false);

  grid.createField('areas')
    .type('Symbol')
    .name('Areas')
    .required(false);

  grid.createField('columns')
    .type('Symbol')
    .name('Columns')
    .required(false);

  grid.createField('rows')
    .type('Symbol')
    .name('Rows')
    .required(false);

  grid.createField('flow')
    .type('Symbol')
    .name('Flow')
    .required(false);

  grid.createField('align')
    .type('Symbol')
    .name('Align')
    .required(false);

  grid.createField('justify')
    .type('Symbol')
    .name('Justify')
    .required(false)
    .validations([{ in: ['start', 'center', 'end', 'between'] }]);

  grid.createField('gap')
    .type('Symbol')
    .name('Gap')
    .required(false);

  grid.createField('gapX')
    .type('Symbol')
    .name('Gap X')
    .required(false);

  grid.createField('gapY')
    .type('Symbol')
    .name('Gap Y')
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
    grid.createField(prop)
      .type('Symbol')
      .name(prop.charAt(0).toUpperCase() + prop.slice(1))
      .required(false);
  });
};

export default migration;
