import fs from 'fs';
import path from 'path';
import {normalizePath, createFilter} from '@rollup/pluginutils';
import {globSync} from 'glob'

function getOutputFile() {
	const file = [...arguments].find(Boolean);
	return file ? path.basename(file) : false;
}

function iifeCode(content, cond = true) {
	return cond ? `(function () { \n ${content} \n })();` : content;
}

export default function concatGlob(options = {}) {
	const filter = createFilter(options.include, options.exclude);

	let inputs = {};

	let {iife: fileIife = true} = options;

	let chunks = {};

	return {
		name: 'rollup-plugin-concat-glob',

		async options(opts) {
			if (typeof opts.input !== 'object') {
				opts.input = [opts.input];
			}
			if (Array.isArray(opts.input)) {
				opts.input = opts.input.reduce((acc, curr, index) => {
					acc[isNaN(index) ? index : `${index}.js`] = curr;
					return acc;
				}, {})
			}

			inputs = {...opts.input};
			opts.input = false;

			return opts;
		},

		async buildStart(opts) {
			Object.entries(inputs).forEach(([outputFile, pattern]) => {
				const fileName = getOutputFile(outputFile);
				let content = [];
				const files = globSync(pattern);
				files.forEach(file => {
					if (!filter(file)) {
						return;
					}
					this.addWatchFile(file);
					content.push(iifeCode(fs.readFileSync(file, 'utf-8'), fileIife));
				});
				chunks[fileName] = content.join("\n");
				this.emitFile({type: 'chunk', id: fileName});
			});
		},

		async resolveId(source, importer, options) {
			return source in chunks ? source : null;
		},

		async load(id) {
			return id in chunks ? chunks[id] : null;
		},

		outputOptions(outputOptions) {
			if (outputOptions.file) {
				outputOptions.dir = path.dirname(outputOptions.file);
				outputOptions.chunkFileNames = path.basename(outputOptions.file);
				outputOptions.file = undefined;
			}

			return outputOptions;
		},
	};
};