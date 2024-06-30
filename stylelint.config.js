/** @type {import('stylelint').Config} */
export default {
  extends: ['stylelint-config-standard'],
  plugins: ['stylelint-order'],
  rules: {
    'alpha-value-notation': 'number',
    'declaration-block-no-redundant-longhand-properties': null, // this is fine
    'no-descending-specificity': null, // this often leads to unsolvable riddles
    'order/properties-alphabetical-order': true, // let me find things
    'property-no-vendor-prefix': null, // we still need this
    'selector-class-pattern': null,
  },
};
