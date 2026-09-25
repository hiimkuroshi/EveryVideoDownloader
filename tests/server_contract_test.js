'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const server = fs.readFileSync(path.join(root, 'server.js'), 'utf8');
const acceleration = fs.readFileSync(path.join(root, 'lib', 'download-acceleration.js'), 'utf8');
const progress = fs.readFileSync(path.join(root, 'lib', 'download-progress.js'), 'utf8');
const client = fs.readFileSync(path.join(root, 'public', 'script.js'), 'utf8');

const getRoutes = [...server.matchAll(/app\.get\(['"]([^'"]+)['"]/g)].map(match => match[1]);
const duplicateGetRoutes = [...new Set(getRoutes.filter((route, index) => getRoutes.indexOf(route) !== index))];
assert.deepEqual(duplicateGetRoutes, [], `Duplicate GET routes: ${duplicateGetRoutes.join(', ')}`);

assert.match(server, /process\.env\.EVERYVIDEO_PYTHON/, 'Python runtime must support an explicit executable path');
assert.match(server, /findExecutableOnPath\(\['py\.exe', 'python\.exe', 'python3\.exe'\]\)/, 'Windows Python fallback resolution is missing');
assert.match(server, /child\.once\('spawn',[\s\S]*?res\.json\(\{ success: true, path: targetDir/, 'Open-folder must confirm process spawn before reporting success');
assert.match(server, /describeProcessError\(error, 'Python extractor'\)/, 'Extractor process errors must be normalized');
assert.match(server, /buildDownloadAcceleration/, 'Download acceleration option builder must be wired');
assert.match(server, /hasAria2c/, 'Config capability response must expose aria2 availability');
assert.match(acceleration, /dash,m3u8:native/, 'External downloader must keep manifest downloads native');
assert.match(server, /diagnostic: 'fallback'/, 'Auto engine must report native fallback');
assert.match(server, /parseAria2Progress/, 'aria2 progress parser must be wired into the SSE stream');
assert.match(server, /createProcessLineParser/, 'download output must handle CR/LF progress split across chunks');
assert.match(server, /CDN fastest host/, 'CDN diagnostics must expose a host label');
assert.match(server, /cdnMatch\[1\]\.toLowerCase\(\)/, 'CDN diagnostics must normalize the host and omit the URL');
assert.match(server, /BILIBILI_REFERER/, 'Bilibili requests must carry a browser referer to avoid upstream 412 responses');
assert.match(server, /isBilibiliUrl\(url\)/, 'Bilibili-only request headers must be scoped by URL host');
assert.match(server, /taskkill[\s\S]*?\/t[\s\S]*?\/f/, 'Windows cancel must terminate the full yt-dlp/aria2 process tree');

const contentTypeGuards = [...client.matchAll(/contentType\.includes\('application\/json'\)/g)];
assert.ok(contentTypeGuards.length >= 3, 'Client API handlers must guard non-JSON error responses');
assert.match(client, /if \(!res\.ok \|\| !data\.success\)/, 'Open-folder client must surface backend launch failures');
assert.match(client, /if \(data\.progress\)/, 'Client must render normalized progress events');
assert.match(progress, /parseAria2Progress/, 'aria2 progress parser module is missing');

console.log(`Server contract passed: ${getRoutes.length} unique GET routes and guarded process/API errors.`);
