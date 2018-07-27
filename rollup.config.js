import babelPlugin from "rollup-plugin-babel";

const input = 'raw/index.js';

export default [
    {
        input,
        output: {
            format: 'es',
            file: 'dist/hele.js'
        }
    }, {
        input,
        plugins: [
            babelPlugin()
        ],
        output: {
            format: 'umd',
            name: 'HEle',
            file: 'dist/hele.umd.js'
        }
    }
];
