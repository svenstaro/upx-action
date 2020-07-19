'use strict';
const decompressTar = require('decompress-tar');
const fileType = require('file-type');
const isStream = require('is-stream');
const lzmaNative = require('lzma-native');

module.exports = () => async input => {
	const isBuffer = Buffer.isBuffer(input);
	const type = isBuffer ? fileType(input) : null;

	if (!isBuffer && !isStream(input)) {
		return Promise.reject(new TypeError(`Expected a Buffer or Stream, got ${typeof input}`));
	}

	if (isBuffer && (!type || type.ext !== 'xz')) {
		return Promise.resolve([]);
	}

	const decompressor = lzmaNative.createDecompressor();
	const result = decompressTar()(decompressor);

	if (isBuffer) {
		decompressor.end(input);
	} else {
		input.pipe(decompressor);
	}

	return result;
};
