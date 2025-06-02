import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./src/index.ts'],
  declaration: 'node16',
  externals: ['yaml-to-momoa'],
  sourcemap: true,
  rollup: {
    emitCJS: true,
  },
});
