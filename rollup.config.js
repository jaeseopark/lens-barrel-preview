import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';

export default [
    {
        input: 'src/index.ts',
        output: [
            {
                file: 'dist/lens-barrel-preview.js',
                format: 'umd',
                name: 'LensBarrelPreview',
                sourcemap: true,
                exports: 'named'
            },
            {
                file: 'dist/lens-barrel-preview.esm.js',
                format: 'es',
                sourcemap: true,
                exports: 'named'
            }
        ],
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                declaration: true,
                declarationDir: './dist'
            }),
            resolve(),
            copy({
                targets: [
                    { src: 'src/assets/*', dest: 'dist/assets' }
                ]
            })
        ]
    },
    {
        input: 'src/index.ts',
        output: {
            file: 'dist/lens-barrel-preview.min.js',
            format: 'umd',
            name: 'LensBarrelPreview',
            sourcemap: true,
            exports: 'named'
        },
        plugins: [
            typescript({
                tsconfig: './tsconfig.json',
                declaration: false
            }),
            resolve(),
            terser(),
            copy({
                targets: [
                    { src: 'src/assets/*', dest: 'dist/assets' }
                ]
            })
        ]
    }
];
