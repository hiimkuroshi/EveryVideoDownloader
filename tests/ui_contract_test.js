'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'public', 'index.html'), 'utf8');
const script = fs.readFileSync(path.join(root, 'public', 'script.js'), 'utf8');
const i18n = fs.readFileSync(path.join(root, 'public', 'i18n.js'), 'utf8');

const htmlIds = [...html.matchAll(/\bid=["']([^"']+)["']/g)].map(match => match[1]);
const uniqueIds = new Set(htmlIds);
assert.equal(uniqueIds.size, htmlIds.length, 'HTML must not contain duplicate IDs');

const staticScriptIds = new Set(
    [...script.matchAll(/(?:getElementById|\$)\(["']([^"']+)["']\)/g)].map(match => match[1])
);
const missingIds = [...staticScriptIds].filter(id => !uniqueIds.has(id));
assert.deepEqual(missingIds, [], `Script references missing DOM IDs: ${missingIds.join(', ')}`);

for (const panel of ['tab-workstation', 'tab-queue', 'tab-advanced', 'tab-settings']) {
    assert.match(html, new RegExp(`data-target=["']${panel}["']`), `Missing tab trigger for ${panel}`);
    assert.match(html, new RegExp(`id=["']${panel}["']`), `Missing tab panel ${panel}`);
}

assert.match(html, /href=["']#main["'][^>]*>Bỏ qua/, 'Missing skip link');
assert.match(html, /href=["']graphite-signal\.css["']/, 'Graphite Signal stylesheet is not linked');
assert.doesNotMatch(html, /powered\s+by\s+yt-dlp/i, 'Legacy engine attribution is still visible');
assert.doesNotMatch(i18n, /powered\s+by\s+yt-dlp/i, 'Legacy engine attribution remains in translations');
for (const id of ['bilibiliDownloadEngine', 'bilibiliAria2Connections', 'bilibiliAria2Status']) {
    assert.ok(uniqueIds.has(id), `Missing Bilibili acceleration control: ${id}`);
}
assert.equal(uniqueIds.size, 151, 'Unexpected DOM hook count; check accidental ID removal/addition');

console.log(`UI contract passed: ${uniqueIds.size} unique IDs, ${staticScriptIds.size} script hooks.`);
