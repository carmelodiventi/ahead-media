import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const flex = migration.createContentType('flex').name('Flex');

  flex.createField('as')
    .type('Symbol')
    .name('As')
    .required(false)
    .validations([{ in: ['div', 'span'] }])
    .defaultValue({ 'en-US': 'div' });

  flex.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  flex.createField('display')
    .type('Symbol')
    .name('Display')
    .required(false);

  flex.createField('direction')
    .type('Symbol')
    .name('Direction')
    .required(false);

  flex.createField('align')
    .type('Symbol')
    .name('Align')
    .required(false);

  flex.createField('justify')
    .type('Symbol')
    .name('Justify')
    .required(false)
    .validations([{ in: ['start', 'center', 'end', 'between'] }]);

  flex.createField('wrap')
    .type('Symbol')
    .name('Wrap')
    .required(false)
    .validations([{ in: ['nowrap', 'wrap', 'wrap-reverse'] }]);

  flex.createField('gap')
    .type('Symbol')
    .name('Gap')
    .required(false);

  flex.createField('gapX')
    .type('Symbol')
    .name('Gap X')
    .required(false);

  flex.createField('gapY')
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
    flex.createField(prop)
      .type('Symbol')
      .name(prop.charAt(0).toUpperCase() + prop.slice(1))
      .required(false);
  });
};

export default migration;
