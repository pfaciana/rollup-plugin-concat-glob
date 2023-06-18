# Concatenate (with glob) Rollup Plugin

`rollup-plugin-concat-glob` is a Rollup JS plugin designed to simplify the process of managing multiple script files by allowing a glob-formatted string to be used as the input file(s). This tool scans the input glob pattern and concatenates all matching files into a single output file, significantly simplifying your project structure.

## Installation

You can install the plugin via npm or Yarn:

```shell
npm install rollup-plugin-concat-glob --save-dev
```

or

```shell
yarn add rollup-plugin-concat-glob --dev
```

## Example Usage

```js
import babel from '@rollup/plugin-babel';
import brotli from 'rollup-plugin-brotli';
import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import terser from '@rollup/plugin-terser';
import concatFiles from 'rollup-plugin-concat-glob';

export default [
	// Example 1
	{
		input: 'js/src/**/*.js',
		output: [
			{file: 'js/dist/glob.js', format: 'iife'},
			{file: 'js/dist/glob.min.js', format: 'iife', plugins: [terser(), brotli({options: {level: 11}})]},
		],
		plugins: [
			resolve(),
			commonjs(),
			concatFiles(),
			babel({presets: [['@babel/preset-env']], babelHelpers: 'bundled'}),
		],
	},
	// Example 2
	{
		input: {
			'file-1.js': 'js/src/dir1/**/*.js',
			'file-2.js': ['js/src/index.js', 'js/src/dir2/*.js']
		},
		output: [
			{dir: 'js/dist', chunkFileNames: '[name].js', format: 'es',},
			{dir: 'js/dist', chunkFileNames: '[name].min.js', format: 'es', plugins: [terser(), brotli({options: {level: 11}})],},
		],
		plugins: [
			resolve(),
			commonjs(),
			concatFiles({iife: false}),
			babel({presets: [['@babel/preset-env'], ['@babel/preset-react']], babelHelpers: 'bundled'}),
		],
	},
];
```

## Options

### input

The `input` can be a string, array, or object literal.

* If the input is a string or array, those files will be concatenated into the user defined `output.file` in the rollup config.
* If the input is an object, then the key will be the file name that will be created for its respective value (a string or array of strings as the glob pattern), and it will be saved in the user defined `output.dir` in the rollup config. It's recommended to define `output.chunkFileNames` when using `output.dir`. In that case, the input object key represents the Rollup `[name]` output variable. So if an input key is `file-1.js`, then the `[name]` variable will be `file-1` for the chunk file name.

### config

* `iife`: determines if a file/chunk is wrapped with a JS IIFE (Immediately Invoked Function Expression).
    * The default value is `true`.