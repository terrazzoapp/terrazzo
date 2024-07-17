/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  ignoreFiles: ['**/*.js', '**/*.ts', '**/*.tsx', '**/test/**/*'],
  rules: {
    'alpha-value-notation': 'number',
    'declaration-block-no-redundant-longhand-properties': null, // this is fine
    'hue-degree-notation': 'number',
    'lightness-notation': 'number',
    'no-descending-specificity': null, // this often leads to unsolvable riddles
    'number-max-precision': null, // in the running for dumbest rule ever created
    'order/properties-alphabetical-order': true, // let me find things
    'property-no-vendor-prefix': null, // we still need this
    'selector-class-pattern': null,
  },
};
