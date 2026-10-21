'use strict';

const path = require('node:path');

// Desktop resources are read-only; user data must survive app upgrades.
const resourceRoot = process.env.EVERYVIDEO_RESOURCES_DIR || path.resolve(__dirname, '..');
const dataRoot = process.env.EVERYVIDEO_DATA_DIR || resourceRoot;
const downloadsDir = process.env.EVERYVIDEO_DOWNLOADS_DIR || path.join(resourceRoot, 'Download');

module.exports = { resourceRoot, dataRoot, downloadsDir };
