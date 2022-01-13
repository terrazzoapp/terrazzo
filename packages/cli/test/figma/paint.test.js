import { expect } from 'chai';
import { gradientToCSS } from '../../dist/figma/paint.js';

describe('paint', () => {
  it('linear gradient', () => {
    // rad -> blue (to right)
    expect(
      gradientToCSS({
        type: 'GRADIENT_LINEAR',
        gradientHandlePositions: [
          { x: 0.00001, y: 0.49999 },
          { x: 1, y: 0.5 },
          { x: 0, y: 1 },
        ],
        gradientStops: [
          { color: { r: 1, g: 0, b: 0, a: 1 }, position: 0 },
          { color: { r: 0, g: 0, b: 1, a: 1 }, position: 1 },
        ],
      })
    ).to.equal('linear-gradient(90deg, #ff0000 0%, #0000ff 100%)');

    // teal -> blue -> violet (to bottom-right)
    expect(
      gradientToCSS({
        type: 'GRADIENT_LINEAR',
        gradientHandlePositions: [
          { x: 0, y: 0 },
          { x: 1, y: 1 },
          { x: -0.5, y: 0.5 },
        ],
        gradientStops: [
          { color: { r: 0.4424999952316284, g: 0.8999999761581421, b: 0.543150007724762, a: 1 }, position: 0 },
          { color: { r: 0, g: 0, b: 1, a: 1 }, position: 0.5520833134651184 },
          { color: { r: 0.2560001313686371, g: 0, b: 0.800000011920929, a: 1 }, position: 1 },
        ],
      })
    ).to.equal('linear-gradient(to right bottom, #71e58b 0%, #0000ff 55.21%, #4100cc 100%)');
  });

  // magenta -> blue (to bottom-left)
  expect(
    gradientToCSS({
      blendMode: 'NORMAL',
      type: 'GRADIENT_LINEAR',
      gradientHandlePositions: [
        { x: 0.9296874806477716, y: -0.11718749416468227 },
        { x: 0.12890621485712495, y: 1.2851562414061841 },
        { x: 0.22851561286233846, y: -0.5175781270600057 },
      ],
      gradientStops: [
        { color: { r: 0.949999988079071, g: 0.22562503814697266, b: 0.7906373143196106, a: 1 }, position: 0 },
        { color: { r: 0.3791668117046356, g: 0.14583337306976318, b: 0.875, a: 1 }, position: 1 },
      ],
    })
  ).to.equal('linear-gradient(-150.27deg, #f23aca 0%, #6125df 100%)');
  // TODO: calculate overshot gradients, e.g.:
  // linear-gradient(-150.27deg, #f23aca -4.9%, #6125df 113.47%)

  // yellow -> orange (to top-right)
  expect(
    gradientToCSS({
      type: 'GRADIENT_LINEAR',
      gradientHandlePositions: [
        { x: 1.0000000748914315, y: 0.7148437409205116 },
        { x: 5.141919334761269e-8, y: 0.09765627530486909 },
        { x: 1.3085938076992527, y: 0.21484372918439254 },
      ],
      gradientStops: [
        { color: { r: 0.949999988079071, g: 0.8775625228881836, b: 0.22562503814697266, a: 1 }, position: 0.11866136640310287 },
        { color: { r: 0.875, g: 0.40833336114883423, b: 0.14583337306976318, a: 1 }, position: 0.7677738070487976 },
      ],
    })
  ).to.equal('linear-gradient(-58.32deg, #f2e03a 21.02%, #df6825 76.44%)');
  // TODO: calculate to corners
});
