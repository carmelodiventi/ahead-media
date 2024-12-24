import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const callout = migration.createContentType('callout')
    .name('Callout')
    .description('Short message to attract user’s attention.');

  callout.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  callout.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .validations([{ in: ['1', '2', '3'] }])
    .defaultValue({ 'en-US': '2' });

  callout.createField('variant')
    .type('Symbol')
    .name('Variant')
    .required(false)
    .validations([{ in: ['soft', 'surface', 'outline'] }])
    .defaultValue({ 'en-US': 'soft' });

  callout.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false)
    .validations([{ in: ['gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass', 'lime', 'mint', 'sky'] }]);

  callout.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);

  callout.createField('content')
    .type('Text')
    .name('Content')
    .required(false);


};

export default migration;
