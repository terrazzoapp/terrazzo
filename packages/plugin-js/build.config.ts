import { defineBuildConfig } from 'unbuild';

export default defineBuildConfig({
  entries: ['./src/index.ts'],
  declaration: 'node16',
  sourcemap: true,
  rollup: {
    emitCJS: true,
  },
});
