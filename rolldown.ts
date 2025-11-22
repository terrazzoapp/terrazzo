import {type RolldownOptions} from 'rolldown';
import {dts} from 'rolldown-plugin-dts';
import {readFileSync} from 'node:fs';
import {join} from "node:path";


export const defineConfig = (options: RolldownOptions): RolldownOptions => {

    const pkg = JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8'))
    return {
        platform: 'browser',
        plugins: [dts({resolve: true})],
        external: Object.keys(pkg.dependencies ?? {}).flatMap(k => [k, new RegExp(`^${k}/`)]),
        output: {
            dir: 'dist',
            format: 'es',
            sourcemap: true,
        },
        ...options,
    }
}