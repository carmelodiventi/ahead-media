import { MigrationFunction } from 'contentful-migration';

const migration: MigrationFunction = (migration) => {
  const button = migration.createContentType('button')
    .name('Button')
    .description('Trigger an action or event, such as submitting a form or displaying a dialog.');

  button.createField('asChild')
    .type('Boolean')
    .name('As Child')
    .required(false);

  button.createField('size')
    .type('Symbol')
    .name('Size')
    .required(false)
    .validations([{ in: ['1', '2', '3', '4'] }])
    .defaultValue({ 'en-US': '2' });

  button.createField('variant')
    .type('Symbol')
    .name('Variant')
    .required(false)
    .validations([{ in: ['classic', 'solid', 'soft', 'surface', 'outline', 'ghost'] }])
    .defaultValue({ 'en-US': 'solid' });

  button.createField('color')
    .type('Symbol')
    .name('Color')
    .required(false)
    .validations([{ in: ['gray', 'gold', 'bronze', 'brown', 'yellow', 'amber', 'orange', 'tomato', 'red', 'ruby', 'crimson', 'pink', 'plum', 'purple', 'violet', 'iris', 'indigo', 'blue', 'cyan', 'teal', 'jade', 'green', 'grass', 'lime', 'mint', 'sky'] }]);

  button.createField('highContrast')
    .type('Boolean')
    .name('High Contrast')
    .required(false);

  button.createField('radius')
    .type('Symbol')
    .name('Radius')
    .required(false)
    .validations([{ in: ['none', 'small', 'medium', 'large', 'full'] }]);

  button.createField('loading')
    .type('Boolean')
    .name('Loading')
    .required(false);

  button.createField('content')
    .type('Text')
    .name('Content')
    .required(false);
};

export default migration;
