const fs = require('fs');
const { join, sep } = require('path');

function getDetails(data) {
	const matadata = data.match(/---(.*(\r)?\n)*---/g)[0];
	const details =  matadata.match(/(.*):(.*)/g).reduce((obj, detail) => {
		const value = detail.substr(detail.indexOf(':') + 2);
		const key = detail.substr(0, detail.indexOf(':'));
		obj[key] = value;
		return obj;
	}, {});
	return details;
}

function getPreview(data) {
	let preview = data.replace(/---(.*(\r)?\n)*---/, '').replace(/\[.*\]\(.*\)/g, '').replace(/(\r)?\n/,'');
	preview = preview.substr(0, (preview.indexOf('\n') -1));
	return preview.length < 500? preview : preview.substr(0, 500);
}

function getFolders(source) {
	const isDirectory = source => fs.lstatSync(source).isDirectory();
	const isFile = source => !fs.lstatSync(source).isDirectory();
	const getAllListings = source =>
		fs.readdirSync(source).map(name => join(source, name));
	let allContent = getAllListings(source);
	const edges = allContent.filter(isFile).map(file => {
		const data = fs.readFileSync(file, 'utf-8');
		// console.log('get folders', JSON.stringify(data))
		return {
			id: file.substr(file.lastIndexOf(sep) + 1),
			path: file,
			details: getDetails(data),
			preview: getPreview(data)
		};
	});
	const nodes = allContent.filter(isDirectory).map(dir => getFolders(dir));
	const result = {
		id: source.substr(source.lastIndexOf(sep) + 1)
	};
	if (nodes.length) {
		result.nodes = nodes;
	}
	if (edges.length) {
		result.edges = edges;
	}
	return result;
}

function generateFileList(src) {
	return getFolders(src);
}

module.exports = {
	generateFileList
};