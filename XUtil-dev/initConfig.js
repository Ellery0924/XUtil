var Path = require('path'),
	config = require('../config'),
	renderedConfig = {};

var root = Path.dirname(process.cwd());

var srcPaths = config.paths,
	i,
	renderedPath,
	targetPaths = [];

for (i = 0; i < srcPaths.length; i++) {
	renderedPath = root + srcPaths[i];
	targetPaths.push(renderedPath);
}

renderedConfig.targetPaths = targetPaths;

module.exports = renderedConfig;
